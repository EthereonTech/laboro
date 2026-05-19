import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest'
import Fastify, { FastifyInstance } from 'fastify'
import jwt from '@fastify/jwt'
import { ApplicationStatus } from '@prisma/client'
import { registerErrorHandler } from '../../plugins/error-handler'

vi.mock('../../lib/prisma', () => ({
  prisma: {
    worker: { findFirst: vi.fn() },
    business: { findFirst: vi.fn() },
    shift: { findFirst: vi.fn() },
    shiftApplication: { findFirst: vi.fn() },
    rating: { findFirst: vi.fn(), create: vi.fn() },
  },
}))
vi.mock('../../jobs', () => ({
  scoreQueue: { add: vi.fn().mockResolvedValue(undefined) },
}))

import { prisma } from '../../lib/prisma'
import { scoreQueue } from '../../jobs'
import { ratingsRoutes } from './ratings.routes'

// ─── Fixtures ────────────────────────────────────────────────────────────────

const BIZ_USER_ID = 'user-biz-1'
const WRK_USER_ID = 'user-wrk-1'
const SHIFT_ID = '00000000-0000-0000-0000-000000000010'
const WORKER_ID = '00000000-0000-0000-0000-000000000020'
const BIZ_ID = '00000000-0000-0000-0000-000000000030'

const MOCK_BUSINESS = { id: BIZ_ID, user_id: BIZ_USER_ID }
const MOCK_WORKER = { id: WORKER_ID, user_id: WRK_USER_ID }
const MOCK_SHIFT = { id: SHIFT_ID, business_id: BIZ_ID }
const MOCK_COMPLETED_APP = { id: 'app-1', shift_id: SHIFT_ID, worker_id: WORKER_ID, status: ApplicationStatus.COMPLETED }

const RATING_BODY_BIZ = {
  shift_id: SHIFT_ID,
  to_id: WORKER_ID,
  score: 5,
  tags: ['pontual', 'trabalhou_bem'],
  comment: 'Ótimo trabalho!',
}

const RATING_BODY_WRK = {
  shift_id: SHIFT_ID,
  to_id: BIZ_ID,
  score: 4,
  tags: ['pagamento_rapido'],
}

let app: FastifyInstance
let bizToken: string
let workerToken: string

beforeAll(async () => {
  process.env.JWT_SECRET = 'test-secret'
  app = Fastify()
  await app.register(jwt, { secret: 'test-secret' })
  registerErrorHandler(app)
  await app.register(ratingsRoutes)
  await app.ready()
  bizToken = await app.jwt.sign({ sub: BIZ_USER_ID, type: 'business' })
  workerToken = await app.jwt.sign({ sub: WRK_USER_ID, type: 'worker' })
})

afterAll(async () => { await app.close() })
beforeEach(() => { vi.clearAllMocks() })

const biz = () => ({ Authorization: `Bearer ${bizToken}` })
const wrk = () => ({ Authorization: `Bearer ${workerToken}` })

// ─── POST /ratings ─────────────────────────────────────────────────────────────

describe('POST /ratings — empresa avalia trabalhador', () => {
  it('cria avaliação com sucesso e dispara recálculo de score', async () => {
    vi.mocked(prisma.business.findFirst).mockResolvedValueOnce(MOCK_BUSINESS as any)
    vi.mocked(prisma.shift.findFirst).mockResolvedValueOnce(MOCK_SHIFT as any)
    vi.mocked(prisma.shiftApplication.findFirst).mockResolvedValueOnce(MOCK_COMPLETED_APP as any)
    vi.mocked(prisma.rating.findFirst).mockResolvedValueOnce(null)
    vi.mocked(prisma.rating.create).mockResolvedValueOnce({
      id: 'rating-1',
      ...RATING_BODY_BIZ,
      from_id: BIZ_ID,
      created_at: new Date(),
    } as any)

    const res = await app.inject({ method: 'POST', url: '/ratings', headers: biz(), body: RATING_BODY_BIZ })

    expect(res.statusCode).toBe(201)
    const { data } = JSON.parse(res.body)
    expect(data.score).toBe(5)
    expect(data.to_id).toBe(WORKER_ID)
    expect(vi.mocked(scoreQueue.add)).toHaveBeenCalledWith(
      'recalculate-score',
      { workerId: WORKER_ID },
      expect.objectContaining({ jobId: expect.stringContaining('score-') }),
    )
  })

  it('retorna 409 se turno não foi concluído pelo trabalhador', async () => {
    vi.mocked(prisma.business.findFirst).mockResolvedValueOnce(MOCK_BUSINESS as any)
    vi.mocked(prisma.shift.findFirst).mockResolvedValueOnce(MOCK_SHIFT as any)
    vi.mocked(prisma.shiftApplication.findFirst).mockResolvedValueOnce(null) // sem COMPLETED

    const res = await app.inject({ method: 'POST', url: '/ratings', headers: biz(), body: RATING_BODY_BIZ })

    expect(res.statusCode).toBe(409)
    expect(JSON.parse(res.body).error.code).toBe('APPLICATION_NOT_COMPLETED')
  })

  it('retorna 409 se empresa já avaliou este turno', async () => {
    vi.mocked(prisma.business.findFirst).mockResolvedValueOnce(MOCK_BUSINESS as any)
    vi.mocked(prisma.shift.findFirst).mockResolvedValueOnce(MOCK_SHIFT as any)
    vi.mocked(prisma.shiftApplication.findFirst).mockResolvedValueOnce(MOCK_COMPLETED_APP as any)
    vi.mocked(prisma.rating.findFirst).mockResolvedValueOnce({ id: 'rating-existing' } as any)

    const res = await app.inject({ method: 'POST', url: '/ratings', headers: biz(), body: RATING_BODY_BIZ })

    expect(res.statusCode).toBe(409)
    expect(JSON.parse(res.body).error.code).toBe('RATING_ALREADY_EXISTS')
  })

  it('retorna 403 se empresa tenta avaliar turno de outra empresa', async () => {
    const otherBiz = { id: 'biz-other', user_id: BIZ_USER_ID }
    vi.mocked(prisma.business.findFirst).mockResolvedValueOnce(otherBiz as any)
    vi.mocked(prisma.shift.findFirst).mockResolvedValueOnce(MOCK_SHIFT as any) // business_id = BIZ_ID

    const res = await app.inject({ method: 'POST', url: '/ratings', headers: biz(), body: RATING_BODY_BIZ })

    expect(res.statusCode).toBe(403)
  })

  it('retorna 400 para score fora do intervalo 1-5', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/ratings',
      headers: biz(),
      body: { ...RATING_BODY_BIZ, score: 6 },
    })
    expect(res.statusCode).toBe(400)
  })
})

describe('POST /ratings — trabalhador avalia empresa', () => {
  it('cria avaliação de empresa com sucesso (sem recalcular score)', async () => {
    vi.mocked(prisma.worker.findFirst).mockResolvedValueOnce(MOCK_WORKER as any)
    vi.mocked(prisma.shiftApplication.findFirst).mockResolvedValueOnce(MOCK_COMPLETED_APP as any)
    vi.mocked(prisma.rating.findFirst).mockResolvedValueOnce(null)
    vi.mocked(prisma.rating.create).mockResolvedValueOnce({
      id: 'rating-2',
      ...RATING_BODY_WRK,
      from_id: WORKER_ID,
      created_at: new Date(),
    } as any)

    const res = await app.inject({ method: 'POST', url: '/ratings', headers: wrk(), body: RATING_BODY_WRK })

    expect(res.statusCode).toBe(201)
    expect(JSON.parse(res.body).data.score).toBe(4)
    // Trabalhador avalia empresa → score do trabalhador NÃO muda
    expect(vi.mocked(scoreQueue.add)).not.toHaveBeenCalled()
  })

  it('retorna 401 sem autenticação', async () => {
    const res = await app.inject({ method: 'POST', url: '/ratings', body: RATING_BODY_WRK })
    expect(res.statusCode).toBe(401)
  })
})
