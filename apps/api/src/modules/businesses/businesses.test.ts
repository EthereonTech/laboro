import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest'
import Fastify, { FastifyInstance } from 'fastify'
import jwt from '@fastify/jwt'
import { registerErrorHandler } from '../../plugins/error-handler'

vi.mock('../../lib/prisma', () => ({
  prisma: {
    business: { findFirst: vi.fn(), create: vi.fn(), update: vi.fn() },
    user: { update: vi.fn() },
    shift: { findMany: vi.fn(), count: vi.fn() },
    shiftApplication: { count: vi.fn() },
    escrowTransaction: { findMany: vi.fn(), aggregate: vi.fn() },
    $transaction: vi.fn(async (fn: any) => fn({
      user: { update: vi.fn().mockResolvedValue({}) },
      business: { update: vi.fn() },
    })),
  },
}))
vi.mock('../../lib/supabase', () => ({
  uploadPhoto: vi.fn().mockResolvedValue('https://storage.example.com/logo.jpg'),
}))

// Mock fetch para BrasilAPI CNPJ
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

import { prisma } from '../../lib/prisma'
import { businessesRoutes } from './businesses.routes'

const MOCK_SHIFT = {
  id: 'shift-1',
  specialty: 'garcom',
  starts_at: new Date('2026-06-01T18:00:00Z'),
  ends_at: new Date('2026-06-01T23:00:00Z'),
  slots: 2,
  rate_per_hour: 25,
  total_value: 250,
  laboro_fee: 45,
  status: 'OPEN',
  is_urgent: false,
  instructions: null,
  address: null,
  applications: [],
}

const MOCK_ESCROW = {
  id: 'escrow-1',
  shift_id: 'shift-1',
  gross_amount: 250,
  laboro_fee: 45,
  worker_amount: 205,
  status: 'RELEASED',
  reserved_at: new Date(),
  confirmed_at: new Date(),
  released_at: new Date(),
  refunded_at: null,
  shift: { specialty: 'garcom', starts_at: new Date('2026-06-01T18:00:00Z'), ends_at: new Date('2026-06-01T23:00:00Z') },
}

const VALID_CNPJ = '11222333000181' // CNPJ com dígitos válidos (fictício)

const MOCK_BUSINESS = {
  id: 'biz-1',
  user_id: 'user-2',
  cnpj: VALID_CNPJ,
  trade_name: 'Bar do João',
  legal_name: 'Bar do João LTDA',
  segment: 'bar',
  address: {
    street: 'Rua das Flores',
    number: '123',
    neighborhood: 'Centro',
    city: 'Pato Branco',
    state: 'PR',
    zip: '85501000',
  },
  score: 0,
  user: { id: 'user-2', full_name: 'João Empresário', phone: '+5546999999999', photo_url: null, is_verified: false },
}

let app: FastifyInstance
let businessToken: string
let workerToken: string

beforeAll(async () => {
  process.env.JWT_SECRET = 'test-secret'

  app = Fastify()
  await app.register(jwt, { secret: 'test-secret' })
  registerErrorHandler(app)
  await app.register(businessesRoutes)
  await app.ready()

  businessToken = await app.jwt.sign({ sub: 'user-2', type: 'business' })
  workerToken = await app.jwt.sign({ sub: 'user-1', type: 'worker' })
})

afterAll(async () => { await app.close() })

beforeEach(() => {
  vi.clearAllMocks()
  // Receita Federal mock padrão: CNPJ ativo
  mockFetch.mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({ situacao_cadastral: '02', descricao_situacao_cadastral: 'ATIVA' }),
  })
})

const authHeader = (token: string) => ({ Authorization: `Bearer ${token}` })

describe('POST /businesses/me', () => {
  const validBody = {
    cnpj: VALID_CNPJ,
    trade_name: 'Bar do João',
    legal_name: 'Bar do João LTDA',
    segment: 'bar',
    address: {
      street: 'Rua das Flores',
      number: '123',
      neighborhood: 'Centro',
      city: 'Pato Branco',
      state: 'PR',
      zip: '85501000',
    },
  }

  it('cria empresa com 201 e dados válidos', async () => {
    vi.mocked(prisma.business.findFirst)
      .mockResolvedValueOnce(null)   // isCnpjTaken
      .mockResolvedValueOnce(null)   // existing check
    vi.mocked(prisma.business.create).mockResolvedValueOnce(MOCK_BUSINESS as any)

    const res = await app.inject({
      method: 'POST',
      url: '/businesses/me',
      headers: authHeader(businessToken),
      body: validBody,
    })

    expect(res.statusCode).toBe(201)
    const { data } = JSON.parse(res.body)
    expect(data.cnpj).toBe(VALID_CNPJ)
    expect(data.trade_name).toBe('Bar do João')
    expect(data.segment).toBe('bar')
  })

  it('retorna 403 para trabalhador tentando criar empresa', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/businesses/me',
      headers: authHeader(workerToken),
      body: validBody,
    })
    expect(res.statusCode).toBe(403)
  })

  it('retorna 422 para CNPJ com dígitos inválidos', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/businesses/me',
      headers: authHeader(businessToken),
      body: { ...validBody, cnpj: '11111111111111' },
    })
    expect(res.statusCode).toBe(422)
    expect(JSON.parse(res.body).error.code).toBe('CNPJ_INVALID')
  })

  it('retorna 422 para CNPJ com formato errado (com pontuação)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/businesses/me',
      headers: authHeader(businessToken),
      body: { ...validBody, cnpj: '11.222.333/0001-81' },
    })
    expect(res.statusCode).toBe(400)
    expect(JSON.parse(res.body).error.code).toBe('VALIDATION_ERROR')
  })

  it('retorna 409 se CNPJ já cadastrado', async () => {
    vi.mocked(prisma.business.findFirst).mockResolvedValueOnce(MOCK_BUSINESS as any)

    const res = await app.inject({
      method: 'POST',
      url: '/businesses/me',
      headers: authHeader(businessToken),
      body: validBody,
    })
    expect(res.statusCode).toBe(409)
    expect(JSON.parse(res.body).error.code).toBe('CNPJ_ALREADY_REGISTERED')
  })

  it('retorna 409 se empresa já existe para este usuário', async () => {
    vi.mocked(prisma.business.findFirst)
      .mockResolvedValueOnce(null)              // isCnpjTaken
      .mockResolvedValueOnce(MOCK_BUSINESS as any) // existing

    const res = await app.inject({
      method: 'POST',
      url: '/businesses/me',
      headers: authHeader(businessToken),
      body: validBody,
    })
    expect(res.statusCode).toBe(409)
    expect(JSON.parse(res.body).error.code).toBe('BUSINESS_ALREADY_EXISTS')
  })

  it('retorna 422 se CNPJ inativo na Receita Federal', async () => {
    vi.mocked(prisma.business.findFirst)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null)

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ situacao_cadastral: '08', descricao_situacao_cadastral: 'BAIXADA' }),
    })

    const res = await app.inject({
      method: 'POST',
      url: '/businesses/me',
      headers: authHeader(businessToken),
      body: validBody,
    })
    expect(res.statusCode).toBe(422)
    expect(JSON.parse(res.body).error.code).toBe('CNPJ_INACTIVE')
  })
})

describe('GET /businesses/me', () => {
  it('retorna perfil da empresa autenticada', async () => {
    vi.mocked(prisma.business.findFirst).mockResolvedValueOnce(MOCK_BUSINESS as any)

    const res = await app.inject({ method: 'GET', url: '/businesses/me', headers: authHeader(businessToken) })

    expect(res.statusCode).toBe(200)
    const { data } = JSON.parse(res.body)
    expect(data.cnpj).toBe(VALID_CNPJ)
    expect(data.segment).toBe('bar')
  })

  it('retorna 401 sem token', async () => {
    const res = await app.inject({ method: 'GET', url: '/businesses/me' })
    expect(res.statusCode).toBe(401)
  })
})

describe('PUT /businesses/me', () => {
  it('atualiza nome fantasia', async () => {
    vi.mocked(prisma.business.findFirst).mockResolvedValueOnce(MOCK_BUSINESS as any)
    const updated = { ...MOCK_BUSINESS, trade_name: 'Bar do João Premium' }
    vi.mocked(prisma.$transaction).mockResolvedValueOnce(updated as any)

    const res = await app.inject({
      method: 'PUT',
      url: '/businesses/me',
      headers: authHeader(businessToken),
      body: { trade_name: 'Bar do João Premium' },
    })

    expect(res.statusCode).toBe(200)
    expect(JSON.parse(res.body).data.trade_name).toBe('Bar do João Premium')
  })

  it('retorna 400 para segmento inválido', async () => {
    const res = await app.inject({
      method: 'PUT',
      url: '/businesses/me',
      headers: authHeader(businessToken),
      body: { segment: 'academia' },
    })
    expect(res.statusCode).toBe(400)
  })
})

describe('POST /businesses/validate-cnpj', () => {
  it('retorna valid:true para CNPJ válido e ativo', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/businesses/validate-cnpj',
      headers: authHeader(businessToken),
      body: { cnpj: VALID_CNPJ },
    })
    expect(res.statusCode).toBe(200)
    expect(JSON.parse(res.body).data.valid).toBe(true)
  })

  it('retorna 422 para CNPJ com dígitos inválidos', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/businesses/validate-cnpj',
      headers: authHeader(businessToken),
      body: { cnpj: '11111111111111' },
    })
    expect(res.statusCode).toBe(422)
  })

  it('retorna 400 sem campo cnpj', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/businesses/validate-cnpj',
      headers: authHeader(businessToken),
      body: {},
    })
    expect(res.statusCode).toBe(400)
  })

  it('retorna 401 sem token', async () => {
    const res = await app.inject({ method: 'POST', url: '/businesses/validate-cnpj', body: { cnpj: VALID_CNPJ } })
    expect(res.statusCode).toBe(401)
  })
})

describe('GET /businesses/me/shifts', () => {
  it('retorna lista de vagas da empresa', async () => {
    vi.mocked(prisma.business.findFirst).mockResolvedValueOnce(MOCK_BUSINESS as any)
    vi.mocked(prisma.shift.findMany).mockResolvedValueOnce([MOCK_SHIFT as any])

    const res = await app.inject({ method: 'GET', url: '/businesses/me/shifts', headers: authHeader(businessToken) })

    expect(res.statusCode).toBe(200)
    const { data } = JSON.parse(res.body)
    expect(data).toHaveLength(1)
    expect(data[0].specialty).toBe('garcom')
  })

  it('retorna 401 sem token', async () => {
    const res = await app.inject({ method: 'GET', url: '/businesses/me/shifts' })
    expect(res.statusCode).toBe(401)
  })
})

describe('GET /businesses/me/payments', () => {
  it('retorna histórico de escrow da empresa', async () => {
    vi.mocked(prisma.business.findFirst).mockResolvedValueOnce(MOCK_BUSINESS as any)
    vi.mocked(prisma.escrowTransaction.findMany).mockResolvedValueOnce([MOCK_ESCROW as any])

    const res = await app.inject({ method: 'GET', url: '/businesses/me/payments', headers: authHeader(businessToken) })

    expect(res.statusCode).toBe(200)
    const { data } = JSON.parse(res.body)
    expect(data).toHaveLength(1)
    expect(data[0].gross_amount).toBe(250)
    expect(data[0].status).toBe('RELEASED')
  })

  it('retorna 401 sem token', async () => {
    const res = await app.inject({ method: 'GET', url: '/businesses/me/payments' })
    expect(res.statusCode).toBe(401)
  })
})

describe('GET /businesses/me/dashboard', () => {
  it('retorna dados do dashboard com métricas', async () => {
    vi.mocked(prisma.business.findFirst).mockResolvedValueOnce(MOCK_BUSINESS as any)
    vi.mocked(prisma.shift.findMany).mockResolvedValueOnce([MOCK_SHIFT as any])
    vi.mocked(prisma.escrowTransaction.aggregate).mockResolvedValueOnce({ _sum: { gross_amount: 500 } } as any)
    vi.mocked(prisma.shiftApplication.count).mockResolvedValueOnce(3)
    vi.mocked(prisma.shift.count).mockResolvedValueOnce(10)

    const res = await app.inject({ method: 'GET', url: '/businesses/me/dashboard', headers: authHeader(businessToken) })

    expect(res.statusCode).toBe(200)
    const { data } = JSON.parse(res.body)
    expect(data.monthly_spent).toBe(500)
    expect(data.pending_applications).toBe(3)
    expect(data.completed_shifts).toBe(10)
    expect(data.active_shifts).toHaveLength(1)
  })

  it('retorna 401 sem token', async () => {
    const res = await app.inject({ method: 'GET', url: '/businesses/me/dashboard' })
    expect(res.statusCode).toBe(401)
  })
})
