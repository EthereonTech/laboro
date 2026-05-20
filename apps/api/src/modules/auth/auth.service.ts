import { randomUUID } from 'crypto'
import { UserType } from '@prisma/client'
import { redis } from '../../lib/redis'
import { sendVerification, checkVerification } from '../../lib/twilio'
import { findUserByPhone, createUserWithProfile } from './auth.repository'
import { RefreshTokenData } from './auth.types'

const REFRESH_TTL = 2592000  // 30 dias
const typeKey = (phone: string) => `otp_type:${phone}`
const refreshKey = (token: string) => `refresh:${token}`

const devPhones = (process.env.DEV_PHONES ?? '').split(',').map(p => p.trim()).filter(Boolean)

export async function sendOtp(phone: string, type: 'worker' | 'business') {
  const isDevMode = !process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_VERIFY_SERVICE_SID
  const isDevPhone = devPhones.includes(phone)

  if (isDevMode || isDevPhone) {
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    await redis.setex(`otp_dev:${phone}`, 300, JSON.stringify({ code, type }))
    console.info(`[TEST OTP] ${phone} → ${code}`)
    return
  }

  // Salvar o tipo no Redis para usar na verificação
  await redis.setex(typeKey(phone), 600, type)
  await sendVerification(phone)
}

export async function verifyOtpCode(phone: string, code: string) {
  let userType: 'worker' | 'business'

  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_VERIFY_SERVICE_SID) {
    const raw = await redis.get(`otp_dev:${phone}`)
    if (!raw) throw appError('AUTH_INVALID_OTP', 'Código expirado ou não solicitado')
    const data = JSON.parse(raw)
    if (data.code !== code) throw appError('AUTH_INVALID_OTP', 'Código inválido')
    await redis.del(`otp_dev:${phone}`)
    userType = data.type
  } else {
    const approved = await checkVerification(phone, code)
    if (!approved) throw appError('AUTH_INVALID_OTP', 'Código inválido ou expirado')
    const savedType = await redis.get(typeKey(phone))
    userType = (savedType as 'worker' | 'business') ?? 'worker'
    await redis.del(typeKey(phone))
  }

  let user = await findUserByPhone(phone)
  let isNew = false

  if (!user) {
    user = await createUserWithProfile(phone, userType as UserType)
    isNew = true
  }

  return { user, isNew }
}

export async function createRefreshToken(userId: string, type: 'worker' | 'business') {
  const token = randomUUID()
  const payload: RefreshTokenData = { userId, type }
  await redis.setex(refreshKey(token), REFRESH_TTL, JSON.stringify(payload))
  return token
}

export async function validateRefreshToken(token: string): Promise<RefreshTokenData> {
  const raw = await redis.get(refreshKey(token))
  if (!raw) {
    throw appError('AUTH_INVALID_TOKEN', 'Refresh token inválido ou expirado')
  }
  return JSON.parse(raw) as RefreshTokenData
}

export async function revokeRefreshToken(token: string) {
  await redis.del(refreshKey(token))
}

export async function deleteAccount(userId: string) {
  const { prisma } = await import('../../lib/prisma')
  const now = new Date()
  // Anonymize PII and soft-delete; financial records (EscrowTransaction) are preserved
  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: {
        deleted_at: now,
        full_name: '[removido]',
        cpf: null,
        photo_url: null,
        push_token: null,
      },
    })
    // Anonymize Pix key from Worker if exists
    await tx.worker.updateMany({
      where: { user_id: userId },
      data: { pix_key: null, pix_key_type: null },
    })
  })
}

function appError(code: string, message: string) {
  return Object.assign(new Error(message), { appCode: code })
}
