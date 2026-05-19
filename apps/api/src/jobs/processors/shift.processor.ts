import { Job } from 'bullmq'
import { prisma } from '../../lib/prisma'
import { ApplicationStatus } from '@prisma/client'

interface NoCandidatesAlertData {
  shiftId: string
  businessId: string
}

interface ShiftReminderData {
  shiftId: string
  workerId: string
}

export async function shiftProcessor(job: Job): Promise<void> {
  if (job.name === 'no-candidates-alert') {
    const { shiftId, businessId } = job.data as NoCandidatesAlertData

    const count = await prisma.shiftApplication.count({
      where: { shift_id: shiftId, status: { not: ApplicationStatus.CANCELLED } },
    })

    if (count === 0) {
      const shift = await prisma.shift.findFirst({ where: { id: shiftId } })
      if (!shift) return

      console.info({
        event: 'shift.no-candidates-alert',
        shift_id: shiftId,
        business_id: businessId,
        starts_at: shift.starts_at,
      })

      // TODO: enqueue notification job to alert business via push/WhatsApp
    }

    return
  }

  if (job.name === 'shift-reminder') {
    const { shiftId, workerId } = job.data as ShiftReminderData

    console.info({
      event: 'shift.reminder',
      shift_id: shiftId,
      worker_id: workerId,
    })

    // TODO: enqueue notification job
    return
  }
}
