import { Specialty, PixKeyType } from '@prisma/client'
import { prisma } from '../../lib/prisma'
import { redis } from '../../lib/redis'

const WORKER_CACHE_TTL = 300 // 5 minutos

function workerCacheKey(userId: string) {
  return `worker:user:${userId}`
}

export async function findWorkerByUserId(userId: string) {
  const cached = await redis.get(workerCacheKey(userId))
  if (cached) return JSON.parse(cached)

  const worker = await prisma.worker.findFirst({
    where: { user_id: userId, user: { deleted_at: null } },
    include: {
      user: { select: { id: true, full_name: true, phone: true, photo_url: true, is_verified: true } },
      specialties: { select: { specialty: true } },
    },
  })

  if (worker) {
    await redis.set(workerCacheKey(userId), JSON.stringify(worker), 'EX', WORKER_CACHE_TTL)
  }

  return worker
}

export async function invalidateWorkerCache(userId: string) {
  await redis.del(workerCacheKey(userId))
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

  const result = await prisma.$transaction(async (tx) => {
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

  await invalidateWorkerCache(userId)
  return result
}

export async function updateWorkerSpecialties(workerId: string, userId: string, specialties: Specialty[]) {
  await prisma.$transaction(async (tx) => {
    await tx.workerSpecialty.deleteMany({ where: { worker_id: workerId } })
    await tx.workerSpecialty.createMany({
      data: specialties.map((specialty) => ({ worker_id: workerId, specialty })),
    })
  })

  await invalidateWorkerCache(userId)
}

export async function updateWorkerPhotoUrl(userId: string, photoUrl: string) {
  const result = await prisma.user.update({
    where: { id: userId },
    data: { photo_url: photoUrl },
  })

  await invalidateWorkerCache(userId)
  return result
}
