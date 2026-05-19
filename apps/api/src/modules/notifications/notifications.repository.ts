import { Specialty } from '@prisma/client'
import { prisma } from '../../lib/prisma'

export async function savePushToken(userId: string, pushToken: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { push_token: pushToken },
  })
}

export async function findUserNotificationData(userId: string) {
  return prisma.user.findFirst({
    where: { id: userId },
    select: { id: true, phone: true, push_token: true },
  })
}

export async function findWorkersBySpecialty(specialty: Specialty) {
  return prisma.worker.findMany({
    where: {
      specialties: { some: { specialty } },
      user: { deleted_at: null },
      suspended_until: null,
    },
    include: {
      user: { select: { id: true, phone: true, push_token: true } },
    },
  })
}
