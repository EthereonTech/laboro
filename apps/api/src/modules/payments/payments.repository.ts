import { EscrowStatus } from '@prisma/client'
import { prisma } from '../../lib/prisma'

export async function createEscrowTransaction(data: {
  shift_id: string
  worker_id: string
  business_id: string
  gross_amount: number
  laboro_fee: number
  worker_amount: number
  idempotency_key: string
}) {
  return prisma.escrowTransaction.create({
    data: {
      ...data,
      status: EscrowStatus.RESERVED,
      reserved_at: new Date(),
    },
  })
}

export async function findEscrowByShiftAndWorker(shiftId: string, workerId: string) {
  return prisma.escrowTransaction.findFirst({
    where: { shift_id: shiftId, worker_id: workerId },
  })
}

export async function findEscrowByPaymentId(asaasPaymentId: string) {
  return prisma.escrowTransaction.findFirst({
    where: { asaas_payment_id: asaasPaymentId },
  })
}

export async function updateEscrowStatus(
  id: string,
  status: EscrowStatus,
  extra: Partial<{
    asaas_payment_id: string
    asaas_transfer_id: string
    confirmed_at: Date
    released_at: Date
    refunded_at: Date
  }> = {},
) {
  return prisma.escrowTransaction.update({
    where: { id },
    data: { status, ...extra },
  })
}
