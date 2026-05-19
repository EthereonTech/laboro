import { Job } from 'bullmq'
import { EscrowStatus } from '@prisma/client'
import { releaseEscrow } from '../../modules/payments/payments.service'
import { prisma } from '../../lib/prisma'
import { asaas } from '../../lib/asaas'
import { updateEscrowStatus } from '../../modules/payments/payments.repository'
import { notificationsQueue } from '../../jobs'

interface ReleaseEscrowData {
  shiftId: string
  workerId: string
}

interface ExpirePixData {
  escrowId: string
}

export async function escrowProcessor(job: Job): Promise<void> {
  if (job.name === 'release-escrow') {
    const { shiftId, workerId } = job.data as ReleaseEscrowData
    console.info({ event: 'escrow.release.start', shift_id: shiftId, worker_id: workerId })

    const escrow = await prisma.escrowTransaction.findFirst({
      where: { shift_id: shiftId, worker_id: workerId },
    })
    await releaseEscrow(shiftId, workerId)

    console.info({ event: 'escrow.release.success', shift_id: shiftId, worker_id: workerId })

    // Notificar trabalhador sobre pagamento liberado
    const worker = await prisma.worker.findFirst({
      where: { id: workerId },
      include: { user: { select: { id: true } } },
    })
    if (worker && escrow) {
      await notificationsQueue.add(
        'payment-released',
        { workerId: worker.user.id, amount: Number(escrow.worker_amount) },
        { jobId: `payment-released-${shiftId}-${workerId}` },
      )
    }

    // Agendar notificação de avaliação pendente para 2h depois
    await notificationsQueue.add(
      'pending-rating',
      { shiftId, workerId },
      { delay: 2 * 60 * 60 * 1000, jobId: `pending-rating-${shiftId}-${workerId}` },
    )
    return
  }

  if (job.name === 'expire-pix') {
    const { escrowId } = job.data as ExpirePixData

    const escrow = await prisma.escrowTransaction.findFirst({
      where: { id: escrowId, status: EscrowStatus.RESERVED },
    })
    if (!escrow) return // already confirmed or cancelled

    if (escrow.asaas_payment_id) {
      await asaas.cancelPayment(escrow.asaas_payment_id)
    }

    await updateEscrowStatus(escrowId, EscrowStatus.FAILED)

    console.info({ event: 'escrow.pix.expired', escrow_id: escrowId })
    return
  }
}
