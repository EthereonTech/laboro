import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest'
import Fastify, { FastifyInstance } from 'fastify'
import jwt from '@fastify/jwt'

// ─── Mocks hoisted (vi.mock é içado para o topo do arquivo) ──────────────────

const { store, redisMock } = vi.hoisted(() => {
  const store = new Map<string, { value: string; expiresAt?: number }>()

  const get = async (key: string) => {
    const entry = store.get(key)
    if (!entry) return null
    if (entry.expiresAt && Date.now() > entry.expiresAt) { store.delete(key); return null }
    return entry.value
  }
  const setex = async (key: string, ttl: number, value: string) => {
    store.set(key, { value, expiresAt: Date.now() + ttl * 1000 })
    return 'OK'
  }
  const del = async (...keys: string[]) => { keys.forEach((k) => store.delete(k)); return keys.length }
  const incr = async (key: string) => {
    const entry = store.get(key)
    const n = entry ? parseInt(entry.value) + 1 : 1
    store.set(key, { value: String(n), expiresAt: entry?.expiresAt })
    return n
  }
  const expire = async (key: string, ttl: number) => {
    const entry = store.get(key)
    if (entry) store.set(key, { ...entry, expiresAt: Date.now() + ttl * 1000 })
    return 1
  }
  const ttl = async (key: string) => {
    const entry = store.get(key)
    if (!entry?.expiresAt) return -1
    return Math.floor((entry.expiresAt - Date.now()) / 1000)
  }

  const redisMock = { get, setex, del, incr, expire, ttl }
  return { store, redisMock }
})

vi.mock('../../lib/redis', () => ({ redis: redisMock }))
const txMock = {
  user: { update: vi.fn().mockResolvedValue({}) },
  worker: { updateMany: vi.fn().mockResolvedValue({ count: 0 }) },
}
vi.mock('../../lib/prisma', () => ({
  prisma: {
    user: { findFirst: vi.fn(), create: vi.fn(), update: vi.fn() },
    worker: { updateMany: vi.fn().mockResolvedValue({ count: 0 }) },
    $transaction: vi.fn().mockImplementation((fn: any) => fn(txMock)),
  },
}))
vi.mock('../../lib/twilio', () => ({ sendSms: vi.fn().mockResolvedValue(undefined) }))

import { prisma } from '../../lib/prisma'
import { authRoutes } from './auth.routes'
import { registerErrorHandler } from '../../plugins/error-handler'

let app: FastifyInstance

beforeAll(async () => {
  process.env.JWT_SECRET = 'test-secret'
  process.env.NODE_ENV = 'test'

  app = Fastify()
  await app.register(jwt, { secret: 'test-secret' })
  registerErrorHandler(app)
  await app.register(authRoutes)
  await app.ready()
})

afterAll(async () => {
  await app.close()
})

beforeEach(() => {
  store.clear()
  vi.clearAllMocks()
})

const testPhone = '+5541999999999'

const sendOtpReq = (phone = testPhone, type = 'worker') =>
  app.inject({ method: 'POST', url: '/auth/otp/send', body: { phone, type } })

const getOtpCode = (phone = testPhone) => {
  const raw = store.get(`otp:${phone}`)!.value
  return JSON.parse(raw).code as string
}

// ─── POST /auth/otp/send ─────────────────────────────────────────────────────

describe('POST /auth/otp/send', () => {
  it('retorna 200 e armazena OTP no Redis', async () => {
    const res = await sendOtpReq()

    expect(res.statusCode).toBe(200)
    expect(JSON.parse(res.body).data.message).toBe('Código enviado com sucesso')

    const entry = store.get(`otp:${testPhone}`)
    expect(entry).toBeDefined()
    const data = JSON.parse(entry!.value)
    expect(data.code).toHaveLength(6)
    expect(data.type).toBe('worker')
    expect(data.attempts).toBe(0)
  })

  it('retorna 400 para telefone sem código de país (+55)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/auth/otp/send',
      body: { phone: '41999999999', type: 'worker' },
    })
    expect(res.statusCode).toBe(400)
    expect(JSON.parse(res.body).error.code).toBe('VALIDATION_ERROR')
  })

  it('retorna 400 para tipo inválido', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/auth/otp/send',
      body: { phone: testPhone, type: 'admin' },
    })
    expect(res.statusCode).toBe(400)
  })

  it('retorna 429 após exceder rate limit de 3 envios por hora', async () => {
    await sendOtpReq(); await sendOtpReq(); await sendOtpReq()
    const res = await sendOtpReq()
    expect(res.statusCode).toBe(429)
    expect(JSON.parse(res.body).error.code).toBe('AUTH_TOO_MANY_ATTEMPTS')
  })
})

// ─── POST /auth/otp/verify ───────────────────────────────────────────────────

describe('POST /auth/otp/verify', () => {
  it('cria usuário novo (201) e retorna accessToken + refreshToken', async () => {
    await sendOtpReq()
    const code = getOtpCode()

    const mockUser = { id: 'user-1', type: 'worker', phone: testPhone, worker: { id: 'w-1' }, business: null }
    vi.mocked(prisma.user.findFirst).mockResolvedValueOnce(null)
    vi.mocked(prisma.user.create).mockResolvedValueOnce(mockUser as any)

    const res = await app.inject({
      method: 'POST',
      url: '/auth/otp/verify',
      body: { phone: testPhone, code },
    })

    expect(res.statusCode).toBe(201)
    const body = JSON.parse(res.body)
    expect(body.data.accessToken).toBeDefined()
    expect(body.data.refreshToken).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    )
    expect(body.data.isNew).toBe(true)
    expect(body.data.type).toBe('worker')
  })

  it('retorna 200 (não 201) para usuário já existente', async () => {
    await sendOtpReq()
    const code = getOtpCode()

    const mockUser = { id: 'user-1', type: 'worker', phone: testPhone, worker: { id: 'w-1' }, business: null }
    vi.mocked(prisma.user.findFirst).mockResolvedValueOnce(mockUser as any)

    const res = await app.inject({
      method: 'POST',
      url: '/auth/otp/verify',
      body: { phone: testPhone, code },
    })

    expect(res.statusCode).toBe(200)
    expect(JSON.parse(res.body).data.isNew).toBe(false)
  })

  it('retorna 401 para código errado', async () => {
    await sendOtpReq()
    const res = await app.inject({
      method: 'POST',
      url: '/auth/otp/verify',
      body: { phone: testPhone, code: '000000' },
    })
    expect(res.statusCode).toBe(401)
    expect(JSON.parse(res.body).error.code).toBe('AUTH_INVALID_OTP')
  })

  it('retorna 401 quando nenhum OTP foi solicitado', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/auth/otp/verify',
      body: { phone: testPhone, code: '123456' },
    })
    expect(res.statusCode).toBe(401)
    expect(JSON.parse(res.body).error.code).toBe('AUTH_INVALID_OTP')
  })

  it('bloqueia com 429 após 3 tentativas erradas e apaga o OTP', async () => {
    await sendOtpReq()
    const verify = (code: string) =>
      app.inject({ method: 'POST', url: '/auth/otp/verify', body: { phone: testPhone, code } })

    await verify('000000')
    await verify('000001')
    await verify('000002')
    const res = await verify('000003')

    expect(res.statusCode).toBe(429)
    expect(JSON.parse(res.body).error.code).toBe('AUTH_TOO_MANY_ATTEMPTS')
    expect(store.get(`otp:${testPhone}`)).toBeUndefined()
  })

  it('apaga o OTP do Redis após verificação bem-sucedida', async () => {
    await sendOtpReq()
    const code = getOtpCode()

    const mockUser = { id: 'user-1', type: 'worker', phone: testPhone, worker: { id: 'w-1' }, business: null }
    vi.mocked(prisma.user.findFirst).mockResolvedValueOnce(mockUser as any)

    await app.inject({ method: 'POST', url: '/auth/otp/verify', body: { phone: testPhone, code } })

    expect(store.get(`otp:${testPhone}`)).toBeUndefined()
  })
})

// ─── POST /auth/token/refresh ─────────────────────────────────────────────────

describe('POST /auth/token/refresh', () => {
  it('retorna novo accessToken com refresh token válido', async () => {
    const { createRefreshToken } = await import('./auth.service')
    const refreshToken = await createRefreshToken('user-1', 'worker')

    const res = await app.inject({
      method: 'POST',
      url: '/auth/token/refresh',
      body: { refreshToken },
    })

    expect(res.statusCode).toBe(200)
    expect(JSON.parse(res.body).data.accessToken).toBeDefined()
  })

  it('retorna 401 para refresh token inexistente', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/auth/token/refresh',
      body: { refreshToken: '00000000-0000-0000-0000-000000000000' },
    })
    expect(res.statusCode).toBe(401)
    expect(JSON.parse(res.body).error.code).toBe('AUTH_INVALID_TOKEN')
  })

  it('retorna 400 para refresh token com formato inválido', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/auth/token/refresh',
      body: { refreshToken: 'nao-e-um-uuid' },
    })
    expect(res.statusCode).toBe(400)
  })
})

// ─── DELETE /users/me (LGPD) ─────────────────────────────────────────────────

describe('DELETE /users/me', () => {
  it('anonimiza e remove conta com 204', async () => {
    const token = await app.jwt.sign({ sub: 'user-lgpd', type: 'worker' })

    const res = await app.inject({
      method: 'DELETE',
      url: '/users/me',
      headers: { Authorization: `Bearer ${token}` },
    })

    expect(res.statusCode).toBe(204)
    expect(txMock.user.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ full_name: '[removido]' }) }),
    )
    expect(txMock.worker.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ data: { pix_key: null, pix_key_type: null } }),
    )
  })

  it('retorna 401 sem autenticação', async () => {
    const res = await app.inject({ method: 'DELETE', url: '/users/me' })
    expect(res.statusCode).toBe(401)
  })
})
