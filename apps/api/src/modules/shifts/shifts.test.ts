import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest'
import Fastify, { FastifyInstance } from 'fastify'
import jwt from '@fastify/jwt'
import { ShiftStatus, ApplicationStatus } from '@prisma/client'
import { registerErrorHandler } from '../../plugins/error-handler'

vi.mock('../../lib/prisma', () => ({
  prisma: {
    shift: { findFirst: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn() },
    shiftApplication: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    business: { findFirst: vi.fn() },
    worker: { findFirst: vi.fn(), updateMany: vi.fn() },
    escrowTransaction: { findFirst: vi.fn(), create: vi.fn(), update: vi.fn() },
  },
}))
vi.mock('../../jobs', () => ({
  shiftQueue: { add: vi.fn().mockResolvedValue(undefined) },
  escrowQueue: { add: vi.fn().mockResolvedValue(undefined) },
  notificationsQueue: { add: vi.fn().mockResolvedValue(undefined) },
}))
vi.mock('../payments/payments.service', () => ({
  reserveEscrow: vi.fn().mockResolvedValue(undefined),
  refundEscrowFull: vi.fn().mockResolvedValue(undefined),
}))

import { prisma } from '../../lib/prisma'
import { shiftsRoutes } from './shifts.routes'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const BUSINESS_USER_ID = 'user-biz-1'
const WORKER_USER_ID = 'user-wrk-1'
const SHIFT_ID = '00000000-0000-0000-0000-000000000010'
const WORKER_ID = '00000000-0000-0000-0000-000000000020'

const MOCK_BUSINESS = {
  id: 'biz-1',
  user_id: BUSINESS_USER_ID,
  trade_name: 'Bar do João',
  address: { street: 'Rua A', number: '1', neighborhood: 'Centro', city: 'PB', state: 'PR', zip: '85501000', lat: -26.22, lng: -52.67 },
}

const MOCK_WORKER = {
  id: WORKER_ID,
  user_id: WORKER_USER_ID,
  score: 4.5,
  total_shifts: 10,
  on_time_rate: 95,
  level: 'VERIFIED',
  suspended_until: null,
  user: { id: WORKER_USER_ID, full_name: 'Ana Garçom', phone: '+5546999999999', photo_url: null, is_verified: true },
  specialties: [{ specialty: 'garcom' }],
}

const future = new Date(Date.now() + 48 * 3600 * 1000)
const futureEnd = new Date(Date.now() + 52 * 3600 * 1000)

const MOCK_SHIFT = {
  id: SHIFT_ID,
  business_id: 'biz-1',
  specialty: 'garcom',
  starts_at: future,
  ends_at: futureEnd,
  slots: 2,
  rate_per_hour: 25,
  total_value: 100,
  laboro_fee: 18,
  instructions: null,
  status: ShiftStatus.OPEN,
  address: null,
  is_urgent: false,
  deleted_at: null,
  business: {
    id: 'biz-1',
    trade_name: 'Bar do João',
    address: MOCK_BUSINESS.address,
    user: { full_name: 'João Empresário' },
  },
  applications: [],
}

let app: FastifyInstance
let bizToken: string
let workerToken: string

beforeAll(async () => {
  process.env.JWT_SECRET = 'test-secret'

  app = Fastify()
  await app.register(jwt, { secret: 'test-secret' })
  registerErrorHandler(app)
  await app.register(shiftsRoutes)
  await app.ready()

  bizToken = await app.jwt.sign({ sub: BUSINESS_USER_ID, type: 'business' })
  workerToken = await app.jwt.sign({ sub: WORKER_USER_ID, type: 'worker' })
})

afterAll(async () => { await app.close() })

beforeEach(() => { vi.clearAllMocks() })

const biz = () => ({ Authorization: `Bearer ${bizToken}` })
const wrk = () => ({ Authorization: `Bearer ${workerToken}` })

// ─── POST /shifts ──────────────────────────────────────────────────────────────

describe('POST /shifts', () => {
  const validBody = {
    specialty: 'garcom',
    starts_at: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
    ends_at: new Date(Date.now() + 52 * 3600 * 1000).toISOString(),
    slots: 2,
    rate_per_hour: 25,
    is_urgent: false,
  }

  it('cria vaga e calcula valores corretamente', async () => {
    vi.mocked(prisma.business.findFirst).mockResolvedValueOnce(MOCK_BUSINESS as any)
    vi.mocked(prisma.shift.create).mockResolvedValueOnce(MOCK_SHIFT as any)

    const res = await app.inject({ method: 'POST', url: '/shifts', headers: biz(), body: validBody })

    expect(res.statusCode).toBe(201)
    const { data } = JSON.parse(res.body)
    expect(data.specialty).toBe('garcom')
    expect(data.slots).toBe(2)
    expect(data.laboro_fee).toBe(18)       // 18% de 100
    expect(data.worker_amount).toBe(82)    // 100 - 18
  })

  it('retorna 400 para turno no passado', async () => {
    const res = await app.inject({
      method: 'POST', url: '/shifts', headers: biz(),
      body: { ...validBody, starts_at: new Date(Date.now() - 3600000).toISOString() },
    })
    expect(res.statusCode).toBe(400)
    expect(JSON.parse(res.body).error.code).toBe('VALIDATION_ERROR')
  })

  it('retorna 400 quando ends_at <= starts_at', async () => {
    const t = new Date(Date.now() + 48 * 3600 * 1000).toISOString()
    const res = await app.inject({
      method: 'POST', url: '/shifts', headers: biz(),
      body: { ...validBody, ends_at: t, starts_at: t },
    })
    expect(res.statusCode).toBe(400)
  })

  it('retorna 403 para trabalhador tentando criar vaga', async () => {
    const res = await app.inject({ method: 'POST', url: '/shifts', headers: wrk(), body: validBody })
    expect(res.statusCode).toBe(403)
  })
})

// ─── GET /shifts ───────────────────────────────────────────────────────────────

describe('GET /shifts', () => {
  it('lista vagas dentro do raio com distância calculada', async () => {
    vi.mocked(prisma.worker.findFirst).mockResolvedValueOnce(MOCK_WORKER as any)
    vi.mocked(prisma.shift.findMany).mockResolvedValueOnce([MOCK_SHIFT as any])

    // Trabalhador no mesmo ponto que o endereço do negócio → distância ≈ 0
    const res = await app.inject({
      method: 'GET',
      url: '/shifts?lat=-26.22&lng=-52.67&radius=50000',
      headers: wrk(),
    })

    expect(res.statusCode).toBe(200)
    const body = JSON.parse(res.body)
    expect(body.data).toHaveLength(1)
    expect(body.data[0].distance_meters).toBeLessThan(100)
    expect(body.meta.total).toBe(1)
  })

  it('exclui vagas fora do raio', async () => {
    vi.mocked(prisma.worker.findFirst).mockResolvedValueOnce(MOCK_WORKER as any)
    vi.mocked(prisma.shift.findMany).mockResolvedValueOnce([MOCK_SHIFT as any])

    // Trabalhador em São Paulo → ~700km de Pato Branco → fora do raio de 50km
    const res = await app.inject({
      method: 'GET',
      url: '/shifts?lat=-23.55&lng=-46.63&radius=50000',
      headers: wrk(),
    })

    expect(res.statusCode).toBe(200)
    expect(JSON.parse(res.body).data).toHaveLength(0)
  })

  it('retorna 401 sem autenticação', async () => {
    const res = await app.inject({ method: 'GET', url: '/shifts?lat=-26.22&lng=-52.67' })
    expect(res.statusCode).toBe(401)
  })

  it('retorna 400 sem lat/lng', async () => {
    const res = await app.inject({ method: 'GET', url: '/shifts', headers: wrk() })
    expect(res.statusCode).toBe(400)
  })
})

// ─── POST /shifts/:id/apply ────────────────────────────────────────────────────

describe('POST /shifts/:id/apply', () => {
  it('trabalhador se candidata com sucesso', async () => {
    vi.mocked(prisma.worker.findFirst).mockResolvedValueOnce(MOCK_WORKER as any)
    vi.mocked(prisma.shift.findFirst).mockResolvedValueOnce(MOCK_SHIFT as any)
    vi.mocked(prisma.shiftApplication.findUnique).mockResolvedValueOnce(null)
    vi.mocked(prisma.shiftApplication.count).mockResolvedValueOnce(0)
    vi.mocked(prisma.shiftApplication.create).mockResolvedValueOnce({ id: 'app-1' } as any)

    const res = await app.inject({ method: 'POST', url: `/shifts/${SHIFT_ID}/apply`, headers: wrk() })

    expect(res.statusCode).toBe(201)
    expect(JSON.parse(res.body).data.applied).toBe(true)
  })

  it('retorna 409 se já candidatado', async () => {
    vi.mocked(prisma.worker.findFirst).mockResolvedValueOnce(MOCK_WORKER as any)
    vi.mocked(prisma.shift.findFirst).mockResolvedValueOnce(MOCK_SHIFT as any)
    vi.mocked(prisma.shiftApplication.findUnique).mockResolvedValueOnce({ id: 'app-1', status: 'PENDING' } as any)

    const res = await app.inject({ method: 'POST', url: `/shifts/${SHIFT_ID}/apply`, headers: wrk() })

    expect(res.statusCode).toBe(409)
    expect(JSON.parse(res.body).error.code).toBe('SHIFT_ALREADY_APPLIED')
  })

  it('retorna 409 quando vaga está cheia', async () => {
    vi.mocked(prisma.worker.findFirst).mockResolvedValueOnce(MOCK_WORKER as any)
    vi.mocked(prisma.shift.findFirst).mockResolvedValueOnce(MOCK_SHIFT as any)
    vi.mocked(prisma.shiftApplication.findUnique).mockResolvedValueOnce(null)
    vi.mocked(prisma.shiftApplication.count).mockResolvedValueOnce(2) // slots = 2

    const res = await app.inject({ method: 'POST', url: `/shifts/${SHIFT_ID}/apply`, headers: wrk() })

    expect(res.statusCode).toBe(409)
    expect(JSON.parse(res.body).error.code).toBe('SHIFT_FULL')
  })

  it('retorna 403 para trabalhador suspenso', async () => {
    const suspended = { ...MOCK_WORKER, suspended_until: new Date(Date.now() + 48 * 3600 * 1000) }
    vi.mocked(prisma.worker.findFirst).mockResolvedValueOnce(suspended as any)

    const res = await app.inject({ method: 'POST', url: `/shifts/${SHIFT_ID}/apply`, headers: wrk() })

    expect(res.statusCode).toBe(403)
    expect(JSON.parse(res.body).error.code).toBe('WORKER_SUSPENDED')
  })
})

// ─── POST /shifts/:id/confirm/:workerId ────────────────────────────────────────

describe('POST /shifts/:id/confirm/:workerId', () => {
  const url = `/shifts/${SHIFT_ID}/confirm/${WORKER_ID}`

  it('empresa confirma trabalhador com sucesso', async () => {
    vi.mocked(prisma.business.findFirst).mockResolvedValueOnce(MOCK_BUSINESS as any)
    vi.mocked(prisma.shift.findFirst).mockResolvedValueOnce(MOCK_SHIFT as any)
    vi.mocked(prisma.shiftApplication.findUnique).mockResolvedValueOnce({ id: 'app-1', status: ApplicationStatus.PENDING } as any)
    vi.mocked(prisma.shiftApplication.count).mockResolvedValueOnce(0) // 0 confirmados até agora
    vi.mocked(prisma.shiftApplication.update).mockResolvedValueOnce({} as any)
    // slots=2, confirmados=1 → não FILLED ainda, nenhum update no shift

    const res = await app.inject({ method: 'POST', url, headers: biz() })

    expect(res.statusCode).toBe(200)
    expect(JSON.parse(res.body).data.confirmed).toBe(true)
  })

  it('marca vaga como FILLED ao confirmar último slot', async () => {
    vi.mocked(prisma.business.findFirst).mockResolvedValueOnce(MOCK_BUSINESS as any)
    vi.mocked(prisma.shift.findFirst).mockResolvedValueOnce(MOCK_SHIFT as any) // slots=2
    vi.mocked(prisma.shiftApplication.findUnique).mockResolvedValueOnce({ id: 'app-1', status: ApplicationStatus.PENDING } as any)
    vi.mocked(prisma.shiftApplication.count).mockResolvedValueOnce(1) // já 1 confirmado → esse é o último
    vi.mocked(prisma.shiftApplication.update).mockResolvedValueOnce({} as any)
    vi.mocked(prisma.shift.update).mockResolvedValueOnce({ ...MOCK_SHIFT, status: ShiftStatus.FILLED } as any)

    const res = await app.inject({ method: 'POST', url, headers: biz() })

    expect(res.statusCode).toBe(200)
    expect(vi.mocked(prisma.shift.update)).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: ShiftStatus.FILLED } }),
    )
  })

  it('retorna 409 se candidatura não está pendente', async () => {
    vi.mocked(prisma.business.findFirst).mockResolvedValueOnce(MOCK_BUSINESS as any)
    vi.mocked(prisma.shift.findFirst).mockResolvedValueOnce(MOCK_SHIFT as any)
    vi.mocked(prisma.shiftApplication.findUnique).mockResolvedValueOnce({ id: 'app-1', status: ApplicationStatus.CONFIRMED } as any)

    const res = await app.inject({ method: 'POST', url, headers: biz() })

    expect(res.statusCode).toBe(409)
    expect(JSON.parse(res.body).error.code).toBe('APPLICATION_NOT_PENDING')
  })
})

// ─── DELETE /shifts/:id ────────────────────────────────────────────────────────

describe('DELETE /shifts/:id', () => {
  it('cancela vaga com política gratuita (>24h)', async () => {
    vi.mocked(prisma.business.findFirst).mockResolvedValueOnce(MOCK_BUSINESS as any)
    vi.mocked(prisma.shift.findFirst).mockResolvedValueOnce(MOCK_SHIFT as any) // 48h no futuro
    vi.mocked(prisma.shift.update).mockResolvedValueOnce({ ...MOCK_SHIFT, status: ShiftStatus.CANCELLED } as any)

    const res = await app.inject({ method: 'DELETE', url: `/shifts/${SHIFT_ID}`, headers: biz() })

    expect(res.statusCode).toBe(200)
    const { data } = JSON.parse(res.body)
    expect(data.cancelled).toBe(true)
    expect(data.policy).toBe('free')
  })

  it('retorna 403 quando empresa tenta cancelar vaga de outra empresa', async () => {
    const otherBusiness = { ...MOCK_BUSINESS, id: 'biz-other' }
    vi.mocked(prisma.business.findFirst).mockResolvedValueOnce(otherBusiness as any)
    vi.mocked(prisma.shift.findFirst).mockResolvedValueOnce(MOCK_SHIFT as any) // business_id = 'biz-1'

    const res = await app.inject({ method: 'DELETE', url: `/shifts/${SHIFT_ID}`, headers: biz() })

    expect(res.statusCode).toBe(403)
  })
})

// ─── POST /shifts/:id/cancel ───────────────────────────────────────────────────

describe('POST /shifts/:id/cancel', () => {
  it('cancela vaga via POST (mobile) com política gratuita (>24h)', async () => {
    vi.mocked(prisma.business.findFirst).mockResolvedValueOnce(MOCK_BUSINESS as any)
    vi.mocked(prisma.shift.findFirst).mockResolvedValueOnce(MOCK_SHIFT as any) // 48h no futuro
    vi.mocked(prisma.shift.update).mockResolvedValueOnce({ ...MOCK_SHIFT, status: ShiftStatus.CANCELLED } as any)

    const res = await app.inject({ method: 'POST', url: `/shifts/${SHIFT_ID}/cancel`, headers: biz() })

    expect(res.statusCode).toBe(200)
    const { data } = JSON.parse(res.body)
    expect(data.cancelled).toBe(true)
    expect(data.policy).toBe('free')
  })

  it('retorna 403 para trabalhador tentando cancelar vaga', async () => {
    const res = await app.inject({ method: 'POST', url: `/shifts/${SHIFT_ID}/cancel`, headers: wrk() })
    expect(res.statusCode).toBe(403)
  })
})

// ─── GET /shifts/:id/my-application ───────────────────────────────────────────

describe('GET /shifts/:id/my-application', () => {
  const MOCK_APPLICATION = {
    id: 'app-1',
    status: ApplicationStatus.CONFIRMED,
    checkin_at: null,
    checkout_at: null,
    hours_worked: null,
  }

  it('retorna candidatura do trabalhador para a vaga', async () => {
    vi.mocked(prisma.worker.findFirst).mockResolvedValueOnce(MOCK_WORKER as any)
    vi.mocked(prisma.shift.findFirst).mockResolvedValueOnce(MOCK_SHIFT as any)
    vi.mocked(prisma.shiftApplication.findUnique).mockResolvedValueOnce(MOCK_APPLICATION as any)

    const res = await app.inject({ method: 'GET', url: `/shifts/${SHIFT_ID}/my-application`, headers: wrk() })

    expect(res.statusCode).toBe(200)
    const { data } = JSON.parse(res.body)
    expect(data.id).toBe('app-1')
    expect(data.status).toBe('CONFIRMED')
  })

  it('retorna 404 quando trabalhador não se candidatou', async () => {
    vi.mocked(prisma.worker.findFirst).mockResolvedValueOnce(MOCK_WORKER as any)
    vi.mocked(prisma.shift.findFirst).mockResolvedValueOnce(MOCK_SHIFT as any)
    vi.mocked(prisma.shiftApplication.findUnique).mockResolvedValueOnce(null)

    const res = await app.inject({ method: 'GET', url: `/shifts/${SHIFT_ID}/my-application`, headers: wrk() })

    expect(res.statusCode).toBe(404)
    expect(JSON.parse(res.body).error.code).toBe('APPLICATION_NOT_FOUND')
  })

  it('retorna 403 para empresa tentando acessar candidatura de trabalhador', async () => {
    const res = await app.inject({ method: 'GET', url: `/shifts/${SHIFT_ID}/my-application`, headers: biz() })
    expect(res.statusCode).toBe(403)
  })
})
