import { findWorkerByUserId } from '../workers/workers.repository'
import { findBusinessByUserId } from '../businesses/businesses.repository'
import { findShiftById } from '../shifts/shifts.repository'
import { scoreQueue } from '../../jobs'
import {
  findCompletedApplication,
  findExistingRating,
  createRatingRecord,
} from './ratings.repository'
import { CreateRatingInput, RatingSummary } from './ratings.types'

export async function rateAsWorker(userId: string, input: CreateRatingInput): Promise<RatingSummary> {
  const worker = await findWorkerByUserId(userId)
  if (!worker) throw appError('WORKER_NOT_FOUND', 'Perfil de trabalhador não encontrado')

  const application = await findCompletedApplication(input.shift_id, worker.id)
  if (!application) throw appError('APPLICATION_NOT_COMPLETED', 'Você não concluiu este turno')

  const existing = await findExistingRating(input.shift_id, worker.id)
  if (existing) throw appError('RATING_ALREADY_EXISTS', 'Você já avaliou este turno')

  const rating = await createRatingRecord({
    shift_id: input.shift_id,
    from_id: worker.id,
    to_id: input.to_id, // business.id
    score: input.score,
    tags: input.tags,
    comment: input.comment,
  })

  return toSummary(rating)
}

export async function rateAsBase(userId: string, input: CreateRatingInput): Promise<RatingSummary> {
  const business = await findBusinessByUserId(userId)
  if (!business) throw appError('BUSINESS_NOT_FOUND', 'Perfil de empresa não encontrado')

  const shift = await findShiftById(input.shift_id)
  if (!shift) throw appError('SHIFT_NOT_FOUND', 'Vaga não encontrada')
  if (shift.business_id !== business.id) throw appError('FORBIDDEN', 'Esta vaga não pertence à sua empresa')

  const application = await findCompletedApplication(input.shift_id, input.to_id)
  if (!application) throw appError('APPLICATION_NOT_COMPLETED', 'Trabalhador não concluiu este turno')

  const existing = await findExistingRating(input.shift_id, business.id)
  if (existing) throw appError('RATING_ALREADY_EXISTS', 'Você já avaliou este turno')

  const rating = await createRatingRecord({
    shift_id: input.shift_id,
    from_id: business.id,
    to_id: input.to_id, // worker.id
    score: input.score,
    tags: input.tags,
    comment: input.comment,
  })

  // Recalculate worker score after being rated
  await scoreQueue.add(
    'recalculate-score',
    { workerId: input.to_id },
    { jobId: `score-${input.to_id}-${Date.now()}` },
  )

  return toSummary(rating)
}

function toSummary(rating: any): RatingSummary {
  return {
    id: rating.id,
    shift_id: rating.shift_id,
    from_id: rating.from_id,
    to_id: rating.to_id,
    score: rating.score,
    tags: rating.tags,
    comment: rating.comment,
    created_at: rating.created_at,
  }
}

function appError(code: string, message: string) {
  return Object.assign(new Error(message), { appCode: code })
}
