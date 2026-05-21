import { Specialty, PixKeyType, WorkerLevel } from '@prisma/client'
import { uploadPhoto } from '../../lib/supabase'
import { asaas } from '../../lib/asaas'
import { prisma } from '../../lib/prisma'
import {
  findWorkerByUserId,
  findWorkerById,
  updateWorkerProfile,
  updateWorkerSpecialties,
  updateWorkerPhotoUrl,
} from './workers.repository'
import { WorkerProfile } from './workers.types'

export async function getMyProfile(userId: string): Promise<WorkerProfile> {
  const worker = await findWorkerByUserId(userId)
  if (!worker) throw appError('WORKER_NOT_FOUND', 'Perfil de trabalhador não encontrado')
  return toProfile(worker)
}

export async function getPublicProfile(workerId: string): Promise<WorkerProfile> {
  const worker = await findWorkerById(workerId)
  if (!worker) throw appError('WORKER_NOT_FOUND', 'Trabalhador não encontrado')
  return toProfile(worker)
}

export async function updateProfile(
  userId: string,
  data: { full_name?: string; cpf?: string; pix_key?: string; pix_key_type?: PixKeyType; specialties?: Specialty[] },
) {
  const worker = await findWorkerByUserId(userId)
  if (!worker) throw appError('WORKER_NOT_FOUND', 'Perfil de trabalhador não encontrado')

  if (data.cpf) validateCpfDigits(data.cpf)

  const { specialties, ...profileData } = data

  const updated = await updateWorkerProfile(worker.id, userId, profileData)

  if (specialties !== undefined) {
    await updateWorkerSpecialties(worker.id, userId, specialties)
  }

  return toProfile({
    ...updated,
    specialties: specialties
      ? specialties.map((s) => ({ specialty: s }))
      : updated.specialties,
  })
}

export async function uploadProfilePhoto(
  userId: string,
  fileBuffer: Buffer,
  mimetype: string,
) {
  const worker = await findWorkerByUserId(userId)
  if (!worker) throw appError('WORKER_NOT_FOUND', 'Perfil de trabalhador não encontrado')

  const ext = mimetype === 'image/png' ? 'png' : 'jpg'
  const path = `workers/${worker.id}/photo.${ext}`
  const photoUrl = await uploadPhoto('profiles', path, fileBuffer, mimetype)

  await updateWorkerPhotoUrl(userId, photoUrl)
  return { photo_url: photoUrl }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toProfile(worker: any): WorkerProfile {
  return {
    id: worker.id,
    user_id: worker.user_id,
    full_name: worker.user.full_name,
    phone: worker.user.phone,
    photo_url: worker.user.photo_url,
    pix_key: worker.pix_key,
    pix_key_type: worker.pix_key_type,
    score: Number(worker.score),
    total_shifts: worker.total_shifts,
    on_time_rate: Number(worker.on_time_rate),
    level: worker.level as WorkerLevel,
    specialties: worker.specialties.map((s: { specialty: Specialty }) => s.specialty),
    is_verified: worker.user.is_verified,
  }
}

export async function getMyApplications(userId: string) {
  const worker = await findWorkerByUserId(userId)
  if (!worker) throw appError('WORKER_NOT_FOUND', 'Perfil de trabalhador não encontrado')

  const applications = await prisma.shiftApplication.findMany({
    where: { worker_id: worker.id },
    include: {
      shift: {
        include: { business: { select: { trade_name: true, user: { select: { photo_url: true } } } } },
      },
    },
    orderBy: { created_at: 'desc' },
  })

  return applications.map((app) => ({
    id: app.id,
    status: app.status,
    checkin_at: app.checkin_at,
    checkout_at: app.checkout_at,
    hours_worked: app.hours_worked ? Number(app.hours_worked) : null,
    created_at: app.created_at,
    shift: {
      id: app.shift.id,
      specialty: app.shift.specialty,
      starts_at: app.shift.starts_at,
      ends_at: app.shift.ends_at,
      rate_per_hour: Number(app.shift.rate_per_hour),
      total_value: Number(app.shift.total_value),
      laboro_fee: Number(app.shift.laboro_fee),
      status: app.shift.status,
      is_urgent: app.shift.is_urgent,
      address: app.shift.address,
      business_name: app.shift.business.trade_name,
      business_photo: app.shift.business.user.photo_url,
    },
  }))
}

export async function getMyPayments(userId: string) {
  const worker = await findWorkerByUserId(userId)
  if (!worker) throw appError('WORKER_NOT_FOUND', 'Perfil de trabalhador não encontrado')

  const escrows = await prisma.escrowTransaction.findMany({
    where: { worker_id: worker.id },
    include: {
      shift: { select: { specialty: true, starts_at: true, ends_at: true } },
    },
    orderBy: { created_at: 'desc' },
  })

  return escrows.map((e) => ({
    id: e.id,
    shift_id: e.shift_id,
    specialty: e.shift.specialty,
    starts_at: e.shift.starts_at,
    ends_at: e.shift.ends_at,
    worker_amount: Number(e.worker_amount),
    status: e.status,
    reserved_at: e.reserved_at,
    confirmed_at: e.confirmed_at,
    released_at: e.released_at,
    refunded_at: e.refunded_at,
  }))
}

export async function updateSpecialties(userId: string, specialties: Specialty[]) {
  const worker = await findWorkerByUserId(userId)
  if (!worker) throw appError('WORKER_NOT_FOUND', 'Perfil de trabalhador não encontrado')
  await updateWorkerSpecialties(worker.id, userId, specialties)
  return { specialties }
}

export async function createAsaasCustomerForWorker(workerId: string): Promise<void> {
  const worker = await prisma.worker.findFirst({
    where: { id: workerId },
    include: { user: { select: { full_name: true, phone: true, cpf: true } } },
  })
  if (!worker || !worker.user.cpf) return

  const customer = await asaas.createCustomer({
    name: worker.user.full_name,
    cpfCnpj: worker.user.cpf,
    mobilePhone: worker.user.phone ?? undefined,
  })
  await prisma.worker.update({
    where: { id: workerId },
    data: { asaas_customer_id: customer.id },
  })
}

function validateCpfDigits(cpf: string) {
  if (/^(\d)\1{10}$/.test(cpf)) throw appError('CPF_INVALID', 'CPF inválido')

  const calc = (cpf: string, len: number) => {
    let sum = 0
    for (let i = 0; i < len; i++) sum += parseInt(cpf[i]) * (len + 1 - i)
    const rem = (sum * 10) % 11
    return rem === 10 || rem === 11 ? 0 : rem
  }

  if (calc(cpf, 9) !== parseInt(cpf[9])) throw appError('CPF_INVALID', 'CPF inválido')
  if (calc(cpf, 10) !== parseInt(cpf[10])) throw appError('CPF_INVALID', 'CPF inválido')
}

function appError(code: string, message: string) {
  return Object.assign(new Error(message), { appCode: code })
}
