import { BusinessSegment } from '@prisma/client'
import { uploadPhoto } from '../../lib/supabase'
import { asaas } from '../../lib/asaas'
import { prisma } from '../../lib/prisma'
import { geocodeAddress } from '../../lib/geocoding'
import {
  findBusinessByUserId,
  findBusinessById,
  isCnpjTaken,
  createBusiness,
  updateBusiness,
  updateBusinessPhotoUrl,
} from './businesses.repository'
import { BusinessAddress, BusinessProfile, CreateBusinessBody, UpdateBusinessBody } from './businesses.types'

export async function getMyProfile(userId: string): Promise<BusinessProfile> {
  const biz = await findBusinessByUserId(userId)
  if (!biz) throw appError('BUSINESS_NOT_FOUND', 'Perfil de empresa não encontrado')
  return toProfile(biz)
}

export async function getPublicProfile(businessId: string): Promise<BusinessProfile> {
  const biz = await findBusinessById(businessId)
  if (!biz) throw appError('BUSINESS_NOT_FOUND', 'Empresa não encontrada')
  return toProfile(biz)
}

export async function createProfile(userId: string, data: CreateBusinessBody): Promise<BusinessProfile> {
  validateCnpjDigits(data.cnpj)

  if (await isCnpjTaken(data.cnpj)) {
    throw appError('CNPJ_ALREADY_REGISTERED', 'Este CNPJ já está cadastrado')
  }

  const existing = await findBusinessByUserId(userId)
  if (existing) throw appError('BUSINESS_ALREADY_EXISTS', 'Empresa já cadastrada para este usuário')

  await validateCnpjWithReceita(data.cnpj)

  // Geocodificar endereço automaticamente
  if (data.address) {
    const coords = await geocodeAddress(data.address as any)
    if (coords) {
      data.address = { ...data.address, lat: coords.lat, lng: coords.lng } as any
    }
  }

  const biz = await createBusiness(userId, {
    ...data,
    segment: data.segment as BusinessSegment,
  })

  // Criar customer Asaas em background (não bloqueia resposta)
  createAsaasCustomer(biz.id, biz.legal_name, data.cnpj, biz.user.phone).catch((err) =>
    console.warn('[Asaas] Falha ao criar customer da empresa:', err.message),
  )

  return toProfile(biz)
}

export async function updateProfile(userId: string, data: UpdateBusinessBody): Promise<BusinessProfile> {
  const biz = await findBusinessByUserId(userId)
  if (!biz) throw appError('BUSINESS_NOT_FOUND', 'Perfil de empresa não encontrado')

  let address = data.address as BusinessAddress | undefined
  if (address) {
    const coords = await geocodeAddress(address as any)
    if (coords) address = { ...address, lat: coords.lat, lng: coords.lng }
  }

  const updated = await updateBusiness(biz.id, userId, {
    ...data,
    segment: data.segment as BusinessSegment | undefined,
    address,
  })
  return toProfile(updated)
}

export async function uploadProfilePhoto(userId: string, buffer: Buffer, mimetype: string) {
  const biz = await findBusinessByUserId(userId)
  if (!biz) throw appError('BUSINESS_NOT_FOUND', 'Perfil de empresa não encontrado')

  const ext = mimetype === 'image/png' ? 'png' : 'jpg'
  const path = `businesses/${biz.id}/photo.${ext}`
  const photoUrl = await uploadPhoto('profiles', path, buffer, mimetype)

  await updateBusinessPhotoUrl(userId, photoUrl)
  return { photo_url: photoUrl }
}

// ─── Queries for business app ────────────────────────────────────────────────

export async function validateCnpj(cnpj: string): Promise<void> {
  validateCnpjDigits(cnpj)
  await validateCnpjWithReceita(cnpj)
}

export async function getMyShifts(userId: string) {
  const biz = await findBusinessByUserId(userId)
  if (!biz) throw appError('BUSINESS_NOT_FOUND', 'Perfil de empresa não encontrado')

  const shifts = await prisma.shift.findMany({
    where: { business_id: biz.id, deleted_at: null },
    include: {
      applications: { select: { id: true, status: true, worker: { include: { user: { select: { full_name: true, photo_url: true } } } } } },
    },
    orderBy: { starts_at: 'desc' },
  })

  return shifts.map((s) => ({
    id: s.id,
    specialty: s.specialty,
    starts_at: s.starts_at,
    ends_at: s.ends_at,
    slots: s.slots,
    rate_per_hour: Number(s.rate_per_hour),
    total_value: Number(s.total_value),
    laboro_fee: Number(s.laboro_fee),
    status: s.status,
    is_urgent: s.is_urgent,
    instructions: s.instructions,
    address: s.address,
    applications: s.applications,
  }))
}

export async function getMyPayments(userId: string) {
  const biz = await findBusinessByUserId(userId)
  if (!biz) throw appError('BUSINESS_NOT_FOUND', 'Perfil de empresa não encontrado')

  const escrows = await prisma.escrowTransaction.findMany({
    where: { business_id: biz.id },
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
    gross_amount: Number(e.gross_amount),
    laboro_fee: Number(e.laboro_fee),
    worker_amount: Number(e.worker_amount),
    status: e.status,
    reserved_at: e.reserved_at,
    confirmed_at: e.confirmed_at,
    released_at: e.released_at,
    refunded_at: e.refunded_at,
  }))
}

export async function getDashboard(userId: string) {
  const biz = await findBusinessByUserId(userId)
  if (!biz) throw appError('BUSINESS_NOT_FOUND', 'Perfil de empresa não encontrado')

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [activeShifts, monthlySpent, pendingApplications, completedShifts] = await Promise.all([
    prisma.shift.findMany({
      where: { business_id: biz.id, deleted_at: null, status: { in: ['OPEN', 'FILLED', 'IN_PROGRESS'] } },
      include: {
        applications: { select: { id: true, status: true, worker: { include: { user: { select: { full_name: true, photo_url: true } } } } } },
      },
      orderBy: { starts_at: 'asc' },
      take: 10,
    }),
    prisma.escrowTransaction.aggregate({
      where: { business_id: biz.id, status: 'RELEASED', released_at: { gte: startOfMonth } },
      _sum: { gross_amount: true },
    }),
    prisma.shiftApplication.count({
      where: { shift: { business_id: biz.id }, status: 'PENDING' },
    }),
    prisma.shift.count({
      where: { business_id: biz.id, status: 'DONE' },
    }),
  ])

  return {
    active_shifts: activeShifts.map((s) => ({
      id: s.id,
      specialty: s.specialty,
      starts_at: s.starts_at,
      ends_at: s.ends_at,
      slots: s.slots,
      rate_per_hour: Number(s.rate_per_hour),
      total_value: Number(s.total_value),
      laboro_fee: Number(s.laboro_fee),
      status: s.status,
      is_urgent: s.is_urgent,
      instructions: s.instructions,
      address: s.address,
      applications: s.applications,
    })),
    monthly_spent: Number(monthlySpent._sum.gross_amount ?? 0),
    pending_applications: pendingApplications,
    completed_shifts: completedShifts,
  }
}

// ─── CNPJ validation ─────────────────────────────────────────────────────────

function validateCnpjDigits(cnpj: string) {
  if (/^(\d)\1{13}$/.test(cnpj)) throw appError('CNPJ_INVALID', 'CNPJ inválido')

  const calc = (cnpj: string, len: number) => {
    let sum = 0
    let pos = len - 7
    for (let i = len; i >= 1; i--) {
      sum += parseInt(cnpj[len - i]) * pos--
      if (pos < 2) pos = 9
    }
    return sum % 11 < 2 ? 0 : 11 - (sum % 11)
  }

  if (calc(cnpj, 12) !== parseInt(cnpj[12])) throw appError('CNPJ_INVALID', 'CNPJ inválido')
  if (calc(cnpj, 13) !== parseInt(cnpj[13])) throw appError('CNPJ_INVALID', 'CNPJ inválido')
}

async function validateCnpjWithReceita(cnpj: string) {
  // Em desenvolvimento local, pular consulta à Receita Federal
  if (process.env.NODE_ENV === 'development') {
    console.info(`[DEV] Pulando consulta Receita Federal para CNPJ ${cnpj}`)
    return
  }

  try {
    const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`)
    if (res.status === 404) throw appError('CNPJ_NOT_FOUND', 'CNPJ não encontrado na Receita Federal')
    if (!res.ok) throw appError('CNPJ_LOOKUP_FAILED', 'Falha ao consultar Receita Federal. Tente novamente.')

    const data = (await res.json()) as { situacao_cadastral?: string; descricao_situacao_cadastral?: string }
    if (data.situacao_cadastral !== '02') {
      throw appError(
        'CNPJ_INACTIVE',
        `CNPJ com situação irregular na Receita Federal: ${data.descricao_situacao_cadastral ?? 'inativa'}`,
      )
    }
  } catch (err: any) {
    if (err.appCode) throw err
    // Falha de rede — logar mas não bloquear cadastro
    console.warn(`[CNPJ] Consulta Receita Federal falhou: ${err.message}`)
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toProfile(biz: any): BusinessProfile {
  return {
    id: biz.id,
    user_id: biz.user_id,
    full_name: biz.user.full_name,
    phone: biz.user.phone,
    photo_url: biz.user.photo_url,
    cnpj: biz.cnpj,
    trade_name: biz.trade_name,
    legal_name: biz.legal_name,
    segment: biz.segment,
    address: biz.address as BusinessAddress,
    score: Number(biz.score),
    is_verified: biz.user.is_verified,
  }
}

async function createAsaasCustomer(
  businessId: string,
  name: string,
  cnpj: string,
  phone?: string,
): Promise<void> {
  const customer = await asaas.createCustomer({ name, cpfCnpj: cnpj, mobilePhone: phone })
  await prisma.business.update({
    where: { id: businessId },
    data: { asaas_customer_id: customer.id },
  })
}

function appError(code: string, message: string) {
  return Object.assign(new Error(message), { appCode: code })
}
