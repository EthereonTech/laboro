import { ShiftStatus } from '@prisma/client'
import { haversineDistance } from '../../lib/haversine'
import { findWorkerByUserId } from '../workers/workers.repository'
import { escrowQueue, notificationsQueue } from '../../jobs'
import { updateShiftStatus } from '../shifts/shifts.repository'
import { findConfirmedApplication, recordCheckin, recordCheckout } from './checkin.repository'
import { CheckinResult, CheckoutResult } from './checkin.types'

const GPS_MAX_RADIUS = 500         // metros
const GPS_IMPRECISE_THRESHOLD = 100 // metros

export async function checkin(
  userId: string,
  shiftId: string,
  lat: number,
  lng: number,
  accuracy?: number,
): Promise<CheckinResult> {
  const worker = await findWorkerByUserId(userId)
  if (!worker) throw appError('WORKER_NOT_FOUND', 'Perfil de trabalhador não encontrado')

  const application = await findConfirmedApplication(shiftId, worker.id)
  if (!application) throw appError('APPLICATION_NOT_FOUND', 'Candidatura confirmada não encontrada')
  if (application.checkin_at) throw appError('CHECKIN_ALREADY_DONE', 'Check-in já realizado')

  const shift = application.shift
  const addr = (shift.address ?? shift.business.address) as { lat?: number; lng?: number } | null

  let warning: string | undefined
  if (addr?.lat && addr?.lng) {
    // If GPS imprecise, accept with warning instead of rejecting
    if (accuracy && accuracy > GPS_IMPRECISE_THRESHOLD) {
      warning = 'GPS com baixa precisão — check-in aceito com ressalva'
    } else {
      const distance = haversineDistance(lat, lng, addr.lat, addr.lng)
      if (distance > GPS_MAX_RADIUS) {
        throw appError(
          'CHECKIN_TOO_FAR',
          `Você está a ${Math.round(distance)}m do local da vaga (máximo ${GPS_MAX_RADIUS}m)`,
        )
      }
    }
  }

  await recordCheckin(shiftId, worker.id, lat, lng)

  if (shift.status === ShiftStatus.FILLED) {
    await updateShiftStatus(shiftId, ShiftStatus.IN_PROGRESS)
  }

  // Notificar a empresa que o trabalhador chegou
  await notificationsQueue.add(
    'checkin-confirmed',
    {
      businessUserId: (shift.business as any).user_id,
      workerName: (worker as any).user?.full_name ?? 'Trabalhador',
      shiftId,
    },
    { jobId: `checkin-confirmed-${shiftId}-${worker.id}` },
  ).catch(() => {})

  return { checked_in: true, shift_id: shiftId, warning }
}

export async function checkout(userId: string, shiftId: string): Promise<CheckoutResult> {
  const worker = await findWorkerByUserId(userId)
  if (!worker) throw appError('WORKER_NOT_FOUND', 'Perfil de trabalhador não encontrado')

  const application = await findConfirmedApplication(shiftId, worker.id)
  if (!application) throw appError('APPLICATION_NOT_FOUND', 'Candidatura confirmada não encontrada')
  if (!application.checkin_at) throw appError('CHECKIN_NOT_DONE', 'Check-in não realizado')
  if (application.checkout_at) throw appError('CHECKOUT_ALREADY_DONE', 'Check-out já realizado')

  const hoursWorked = parseFloat(
    ((Date.now() - application.checkin_at.getTime()) / 3600000).toFixed(2),
  )

  await recordCheckout(shiftId, worker.id, hoursWorked)

  await escrowQueue.add(
    'release-escrow',
    { shiftId, workerId: worker.id },
    { jobId: `release-escrow-${shiftId}-${worker.id}` },
  )

  return { checked_out: true, shift_id: shiftId, hours_worked: hoursWorked }
}

function appError(code: string, message: string) {
  return Object.assign(new Error(message), { appCode: code })
}
