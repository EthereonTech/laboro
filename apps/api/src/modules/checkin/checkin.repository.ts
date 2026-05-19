import { ApplicationStatus } from '@prisma/client'
import { prisma } from '../../lib/prisma'

export async function findConfirmedApplication(shiftId: string, workerId: string) {
  return prisma.shiftApplication.findFirst({
    where: {
      shift_id: shiftId,
      worker_id: workerId,
      status: ApplicationStatus.CONFIRMED,
    },
    include: {
      shift: {
        include: {
          business: { select: { address: true, user_id: true, trade_name: true } },
        },
      },
    },
  })
}

export async function recordCheckin(
  shiftId: string,
  workerId: string,
  lat: number,
  lng: number,
) {
  return prisma.shiftApplication.update({
    where: { shift_id_worker_id: { shift_id: shiftId, worker_id: workerId } },
    data: {
      checkin_at: new Date(),
      checkin_lat: lat,
      checkin_lng: lng,
    },
  })
}

export async function recordCheckout(shiftId: string, workerId: string, hoursWorked: number) {
  return prisma.shiftApplication.update({
    where: { shift_id_worker_id: { shift_id: shiftId, worker_id: workerId } },
    data: {
      checkout_at: new Date(),
      hours_worked: hoursWorked,
      status: ApplicationStatus.COMPLETED,
    },
  })
}
