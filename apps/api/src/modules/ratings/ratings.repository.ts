import { ApplicationStatus } from '@prisma/client'
import { prisma } from '../../lib/prisma'

export async function findCompletedApplication(shiftId: string, workerId: string) {
  return prisma.shiftApplication.findFirst({
    where: { shift_id: shiftId, worker_id: workerId, status: ApplicationStatus.COMPLETED },
  })
}

export async function findExistingRating(shiftId: string, fromId: string) {
  return prisma.rating.findFirst({
    where: { shift_id: shiftId, from_id: fromId },
  })
}

export async function createRatingRecord(data: {
  shift_id: string
  from_id: string
  to_id: string
  score: number
  tags: string[]
  comment?: string
}) {
  return prisma.rating.create({ data })
}

export async function findRatingsByWorker(workerId: string) {
  return prisma.rating.findMany({
    where: { to_id: workerId },
    orderBy: { created_at: 'asc' },
  })
}
