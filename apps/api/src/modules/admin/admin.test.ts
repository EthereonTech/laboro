import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest'
import Fastify, { FastifyInstance } from 'fastify'
import { registerErrorHandler } from '../../plugins/error-handler'

vi.mock('../../lib/prisma', () => ({
  prisma: {
    escrowTransaction: { findMany: vi.fn(), aggregate: vi.fn(), groupBy: vi.fn() },
    user: { findMany: vi.fn(), count: vi.fn() },
    worker: { updateMany: vi.fn() },
    shiftApplication: { count: vi.fn() },
    rating: { aggregate: vi.fn() },
    shift: { count: vi.fn() },
  },
}))
vi.mock('@sentry/node', () => ({
  captureException: vi.fn(),
  addBreadcrumb: vi.fn(),
  init: vi.fn(),
}))

import { prisma } from '../../lib/prisma'
import { adminRoutes } from './admin.routes'

const ADMIN_KEY = 'test-admin-key'
let app: FastifyInstance

beforeAll(async () => {
  process.env.ADMIN_KEY = ADMIN_KEY
  app = Fastify()
  registerErrorHandler(app)
  await app.register(adminRoutes)
  await app.ready()
})

afterAll(async () => { await app.close() })
beforeEach(() => { vi.clearAllMocks() })

const adminHeaders = () => ({ 'x-admin-key': ADMIN_KEY })

describe('GET /admin/escrows', () => {
  it('retorna lista de escrows', async () => {
    const mockEscrows = [{ id: 'e1', status: 'RELEASED', gross_amount: 100 }]
    vi.mocked(prisma.escrowTransaction.findMany).mockResolvedValueOnce(mockEscrows as any)

    const res = await app.inject({
      method: 'GET',
      url: '/admin/escrows',
      headers: adminHeaders(),
    })

    expect(res.statusCode).toBe(200)
    expect(JSON.parse(res.body).data).toHaveLength(1)
  })

  it('retorna 403 sem admin key', async () => {
    const res = await app.inject({ method: 'GET', url: '/admin/escrows' })
    expect(res.statusCode).toBe(403)
  })
})

describe('POST /admin/users/:id/suspend', () => {
  it('suspende usuário por 48h', async () => {
    vi.mocked(prisma.worker.updateMany).mockResolvedValueOnce({ count: 1 })

    const res = await app.inject({
      method: 'POST',
      url: '/admin/users/00000000-0000-0000-0000-000000000001/suspend',
      headers: adminHeaders(),
      body: { hours: 48 },
    })

    expect(res.statusCode).toBe(200)
    expect(JSON.parse(res.body).data.suspended).toBe(true)
    expect(vi.mocked(prisma.worker.updateMany)).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { user_id: '00000000-0000-0000-0000-000000000001' },
        data: expect.objectContaining({ suspended_until: expect.any(Date) }),
      }),
    )
  })

  it('retorna 400 para UUID inválido', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/admin/users/nao-um-uuid/suspend',
      headers: adminHeaders(),
      body: { hours: 24 },
    })
    expect(res.statusCode).toBe(400)
  })
})

describe('GET /admin/metrics', () => {
  it('retorna métricas do período', async () => {
    vi.mocked(prisma.escrowTransaction.aggregate).mockResolvedValueOnce({
      _sum: { laboro_fee: 180, gross_amount: 1000, worker_amount: 820 },
      _count: 5,
    } as any)
    vi.mocked(prisma.escrowTransaction.groupBy).mockResolvedValueOnce([
      { status: 'RELEASED', _count: 5 },
    ] as any)
    vi.mocked(prisma.shiftApplication.count)
      .mockResolvedValueOnce(20)  // total applications
      .mockResolvedValueOnce(2)   // no-shows
    vi.mocked(prisma.rating.aggregate)
      .mockResolvedValueOnce({ _avg: { score: 4.5 }, _count: 10 } as any)   // worker ratings
      .mockResolvedValueOnce({ _avg: { score: 4.2 }, _count: 8 } as any)    // business ratings
    vi.mocked(prisma.user.count).mockResolvedValueOnce(15)
    vi.mocked(prisma.shift.count).mockResolvedValueOnce(5)

    const res = await app.inject({
      method: 'GET',
      url: '/admin/metrics?from=2026-05-01&to=2026-05-31',
      headers: adminHeaders(),
    })

    expect(res.statusCode).toBe(200)
    const { data } = JSON.parse(res.body)
    expect(data.revenue.laboro_fee).toBe(180)
    expect(data.shifts.no_show_rate_pct).toBe(10)
    expect(data.ratings.worker_avg_score).toBe(4.5)
    expect(data.users.new_registrations).toBe(15)
  })

  it('retorna 400 para datas inválidas', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/admin/metrics?from=nao-data&to=2026-05-31',
      headers: adminHeaders(),
    })
    expect(res.statusCode).toBe(400)
  })

  it('retorna 403 sem admin key', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/admin/metrics?from=2026-05-01&to=2026-05-31',
    })
    expect(res.statusCode).toBe(403)
  })
})
