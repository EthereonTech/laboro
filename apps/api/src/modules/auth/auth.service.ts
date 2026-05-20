import { randomUUID } from 'crypto'
import bcrypt from 'bcryptjs'
import { UserType } from '@prisma/client'
import { redis } from '../../lib/redis'
import { findUserByEmail, isEmailTaken, createUserWithProfile } from './auth.repository'
import { RefreshTokenData } from './auth.types'

const REFRESH_TTL = 2592000 // 30 dias
const refreshKey = (token: string) => `refresh:${token}`

export async function register(data: {
  email: string
  password: string
  full_name: string
  phone?: string
  type: 'worker' | 'business'
}) {
  if (await isEmailTaken(data.email)) {
    throw appError('EMAIL_ALREADY_REGISTERED', 'Este e-mail já está cadastrado')
  }

  const password_hash = await bcrypt.hash(data.password, 10)

  const user = await createUserWithProfile({
    email: data.email,
    password_hash,
    full_name: data.full_name,
    phone: data.phone,
    type: data.type as UserType,
  })

  return { user, isNew: true }
}

export async function login(email: string, password: string) {
  const user = await findUserByEmail(email)
  if (!user) throw appError('AUTH_INVALID_CREDENTIALS', 'E-mail ou senha incorretos')

  const valid = await bcrypt.compare(password, user.password_hash)
  if (!valid) throw appError('AUTH_INVALID_CREDENTIALS', 'E-mail ou senha incorretos')

  return { user, isNew: false }
}

export async function createRefreshToken(userId: string, type: 'worker' | 'business') {
  const token = randomUUID()
  const payload: RefreshTokenData = { userId, type }
  await redis.setex(refreshKey(token), REFRESH_TTL, JSON.stringify(payload))
  return token
}

export async function validateRefreshToken(token: string): Promise<RefreshTokenData> {
  const raw = await redis.get(refreshKey(token))
  if (!raw) throw appError('AUTH_INVALID_TOKEN', 'Refresh token inválido ou expirado')
  return JSON.parse(raw) as RefreshTokenData
}

export async function revokeRefreshToken(token: string) {
  await redis.del(refreshKey(token))
}

export async function deleteAccount(userId: string) {
  const { prisma } = await import('../../lib/prisma')
  const now = new Date()
  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: {
        deleted_at: now,
        full_name: '[removido]',
        email: `deleted_${userId}@removed.invalid`,
        password_hash: '',
        cpf: null,
        photo_url: null,
        push_token: null,
        phone: null,
      },
    })
    await tx.worker.updateMany({
      where: { user_id: userId },
      data: { pix_key: null, pix_key_type: null },
    })
  })
}

function appError(code: string, message: string) {
  return Object.assign(new Error(message), { appCode: code })
}
