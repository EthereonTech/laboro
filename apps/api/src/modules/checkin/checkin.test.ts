import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest'
import Fastify, { FastifyInstance } from 'fastify'
import jwt from '@fastify/jwt'
import { ApplicationStatus, ShiftStatus } from '@prisma/client'
import { registerErrorHandler } from '../../plugins/error-handler'

vi.mock('../../lib/prisma', () => ({
  prisma: {
    worker: { findFirst: vi.fn() },
    shiftApplication: { findFirst: vi.fn(), update: vi.fn() },
    shift: { update: vi.fn() },
  },
}))
vi.mock('../../jobs', () => ({
  escrowQueue: { add: vi.fn().mockResolvedValue(undefined) },
  notificationsQueue: { add: vi.fn().mockResolvedValue(undefined) },
}))
vi.mock('../shifts/shifts.repository', () => ({
  updateShiftStatus: vi.fn().mockResolvedValue(undefined),
}))

import { prisma } from '../../lib/prisma'
import { checkinRoutes } from './checkin.routes'

// ─── Fixtures ────────────────────────────────────────────────────────────────

const WORKER_USER_ID = 'user-wrk-1'
const SHIFT_ID = '00000000-0000-0000-0000-000000000010'
const WORKER_ID = '00000000-0000-0000-0000-000000000020'

const SHIFT_LAT = -26.22
const SHIFT_LNG = -52.67

const MOCK_WORKER = {
  id: WORKER_ID,
  user_id: WORKER_USER_ID,
  suspended_until: null,
}

const future = new Date(Date.now() + 2 * 3600 * 1000)

const MOCK_APPLICATION = {
  id: 'app-1',
  shift_id: SHIFT_ID,
  worker_id: WORKER_ID,
  status: ApplicationStatus.CONFIRMED,
  checkin_at: null,
  checkout_at: null,
  shift: {
    id: SHIFT_ID,
    status: ShiftStatus.FILLED,
    starts_at: future,
    address: null,
    business: {
      address: { lat: SHIFT_LAT, lng: SHIFT_LNG },
      user_id: 'user-biz-1',
      trade_name: 'Bar do João',
    },
  },
}

let app: FastifyInstance
let workerToken: string

beforeAll(async () => {
  process.env.JWT_SECRET = 'test-secret'
  app = Fastify()
  await app.register(jwt, { secret: 'test-secret' })
  registerErrorHandler(app)
  await app.register(checkinRoutes)
  await app.ready()
  workerToken = await app.jwt.sign({ sub: WORKER_USER_ID, type: 'worker' })
})

afterAll(async () => { await app.close() })
beforeEach(() => { vi.clearAllMocks() })

const wrk = () => ({ Authorization: `Bearer ${workerToken}` })

// ─── POST /shifts/:id/checkin ─────────────────────────────────────────────────

describe('POST /shifts/:id/checkin', () => {
  it('registra check-in quando trabalhador está próximo', async () => {
    vi.mocked(prisma.worker.findFirst).mockResolvedValueOnce(MOCK_WORKER as any)
    vi.mocked(prisma.shiftApplication.findFirst).mockResolvedValueOnce(MOCK_APPLICATION as any)
    vi.mocked(prisma.shiftApplication.update).mockResolvedValueOnce({} as any)

    const res = await app.inject({
      method: 'POST',
      url: `/shifts/${SHIFT_ID}/checkin`,
      headers: wrk(),
      body: { lat: SHIFT_LAT, lng: SHIFT_LNG },
    })

    expect(res.statusCode).toBe(200)
    expect(JSON.parse(res.body).data.checked_in).toBe(true)
  })

  it('retorna 422 quando trabalhador está fora do raio de 500m', async () => {
    vi.mocked(prisma.worker.findFirst).mockResolvedValueOnce(MOCK_WORKER as any)
    vi.mocked(prisma.shiftApplication.findFirst).mockResolvedValueOnce(MOCK_APPLICATION as any)

    // São Paulo → ~700km de Pato Branco
    const res = await app.inject({
      method: 'POST',
      url: `/shifts/${SHIFT_ID}/checkin`,
      headers: wrk(),
      body: { lat: -23.55, lng: -46.63 },
    })

    expect(res.statusCode).toBe(422)
    expect(JSON.parse(res.body).error.code).toBe('CHECKIN_TOO_FAR')
  })

  it('aceita check-in com GPS impreciso sem verificar distância', async () => {
    vi.mocked(prisma.worker.findFirst).mockResolvedValueOnce(MOCK_WORKER as any)
    vi.mocked(prisma.shiftApplication.findFirst).mockResolvedValueOnce(MOCK_APPLICATION as any)
    vi.mocked(prisma.shiftApplication.update).mockResolvedValueOnce({} as any)

    // Localização errada mas accuracy > 100m → aceita com warning
    const res = await app.inject({
      method: 'POST',
      url: `/shifts/${SHIFT_ID}/checkin`,
      headers: wrk(),
      body: { lat: -23.55, lng: -46.63, accuracy: 150 },
    })

    expect(res.statusCode).toBe(200)
    expect(JSON.parse(res.body).data.warning).toBeDefined()
  })

  it('retorna 409 se check-in já realizado', async () => {
    const alreadyCheckedIn = { ...MOCK_APPLICATION, checkin_at: new Date() }
    vi.mocked(prisma.worker.findFirst).mockResolvedValueOnce(MOCK_WORKER as any)
    vi.mocked(prisma.shiftApplication.findFirst).mockResolvedValueOnce(alreadyCheckedIn as any)

    const res = await app.inject({
      method: 'POST',
      url: `/shifts/${SHIFT_ID}/checkin`,
      headers: wrk(),
      body: { lat: SHIFT_LAT, lng: SHIFT_LNG },
    })

    expect(res.statusCode).toBe(409)
    expect(JSON.parse(res.body).error.code).toBe('CHECKIN_ALREADY_DONE')
  })
})

// ─── POST /shifts/:id/checkout ────────────────────────────────────────────────

describe('POST /shifts/:id/checkout', () => {
  it('registra check-out e calcula horas trabalhadas', async () => {
    const checkedIn = {
      ...MOCK_APPLICATION,
      checkin_at: new Date(Date.now() - 4 * 3600 * 1000), // 4h atrás
    }
    vi.mocked(prisma.worker.findFirst).mockResolvedValueOnce(MOCK_WORKER as any)
    vi.mocked(prisma.shiftApplication.findFirst).mockResolvedValueOnce(checkedIn as any)
    vi.mocked(prisma.shiftApplication.update).mockResolvedValueOnce({} as any)

    const res = await app.inject({
      method: 'POST',
      url: `/shifts/${SHIFT_ID}/checkout`,
      headers: wrk(),
    })

    expect(res.statusCode).toBe(200)
    const { data } = JSON.parse(res.body)
    expect(data.checked_out).toBe(true)
    expect(data.hours_worked).toBeCloseTo(4, 1)
  })

  it('retorna 409 se check-in não foi realizado', async () => {
    vi.mocked(prisma.worker.findFirst).mockResolvedValueOnce(MOCK_WORKER as any)
    vi.mocked(prisma.shiftApplication.findFirst).mockResolvedValueOnce(MOCK_APPLICATION as any)

    const res = await app.inject({
      method: 'POST',
      url: `/shifts/${SHIFT_ID}/checkout`,
      headers: wrk(),
    })

    expect(res.statusCode).toBe(409)
    expect(JSON.parse(res.body).error.code).toBe('CHECKIN_NOT_DONE')
  })

  it('retorna 409 se check-out já realizado', async () => {
    const doubleCheckout = {
      ...MOCK_APPLICATION,
      checkin_at: new Date(Date.now() - 4 * 3600 * 1000),
      checkout_at: new Date(),
    }
    vi.mocked(prisma.worker.findFirst).mockResolvedValueOnce(MOCK_WORKER as any)
    vi.mocked(prisma.shiftApplication.findFirst).mockResolvedValueOnce(doubleCheckout as any)

    const res = await app.inject({
      method: 'POST',
      url: `/shifts/${SHIFT_ID}/checkout`,
      headers: wrk(),
    })

    expect(res.statusCode).toBe(409)
    expect(JSON.parse(res.body).error.code).toBe('CHECKOUT_ALREADY_DONE')
  })
})
