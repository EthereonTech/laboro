import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import * as adminService from './admin.service'

function requireAdmin(app: FastifyInstance) {
  return async (request: any, reply: any) => {
    const key = request.headers['x-admin-key']
    if (!process.env.ADMIN_KEY || key !== process.env.ADMIN_KEY) {
      return reply.status(403).send({ error: { code: 'FORBIDDEN', message: 'Acesso negado' } })
    }
  }
}

export async function adminRoutes(app: FastifyInstance) {
  const adminGuard = requireAdmin(app)

  // GET /admin/escrows — lista transações de escrow recentes
  app.get('/admin/escrows', { preHandler: [adminGuard] }, async (request, reply) => {
    const query = z.object({
      limit: z.coerce.number().int().min(1).max(100).default(50),
      status: z.string().optional(),
    }).parse(request.query)

    const escrows = await adminService.listEscrows(query.limit, query.status)
    return reply.send({ data: escrows })
  })

  // GET /admin/users — lista usuários com filtro
  app.get('/admin/users', { preHandler: [adminGuard] }, async (request, reply) => {
    const query = z.object({
      limit: z.coerce.number().int().min(1).max(100).default(50),
      search: z.string().optional(),
    }).parse(request.query)

    const users = await adminService.listUsers(query.limit, query.search)
    return reply.send({ data: users })
  })

  // POST /admin/users/:id/suspend — suspende usuário
  app.post('/admin/users/:id/suspend', { preHandler: [adminGuard] }, async (request, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params)
    const body = z.object({ hours: z.number().int().min(1).max(8760).default(48) }).parse(request.body)

    await adminService.suspendUser(id, body.hours)
    return reply.send({ data: { suspended: true } })
  })

  // POST /admin/users/:id/unsuspend — remove suspensão
  app.post('/admin/users/:id/unsuspend', { preHandler: [adminGuard] }, async (request, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params)

    await adminService.unsuspendUser(id)
    return reply.send({ data: { unsuspended: true } })
  })

  // GET /admin/metrics — métricas do período (receita, NPS, no-show rate)
  app.get('/admin/metrics', { preHandler: [adminGuard] }, async (request, reply) => {
    const query = z.object({
      from: z.string().date(),
      to: z.string().date(),
    }).parse(request.query)

    const from = new Date(query.from + 'T00:00:00.000Z')
    const to = new Date(query.to + 'T23:59:59.999Z')
    const metrics = await adminService.getMetrics(from, to)
    return reply.send({ data: metrics })
  })
}
