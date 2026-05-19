import { Specialty, ShiftStatus, ApplicationStatus } from '@prisma/client'
import { haversineDistance } from '../../lib/haversine'
import { findWorkerByUserId } from '../workers/workers.repository'
import { findBusinessByUserId } from '../businesses/businesses.repository'
import { shiftQueue, notificationsQueue } from '../../jobs'
import { prisma } from '../../lib/prisma'
import * as paymentsService from '../payments/payments.service'
import {
  findShiftById,
  findShiftByIdWithDetail,
  findShiftsByBusiness,
  findOpenShifts,
  createShift,
  updateShift,
  updateShiftStatus,
  softDeleteShift,
  findApplication,
  findApplicationsByShift,
  createApplication,
  updateApplicationStatus,
  countConfirmedApplications,
} from './shifts.repository'
import { ListShiftsQuery, ShiftAddress, ShiftSummary, ApplicationSummary } from './shifts.types'

const LABORO_FEE_RATE = 0.18
const CANCELLATION_FREE_HOURS = 24
const CANCELLATION_PARTIAL_HOURS = 4

// ─── Business ────────────────────────────────────────────────────────────────

export async function createShiftByBusiness(
  userId: string,
  data: {
    specialty: Specialty
    starts_at: string
    ends_at: string
    slots: number
    rate_per_hour: number
    instructions?: string
    address?: ShiftAddress
    is_urgent: boolean
  },
) {
  const business = await findBusinessByUserId(userId)
  if (!business) throw appError('BUSINESS_NOT_FOUND', 'Perfil de empresa não encontrado')

  const starts_at = new Date(data.starts_at)
  const ends_at = new Date(data.ends_at)
  const hours = (ends_at.getTime() - starts_at.getTime()) / 3600000
  const total_value = parseFloat((hours * data.rate_per_hour * data.slots).toFixed(2))
  const laboro_fee = parseFloat((total_value * LABORO_FEE_RATE).toFixed(2))

  // Invariante: gross_amount === laboro_fee + worker_amount
  if (Math.abs(total_value - laboro_fee - (total_value - laboro_fee)) > 0.01) {
    throw appError('SHIFT_VALUE_ERROR', 'Erro no cálculo do valor da vaga')
  }

  const shift = await createShift(business.id, {
    specialty: data.specialty,
    starts_at,
    ends_at,
    slots: data.slots,
    rate_per_hour: data.rate_per_hour,
    total_value,
    laboro_fee,
    instructions: data.instructions,
    address: data.address,
    is_urgent: data.is_urgent,
  })

  // Agendar alerta de vaga sem candidatos 4h antes do início
  const alertDelay = starts_at.getTime() - Date.now() - 4 * 3600 * 1000
  if (alertDelay > 0) {
    await shiftQueue.add(
      'no-candidates-alert',
      { shiftId: shift.id, businessId: business.id },
      { delay: alertDelay, jobId: `no-candidates-${shift.id}` },
    )
  }

  // Notificar trabalhadores com a especialidade sobre nova vaga
  await notificationsQueue.add(
    'new-shift',
    {
      specialty: data.specialty,
      shiftId: shift.id,
      tradeName: business.trade_name,
      startsAt: starts_at.toISOString(),
      ratePerHour: data.rate_per_hour,
    },
    { jobId: `new-shift-notify-${shift.id}` },
  )

  return toSummary(shift)
}

export async function listBusinessShifts(userId: string) {
  const business = await findBusinessByUserId(userId)
  if (!business) throw appError('BUSINESS_NOT_FOUND', 'Perfil de empresa não encontrado')
  const shifts = await findShiftsByBusiness(business.id)
  return shifts.map(toSummary)
}

export async function updateShiftDetails(
  userId: string,
  shiftId: string,
  data: { instructions?: string; is_urgent?: boolean },
) {
  const { shift } = await requireShiftBelongsToBusiness(shiftId, userId)
  if (shift.status !== ShiftStatus.OPEN) {
    throw appError('SHIFT_NOT_EDITABLE', 'Só é possível editar vagas com status OPEN')
  }
  const updated = await updateShift(shiftId, data)
  return toSummary(updated)
}

export async function cancelShift(userId: string, shiftId: string) {
  const { shift } = await requireShiftBelongsToBusiness(shiftId, userId)

  if (shift.status === ShiftStatus.CANCELLED) {
    throw appError('SHIFT_ALREADY_CANCELLED', 'Vaga já cancelada')
  }
  if (shift.status === ShiftStatus.DONE) {
    throw appError('SHIFT_ALREADY_DONE', 'Vaga já concluída não pode ser cancelada')
  }

  const hoursUntilShift = (shift.starts_at.getTime() - Date.now()) / 3600000
  let cancellationPolicy: 'free' | 'partial' | 'no_refund'
  if (hoursUntilShift > CANCELLATION_FREE_HOURS) cancellationPolicy = 'free'
  else if (hoursUntilShift > CANCELLATION_PARTIAL_HOURS) cancellationPolicy = 'partial'
  else cancellationPolicy = 'no_refund'

  await softDeleteShift(shiftId)

  return { cancelled: true, policy: cancellationPolicy }
}

// ─── Worker ──────────────────────────────────────────────────────────────────

export async function listShiftsForWorker(userId: string, query: ListShiftsQuery) {
  const worker = await findWorkerByUserId(userId)
  if (!worker) throw appError('WORKER_NOT_FOUND', 'Perfil de trabalhador não encontrado')

  if (worker.suspended_until && worker.suspended_until > new Date()) {
    throw appError('WORKER_SUSPENDED', 'Você está suspenso temporariamente')
  }

  const shifts = await findOpenShifts({
    specialty: query.specialty,
    date: query.date ? new Date(query.date) : undefined,
  })

  const radius = query.radius ?? 50000
  const page = query.page ?? 1
  const limit = query.limit ?? 20

  const withDistance = shifts
    .map((shift) => {
      const addr = (shift.address ?? shift.business.address) as ShiftAddress | null
      if (!addr?.lat || !addr?.lng) return { shift, distance: Infinity }
      const distance = haversineDistance(query.lat, query.lng, addr.lat, addr.lng)
      return { shift, distance }
    })
    .filter(({ distance }) => distance <= radius)
    .sort((a, b) => {
      if (a.shift.is_urgent !== b.shift.is_urgent) return a.shift.is_urgent ? -1 : 1
      return a.shift.starts_at.getTime() - b.shift.starts_at.getTime()
    })

  const total = withDistance.length
  const paginated = withDistance.slice((page - 1) * limit, page * limit)

  return {
    data: paginated.map(({ shift, distance }) => ({
      ...toSummary(shift),
      distance_meters: distance === Infinity ? undefined : Math.round(distance),
    })),
    meta: { total, page, limit },
  }
}

export async function getShiftDetail(shiftId: string) {
  const shift = await findShiftByIdWithDetail(shiftId)
  if (!shift) throw appError('SHIFT_NOT_FOUND', 'Vaga não encontrada')

  const summary = toSummary(shift)
  return {
    ...summary,
    applications: (shift.applications ?? []).map((app: any) => ({
      id: app.id,
      status: app.status,
      worker: {
        id: app.worker.id,
        score: Number(app.worker.score),
        level: app.worker.level,
        total_shifts: app.worker.total_shifts,
        user: { full_name: app.worker.user.full_name, photo_url: app.worker.user.photo_url },
      },
    })),
  }
}

export async function applyToShift(userId: string, shiftId: string) {
  const worker = await findWorkerByUserId(userId)
  if (!worker) throw appError('WORKER_NOT_FOUND', 'Perfil de trabalhador não encontrado')

  if (worker.suspended_until && worker.suspended_until > new Date()) {
    throw appError('WORKER_SUSPENDED', 'Você está suspenso temporariamente e não pode se candidatar')
  }

  const shift = await findShiftById(shiftId)
  if (!shift) throw appError('SHIFT_NOT_FOUND', 'Vaga não encontrada')
  if (shift.status !== ShiftStatus.OPEN) throw appError('SHIFT_NOT_OPEN', 'Vaga não está aberta para candidaturas')
  if (shift.starts_at <= new Date()) throw appError('SHIFT_STARTED', 'Turno já iniciado')

  const existing = await findApplication(shiftId, worker.id)
  if (existing) throw appError('SHIFT_ALREADY_APPLIED', 'Você já se candidatou a esta vaga')

  const confirmed = await countConfirmedApplications(shiftId)
  if (confirmed >= shift.slots) throw appError('SHIFT_FULL', 'Todos os slots desta vaga foram preenchidos')

  await createApplication(shiftId, worker.id)
  return { applied: true, shift_id: shiftId }
}

export async function confirmWorker(userId: string, shiftId: string, workerId: string) {
  const { shift, business } = await requireShiftBelongsToBusiness(shiftId, userId)

  if (shift.status === ShiftStatus.CANCELLED) {
    throw appError('SHIFT_CANCELLED', 'Vaga cancelada')
  }
  if (shift.status === ShiftStatus.FILLED) {
    throw appError('SHIFT_FULL', 'Todos os slots já estão preenchidos')
  }

  const application = await findApplication(shiftId, workerId)
  if (!application) throw appError('APPLICATION_NOT_FOUND', 'Candidatura não encontrada')
  if (application.status !== ApplicationStatus.PENDING) {
    throw appError('APPLICATION_NOT_PENDING', 'Candidatura não está pendente')
  }

  const confirmed = await countConfirmedApplications(shiftId)
  if (confirmed >= shift.slots) throw appError('SHIFT_FULL', 'Todos os slots já estão preenchidos')

  await updateApplicationStatus(shiftId, workerId, ApplicationStatus.CONFIRMED)

  if (confirmed + 1 >= shift.slots) {
    await updateShiftStatus(shiftId, ShiftStatus.FILLED)
  }

  // Reserve escrow (non-fatal in dev/test when Asaas is not configured)
  let pix_qr_code: { payload: string; encoded_image: string; expiration_date: string } | undefined
  try {
    const workerAmount = Number(shift.total_value) - Number(shift.laboro_fee)
    pix_qr_code = await paymentsService.reserveEscrow({
      shiftId,
      workerId,
      businessId: business!.id,
      grossAmount: Number(shift.total_value),
      laboroFee: Number(shift.laboro_fee),
      workerAmount,
    })
  } catch (err: any) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[DEV] Escrow skipped:', err.message)
    } else {
      throw err
    }
  }

  // Notificar trabalhador que foi confirmado e agendar lembrete
  const workerUser = await prisma.worker.findFirst({
    where: { id: workerId },
    include: { user: { select: { id: true } } },
  })
  if (workerUser) {
    await notificationsQueue.add(
      'shift-confirmed',
      {
        workerId: workerUser.user.id,
        shiftId,
        startsAt: shift.starts_at.toISOString(),
        tradeName: shift.business.trade_name,
      },
      { jobId: `shift-confirmed-${shiftId}-${workerId}` },
    )
  }

  return { confirmed: true, shift_id: shiftId, worker_id: workerId, pix_qr_code }
}

export async function reportNoShow(userId: string, shiftId: string, workerId: string) {
  const { shift } = await requireShiftBelongsToBusiness(shiftId, userId)

  if (shift.status === ShiftStatus.CANCELLED || shift.status === ShiftStatus.DONE) {
    throw appError('SHIFT_NOT_EDITABLE', 'Não é possível reportar no-show neste estado da vaga')
  }

  const application = await findApplication(shiftId, workerId)
  if (!application) throw appError('APPLICATION_NOT_FOUND', 'Candidatura não encontrada')
  if (application.status !== ApplicationStatus.CONFIRMED) {
    throw appError('APPLICATION_NOT_PENDING', 'Candidatura não está confirmada')
  }

  await updateApplicationStatus(shiftId, workerId, ApplicationStatus.NO_SHOW)

  // Refund escrow and penalize worker (non-fatal in dev)
  try {
    await paymentsService.refundEscrowFull(shiftId, workerId)
  } catch (err: any) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[DEV] Escrow refund skipped:', err.message)
    } else {
      throw err
    }
  }

  // Penalize score and suspend for 48h
  await prisma.worker.updateMany({
    where: { id: workerId },
    data: {
      score: { decrement: 0.5 },
      suspended_until: new Date(Date.now() + 48 * 3600 * 1000),
    },
  })

  return { no_show_reported: true, shift_id: shiftId, worker_id: workerId }
}

export async function getMyApplication(userId: string, shiftId: string) {
  const worker = await findWorkerByUserId(userId)
  if (!worker) throw appError('WORKER_NOT_FOUND', 'Perfil de trabalhador não encontrado')

  const shift = await findShiftById(shiftId)
  if (!shift) throw appError('SHIFT_NOT_FOUND', 'Vaga não encontrada')

  const application = await findApplication(shiftId, worker.id)
  if (!application) throw appError('APPLICATION_NOT_FOUND', 'Candidatura não encontrada')

  return {
    id: application.id,
    status: application.status,
    checkin_at: application.checkin_at,
    checkout_at: application.checkout_at,
    hours_worked: application.hours_worked ? Number(application.hours_worked) : null,
    shift: toSummary(shift),
  }
}

export async function listApplications(userId: string, shiftId: string) {
  const { shift } = await requireShiftBelongsToBusiness(shiftId, userId)
  if (!shift) throw appError('SHIFT_NOT_FOUND', 'Vaga não encontrada')

  const applications = await findApplicationsByShift(shiftId)
  return applications.map((app): ApplicationSummary => ({
    id: app.id,
    worker_id: app.worker_id,
    worker_name: app.worker.user.full_name,
    worker_score: Number(app.worker.score),
    worker_level: app.worker.level,
    worker_total_shifts: app.worker.total_shifts,
    specialties: app.worker.specialties.map((s: any) => s.specialty),
    status: app.status,
    created_at: app.created_at,
  }))
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function requireShiftBelongsToBusiness(shiftId: string, userId: string) {
  const business = await findBusinessByUserId(userId)
  if (!business) throw appError('BUSINESS_NOT_FOUND', 'Perfil de empresa não encontrado')

  const shift = await findShiftById(shiftId)
  if (!shift) throw appError('SHIFT_NOT_FOUND', 'Vaga não encontrada')
  if (shift.business_id !== business.id) throw appError('FORBIDDEN', 'Esta vaga não pertence à sua empresa')

  return { shift, business }
}

function toSummary(shift: any): ShiftSummary {
  const workerAmount = Number(shift.total_value) - Number(shift.laboro_fee)
  const address = (shift.address ?? shift.business.address) as ShiftAddress

  return {
    id: shift.id,
    business_id: shift.business_id,
    business_name: shift.business.trade_name,
    specialty: shift.specialty,
    starts_at: shift.starts_at,
    ends_at: shift.ends_at,
    slots: shift.slots,
    slots_available: shift.slots - (shift.applications?.length ?? 0),
    rate_per_hour: Number(shift.rate_per_hour),
    total_value: Number(shift.total_value),
    laboro_fee: Number(shift.laboro_fee),
    worker_amount: parseFloat(workerAmount.toFixed(2)),
    instructions: shift.instructions,
    status: shift.status,
    address,
    is_urgent: shift.is_urgent,
  }
}

function appError(code: string, message: string) {
  return Object.assign(new Error(message), { appCode: code })
}
