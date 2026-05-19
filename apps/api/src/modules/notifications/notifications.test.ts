import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest'
import Fastify, { FastifyInstance } from 'fastify'
import jwt from '@fastify/jwt'
import { registerErrorHandler } from '../../plugins/error-handler'

vi.mock('../../lib/prisma', () => ({
  prisma: {
    user: { findFirst: vi.fn(), update: vi.fn() },
  },
}))

import { prisma } from '../../lib/prisma'
import { notificationsRoutes } from './notifications.routes'

const USER_ID = 'user-1'
const PUSH_TOKEN = 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]'

let app: FastifyInstance
let token: string

beforeAll(async () => {
  process.env.JWT_SECRET = 'test-secret'
  app = Fastify()
  await app.register(jwt, { secret: 'test-secret' })
  registerErrorHandler(app)
  await app.register(notificationsRoutes)
  await app.ready()
  token = await app.jwt.sign({ sub: USER_ID, type: 'worker' })
})

afterAll(async () => { await app.close() })
beforeEach(() => { vi.clearAllMocks() })

const auth = () => ({ Authorization: `Bearer ${token}` })

describe('POST /notifications/device-token', () => {
  it('registra token de push com sucesso', async () => {
    vi.mocked(prisma.user.update).mockResolvedValueOnce({} as any)

    const res = await app.inject({
      method: 'POST',
      url: '/notifications/device-token',
      headers: auth(),
      body: { push_token: PUSH_TOKEN },
    })

    expect(res.statusCode).toBe(200)
    expect(JSON.parse(res.body).data.registered).toBe(true)
    expect(vi.mocked(prisma.user.update)).toHaveBeenCalledWith(
      expect.objectContaining({ data: { push_token: PUSH_TOKEN } }),
    )
  })

  it('retorna 400 para token vazio', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/notifications/device-token',
      headers: auth(),
      body: { push_token: '' },
    })
    expect(res.statusCode).toBe(400)
  })

  it('retorna 401 sem autenticação', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/notifications/device-token',
      body: { push_token: PUSH_TOKEN },
    })
    expect(res.statusCode).toBe(401)
  })
})
