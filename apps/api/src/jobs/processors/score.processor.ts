import { Job } from 'bullmq'
import { WorkerLevel } from '@prisma/client'
import { prisma } from '../../lib/prisma'

interface RecalculateScoreData {
  workerId: string
}

function calculateLevel(totalShifts: number, score: number, onTimeRate: number): WorkerLevel {
  if (totalShifts >= 20 && score >= 4.5 && onTimeRate >= 90) return WorkerLevel.TOP_PRO
  if (totalShifts >= 5) return WorkerLevel.VERIFIED
  return WorkerLevel.BEGINNER
}

export async function scoreProcessor(job: Job): Promise<void> {
  if (job.name !== 'recalculate-score') return

  const { workerId } = job.data as RecalculateScoreData

  const ratings = await prisma.rating.findMany({
    where: { to_id: workerId },
    orderBy: { created_at: 'asc' },
  })

  let score = 0
  if (ratings.length > 0) {
    const recent = ratings.slice(-5)
    const older = ratings.slice(0, -5)
    const weightedSum =
      recent.reduce((acc, r) => acc + r.score * 2, 0) +
      older.reduce((acc, r) => acc + r.score * 1, 0)
    const totalWeight = recent.length * 2 + older.length * 1
    score = parseFloat((weightedSum / totalWeight).toFixed(2))
  }

  const worker = await prisma.worker.findFirst({ where: { id: workerId } })
  if (!worker) return

  const level = calculateLevel(worker.total_shifts, score, Number(worker.on_time_rate))

  await prisma.worker.update({
    where: { id: workerId },
    data: { score, level },
  })

  console.info({ event: 'score.recalculated', worker_id: workerId, score, level })
}
