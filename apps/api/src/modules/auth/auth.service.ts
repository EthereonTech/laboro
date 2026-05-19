import { randomUUID } from 'crypto'
import { UserType } from '@prisma/client'
import { redis } from '../../lib/redis'
import { sendSms } from '../../lib/twilio'
import { findUserByPhone, createUserWithProfile } from './auth.repository'
import { OtpData, RefreshTokenData } from './auth.types'

const OTP_TTL = 300          // 5 minutos
const OTP_MAX_ATTEMPTS = 3
const OTP_RATE_LIMIT = 3     // máx OTPs por hora por telefone
const OTP_RATE_TTL = 3600    // 1 hora
const REFRESH_TTL = 2592000  // 30 dias

const otpKey = (phone: string) => `otp:${phone}`
const otpRateKey = (phone: string) => `otp_rate:${phone}`
const refreshKey = (token: string) => `refresh:${token}`

export async function sendOtp(phone: string, type: 'worker' | 'business') {
  const rateK = otpRateKey(phone)
  const sends = await redis.incr(rateK)
  if (sends === 1) await redis.expire(rateK, OTP_RATE_TTL)
  if (sends > OTP_RATE_LIMIT) {
    throw appError('AUTH_TOO_MANY_ATTEMPTS', 'Muitas tentativas. Aguarde antes de solicitar outro código.')
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString()
  const data: OtpData = { code, type, attempts: 0 }
  await redis.setex(otpKey(phone), OTP_TTL, JSON.stringify(data))

  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    console.info(`[TEST OTP] ${phone} → ${code}`)
    return
  }

  await sendSms(phone, `Seu código Laboro: ${code}. Válido por 5 minutos. Não compartilhe.`)
}

export async function verifyOtpCode(phone: string, code: string) {
  const key = otpKey(phone)
  const raw = await redis.get(key)

  if (!raw) {
    throw appError('AUTH_INVALID_OTP', 'Código expirado ou não solicitado')
  }

  const data: OtpData = JSON.parse(raw)
  data.attempts++

  if (data.attempts > OTP_MAX_ATTEMPTS) {
    await redis.del(key)
    throw appError('AUTH_TOO_MANY_ATTEMPTS', 'Muitas tentativas. Solicite um novo código.')
  }

  if (data.code !== code) {
    const ttl = await redis.ttl(key)
    await redis.setex(key, Math.max(ttl, 1), JSON.stringify(data))
    throw appError('AUTH_INVALID_OTP', 'Código inválido')
  }

  await redis.del(key)

  let user = await findUserByPhone(phone)
  let isNew = false

  if (!user) {
    user = await createUserWithProfile(phone, data.type as UserType)
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
