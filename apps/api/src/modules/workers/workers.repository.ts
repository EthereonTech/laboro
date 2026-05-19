import { Specialty, PixKeyType } from '@prisma/client'
import { prisma } from '../../lib/prisma'

export async function findWorkerByUserId(userId: string) {
  return prisma.worker.findFirst({
    where: { user_id: userId, user: { deleted_at: null } },
    include: {
      user: { select: { id: true, full_name: true, phone: true, photo_url: true, is_verified: true } },
      specialties: { select: { specialty: true } },
    },
  })
}

export async function findWorkerById(workerId: string) {
  return prisma.worker.findFirst({
    where: { id: workerId, user: { deleted_at: null } },
    include: {
      user: { select: { id: true, full_name: true, phone: true, photo_url: true, is_verified: true } },
      specialties: { select: { specialty: true } },
    },
  })
}

export async function updateWorkerProfile(
  workerId: string,
  userId: string,
  data: { full_name?: string; cpf?: string; pix_key?: string; pix_key_type?: PixKeyType },
) {
  const { full_name, cpf, ...workerData } = data

  return prisma.$transaction(async (tx) => {
    if (full_name !== undefined || cpf !== undefined) {
      await tx.user.update({
        where: { id: userId },
        data: { ...(full_name !== undefined ? { full_name } : {}), ...(cpf !== undefined ? { cpf } : {}) },
      })
    }
    return tx.worker.update({
      where: { id: workerId },
      data: workerData,
      include: {
        user: { select: { id: true, full_name: true, phone: true, photo_url: true, is_verified: true } },
        specialties: { select: { specialty: true } },
      },
    })
  })
}

export async function updateWorkerSpecialties(workerId: string, specialties: Specialty[]) {
  return prisma.$transaction(async (tx) => {
    await tx.workerSpecialty.deleteMany({ where: { worker_id: workerId } })
    await tx.workerSpecialty.createMany({
      data: specialties.map((specialty) => ({ worker_id: workerId, specialty })),
    })
  })
}

export async function updateWorkerPhotoUrl(userId: string, photoUrl: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { photo_url: photoUrl },
  })
}
