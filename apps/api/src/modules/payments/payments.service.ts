import { EscrowStatus } from '@prisma/client'
import { asaas, verifyWebhookSignature, PIX_KEY_TYPE_MAP } from '../../lib/asaas'
import { escrowQueue } from '../../jobs'
import { findBusinessById } from '../businesses/businesses.repository'
import { prisma } from '../../lib/prisma'
import {
  createEscrowTransaction,
  findEscrowByPaymentId,
  findEscrowByShiftAndWorker,
  updateEscrowStatus,
} from './payments.repository'
import { ReserveEscrowInput, PixQrCode } from './payments.types'
import { WebhookBody } from './payments.schema'

export async function reserveEscrow(input: ReserveEscrowInput): Promise<PixQrCode | undefined> {
  const idempotencyKey = `escrow-${input.shiftId}-${input.workerId}`

  const existing = await findEscrowByShiftAndWorker(input.shiftId, input.workerId)
  if (existing) {
    if (existing.asaas_payment_id && existing.status === EscrowStatus.RESERVED) {
      const qr = await asaas.getPixQrCode(existing.asaas_payment_id)
      return { payload: qr.payload, encoded_image: qr.encodedImage, expiration_date: qr.expirationDate }
    }
    return undefined
  }

  const escrow = await createEscrowTransaction({
    shift_id: input.shiftId,
    worker_id: input.workerId,
    business_id: input.businessId,
    gross_amount: input.grossAmount,
    laboro_fee: input.laboroFee,
    worker_amount: input.workerAmount,
    idempotency_key: idempotencyKey,
  })

  const business = await findBusinessById(input.businessId)
  if (!business?.asaas_customer_id) {
    // Asaas customer not yet configured — skip charge creation (dev mode)
    return undefined
  }

  const dueDate = new Date(Date.now() + 30 * 60 * 1000)
  const payment = await asaas.createPixCharge({
    customer: business.asaas_customer_id,
    billingType: 'PIX',
    value: input.grossAmount,
    dueDate: dueDate.toISOString().split('T')[0],
    externalReference: idempotencyKey,
    description: `Laboro - Turno ${input.shiftId}`,
  })

  await updateEscrowStatus(escrow.id, EscrowStatus.RESERVED, {
    asaas_payment_id: payment.id,
  })

  // Schedule Pix expiry in 30 min
  await escrowQueue.add(
    'expire-pix',
    { escrowId: escrow.id },
    { delay: 30 * 60 * 1000, jobId: `expire-pix-${escrow.id}` },
  )

  const qr = await asaas.getPixQrCode(payment.id)
  return { payload: qr.payload, encoded_image: qr.encodedImage, expiration_date: qr.expirationDate }
}

export async function processWebhook(token: string, body: WebhookBody): Promise<void> {
  if (!verifyWebhookSignature(token)) {
    throw appError('FORBIDDEN', 'Token de webhook inválido')
  }

  if (body.event === 'PAYMENT_CONFIRMED' && body.payment?.id) {
    const escrow = await findEscrowByPaymentId(body.payment.id)
    if (!escrow || escrow.status !== EscrowStatus.RESERVED) return

    await updateEscrowStatus(escrow.id, EscrowStatus.CONFIRMED, {
      confirmed_at: new Date(),
    })
  }
}

export async function releaseEscrow(shiftId: string, workerId: string): Promise<void> {
  const escrow = await findEscrowByShiftAndWorker(shiftId, workerId)
  if (!escrow) throw appError('ESCROW_NOT_CONFIRMED', 'Escrow não encontrado para este turno')
  if (escrow.status !== EscrowStatus.CONFIRMED) {
    throw appError('ESCROW_NOT_CONFIRMED', 'Escrow ainda não confirmado pelo banco')
  }

  const worker = await prisma.worker.findFirst({ where: { id: workerId } })
  if (!worker?.pix_key || !worker?.pix_key_type) {
    throw new Error(`Trabalhador ${workerId} sem chave Pix cadastrada`)
  }

  const transfer = await asaas.createTransfer({
    value: Number(escrow.worker_amount),
    pixAddressKey: worker.pix_key,
    pixAddressKeyType: PIX_KEY_TYPE_MAP[worker.pix_key_type],
    description: `Laboro - Turno ${shiftId}`,
  })

  await updateEscrowStatus(escrow.id, EscrowStatus.RELEASED, {
    asaas_transfer_id: transfer.id,
    released_at: new Date(),
  })

  await prisma.worker.update({
    where: { id: workerId },
    data: { total_shifts: { increment: 1 } },
  })
}

export async function refundEscrowFull(shiftId: string, workerId: string): Promise<void> {
  const escrow = await findEscrowByShiftAndWorker(shiftId, workerId)
  if (!escrow) return
  if (escrow.status === EscrowStatus.REFUNDED || escrow.status === EscrowStatus.FAILED) return

  if (escrow.asaas_payment_id) {
    await asaas.refundPayment(escrow.asaas_payment_id)
  }

  await updateEscrowStatus(escrow.id, EscrowStatus.REFUNDED, {
    refunded_at: new Date(),
  })
}

export async function refundEscrowPartial(
  shiftId: string,
  workerId: string,
  refundAmount: number,
): Promise<void> {
  const escrow = await findEscrowByShiftAndWorker(shiftId, workerId)
  if (!escrow) return
  if (escrow.status === EscrowStatus.REFUNDED || escrow.status === EscrowStatus.FAILED) return

  if (escrow.asaas_payment_id) {
    await asaas.refundPayment(escrow.asaas_payment_id, refundAmount)
  }

  await updateEscrowStatus(escrow.id, EscrowStatus.REFUNDED, {
    refunded_at: new Date(),
  })
}

function appError(code: string, message: string) {
  return Object.assign(new Error(message), { appCode: code })
}
