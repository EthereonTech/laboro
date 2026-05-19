import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest'
import Fastify, { FastifyInstance } from 'fastify'
import jwt from '@fastify/jwt'
import { registerErrorHandler } from '../../plugins/error-handler'

vi.mock('../../lib/prisma', () => ({
  prisma: {
    worker: { findFirst: vi.fn(), update: vi.fn() },
    user: { update: vi.fn() },
    workerSpecialty: { deleteMany: vi.fn(), createMany: vi.fn() },
    shiftApplication: { findMany: vi.fn() },
    escrowTransaction: { findMany: vi.fn() },
    $transaction: vi.fn(async (fn: any) => fn({
      user: { update: vi.fn().mockResolvedValue({}) },
      worker: { update: vi.fn() },
      workerSpecialty: { deleteMany: vi.fn(), createMany: vi.fn() },
    })),
  },
}))
vi.mock('../../lib/supabase', () => ({
  uploadPhoto: vi.fn().mockResolvedValue('https://storage.example.com/photo.jpg'),
}))

import { prisma } from '../../lib/prisma'
import { workersRoutes } from './workers.routes'

const MOCK_WORKER = {
  id: 'worker-1',
  user_id: 'user-1',
  pix_key: null,
  pix_key_type: null,
  score: 0,
  total_shifts: 0,
  on_time_rate: 0,
  level: 'BEGINNER',
  suspended_until: null,
  asaas_customer_id: null,
  user: { id: 'user-1', full_name: 'João Silva', phone: '+5541999999999', photo_url: null, is_verified: false },
  specialties: [{ specialty: 'garcom' }],
}

let app: FastifyInstance
let workerToken: string

beforeAll(async () => {
  process.env.JWT_SECRET = 'test-secret'

  app = Fastify()
  await app.register(jwt, { secret: 'test-secret' })
  registerErrorHandler(app)
  await app.register(workersRoutes)
  await app.ready()

  workerToken = await app.jwt.sign({ sub: 'user-1', type: 'worker' })
})

afterAll(async () => { await app.close() })

beforeEach(() => { vi.clearAllMocks() })

const authHeader = () => ({ Authorization: `Bearer ${workerToken}` })

describe('GET /workers/me', () => {
  it('retorna perfil do trabalhador autenticado', async () => {
    vi.mocked(prisma.worker.findFirst).mockResolvedValueOnce(MOCK_WORKER as any)

    const res = await app.inject({ method: 'GET', url: '/workers/me', headers: authHeader() })

    expect(res.statusCode).toBe(200)
    const { data } = JSON.parse(res.body)
    expect(data.id).toBe('worker-1')
    expect(data.full_name).toBe('João Silva')
    expect(data.level).toBe('BEGINNER')
    expect(data.specialties).toEqual(['garcom'])
  })

  it('retorna 401 sem token', async () => {
    const res = await app.inject({ method: 'GET', url: '/workers/me' })
    expect(res.statusCode).toBe(401)
  })

  it('retorna 404 se perfil não existe', async () => {
    vi.mocked(prisma.worker.findFirst).mockResolvedValueOnce(null)
    const res = await app.inject({ method: 'GET', url: '/workers/me', headers: authHeader() })
    expect(res.statusCode).toBe(404)
    expect(JSON.parse(res.body).error.code).toBe('WORKER_NOT_FOUND')
  })
})

describe('PUT /workers/me', () => {
  it('atualiza nome e chave Pix', async () => {
    vi.mocked(prisma.worker.findFirst).mockResolvedValueOnce(MOCK_WORKER as any)

    const updatedWorker = {
      ...MOCK_WORKER,
      pix_key: '41999999999',
      pix_key_type: 'phone',
      user: { ...MOCK_WORKER.user, full_name: 'João Atualizado' },
    }
    vi.mocked(prisma.$transaction).mockResolvedValueOnce(updatedWorker as any)

    const res = await app.inject({
      method: 'PUT',
      url: '/workers/me',
      headers: authHeader(),
      body: { full_name: 'João Atualizado', pix_key: '41999999999', pix_key_type: 'phone' },
    })

    expect(res.statusCode).toBe(200)
    const { data } = JSON.parse(res.body)
    expect(data.full_name).toBe('João Atualizado')
    expect(data.pix_key).toBe('41999999999')
  })

  it('retorna 400 para nome muito curto', async () => {
    const res = await app.inject({
      method: 'PUT',
      url: '/workers/me',
      headers: authHeader(),
      body: { full_name: 'Jo' },
    })
    expect(res.statusCode).toBe(400)
    expect(JSON.parse(res.body).error.code).toBe('VALIDATION_ERROR')
  })

  it('retorna 400 para especialidade inválida', async () => {
    const res = await app.inject({
      method: 'PUT',
      url: '/workers/me',
      headers: authHeader(),
      body: { specialties: ['piloto'] },
    })
    expect(res.statusCode).toBe(400)
  })

  it('retorna 403 para token de empresa tentando acessar rota de trabalhador', async () => {
    const businessToken = await app.jwt.sign({ sub: 'user-2', type: 'business' })
    const res = await app.inject({
      method: 'PUT',
      url: '/workers/me',
      headers: { Authorization: `Bearer ${businessToken}` },
      body: { full_name: 'Empresa Tentando' },
    })
    expect(res.statusCode).toBe(403)
  })
})

const WORKER_UUID = '00000000-0000-0000-0000-000000000001'

describe('GET /workers/:id', () => {
  it('retorna perfil público de um trabalhador', async () => {
    vi.mocked(prisma.worker.findFirst).mockResolvedValueOnce(MOCK_WORKER as any)

    const res = await app.inject({
      method: 'GET',
      url: `/workers/${WORKER_UUID}`,
      headers: authHeader(),
    })

    expect(res.statusCode).toBe(200)
    expect(JSON.parse(res.body).data.id).toBe('worker-1')
  })

  it('retorna 400 para ID com formato inválido', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/workers/nao-e-uuid',
      headers: authHeader(),
    })
    expect(res.statusCode).toBe(400)
  })
})

describe('GET /workers/me/applications', () => {
  const MOCK_APPLICATION = {
    id: 'app-1',
    status: 'CONFIRMED',
    checkin_at: null,
    checkout_at: null,
    hours_worked: null,
    created_at: new Date(),
    shift: {
      id: 'shift-1',
      specialty: 'garcom',
      starts_at: new Date('2026-06-01T18:00:00Z'),
      ends_at: new Date('2026-06-01T23:00:00Z'),
      rate_per_hour: 25,
      total_value: 125,
      laboro_fee: 22.5,
      status: 'FILLED',
      is_urgent: false,
      address: null,
      business: { trade_name: 'Bar do João', user: { photo_url: null } },
    },
  }

  it('retorna lista de candidaturas do trabalhador', async () => {
    vi.mocked(prisma.worker.findFirst).mockResolvedValueOnce(MOCK_WORKER as any)
    vi.mocked(prisma.shiftApplication.findMany).mockResolvedValueOnce([MOCK_APPLICATION as any])

    const res = await app.inject({ method: 'GET', url: '/workers/me/applications', headers: authHeader() })

    expect(res.statusCode).toBe(200)
    const { data } = JSON.parse(res.body)
    expect(data).toHaveLength(1)
    expect(data[0].status).toBe('CONFIRMED')
    expect(data[0].shift.specialty).toBe('garcom')
  })

  it('retorna 401 sem token', async () => {
    const res = await app.inject({ method: 'GET', url: '/workers/me/applications' })
    expect(res.statusCode).toBe(401)
  })
})

describe('GET /workers/me/payments', () => {
  const MOCK_ESCROW = {
    id: 'escrow-1',
    shift_id: 'shift-1',
    worker_amount: 102.5,
    status: 'RELEASED',
    reserved_at: new Date(),
    confirmed_at: new Date(),
    released_at: new Date(),
    refunded_at: null,
    shift: { specialty: 'garcom', starts_at: new Date('2026-06-01T18:00:00Z'), ends_at: new Date('2026-06-01T23:00:00Z') },
  }

  it('retorna histórico de pagamentos do trabalhador', async () => {
    vi.mocked(prisma.worker.findFirst).mockResolvedValueOnce(MOCK_WORKER as any)
    vi.mocked(prisma.escrowTransaction.findMany).mockResolvedValueOnce([MOCK_ESCROW as any])

    const res = await app.inject({ method: 'GET', url: '/workers/me/payments', headers: authHeader() })

    expect(res.statusCode).toBe(200)
    const { data } = JSON.parse(res.body)
    expect(data).toHaveLength(1)
    expect(data[0].worker_amount).toBe(102.5)
    expect(data[0].status).toBe('RELEASED')
  })

  it('retorna 401 sem token', async () => {
    const res = await app.inject({ method: 'GET', url: '/workers/me/payments' })
    expect(res.statusCode).toBe(401)
  })
})

describe('PUT /workers/me/specialties', () => {
  it('atualiza especialidades do trabalhador', async () => {
    vi.mocked(prisma.worker.findFirst).mockResolvedValueOnce(MOCK_WORKER as any)
    vi.mocked(prisma.$transaction).mockResolvedValueOnce(undefined as any)

    const res = await app.inject({
      method: 'PUT',
      url: '/workers/me/specialties',
      headers: authHeader(),
      body: { specialties: ['garcom', 'bartender'] },
    })

    expect(res.statusCode).toBe(200)
    expect(JSON.parse(res.body).data.specialties).toEqual(['garcom', 'bartender'])
  })

  it('retorna 400 quando specialties não é array', async () => {
    const res = await app.inject({
      method: 'PUT',
      url: '/workers/me/specialties',
      headers: authHeader(),
      body: { specialties: 'garcom' },
    })
    expect(res.statusCode).toBe(400)
  })
})
