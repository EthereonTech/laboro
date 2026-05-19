import { FastifyInstance } from 'fastify'
import multipart from '@fastify/multipart'
import { authenticate, requireWorker } from '../../middlewares/authenticate'
import { updateWorkerBody, workerIdParam, workerPrivateResponse, workerPublicResponse } from './workers.schema'
import { dataResponse } from '../../lib/response-schema'
import * as workersService from './workers.service'

const MAX_PHOTO_SIZE = 5 * 1024 * 1024 // 5 MB
const ALLOWED_MIMETYPES = ['image/jpeg', 'image/png', 'image/webp']

export async function workersRoutes(app: FastifyInstance) {
  await app.register(multipart, { limits: { fileSize: MAX_PHOTO_SIZE } })

  // GET /workers/me — perfil do próprio trabalhador
  app.get('/workers/me', {
    preHandler: [requireWorker],
    schema: { response: { 200: dataResponse(workerPrivateResponse) } },
  }, async (request, reply) => {
    const { sub } = request.user as { sub: string }
    const profile = await workersService.getMyProfile(sub)
    return reply.send({ data: profile })
  })

  // PUT /workers/me — atualizar perfil
  app.put('/workers/me', {
    preHandler: [requireWorker],
    schema: { response: { 200: dataResponse(workerPrivateResponse) } },
  }, async (request, reply) => {
    const { sub } = request.user as { sub: string }
    const body = updateWorkerBody.parse(request.body)
    const profile = await workersService.updateProfile(sub, body)
    return reply.send({ data: profile })
  })

  // POST /workers/me/photo — upload de foto
  app.post('/workers/me/photo', { preHandler: [requireWorker] }, async (request, reply) => {
    const { sub } = request.user as { sub: string }

    const file = await request.file()
    if (!file) {
      return reply.status(400).send({ error: { code: 'VALIDATION_ERROR', message: 'Nenhum arquivo enviado' } })
    }

    if (!ALLOWED_MIMETYPES.includes(file.mimetype)) {
      return reply.status(400).send({
        error: { code: 'VALIDATION_ERROR', message: 'Formato inválido. Use JPEG, PNG ou WebP.' },
      })
    }

    const buffer = await file.toBuffer()
    const result = await workersService.uploadProfilePhoto(sub, buffer, file.mimetype)
    return reply.send({ data: result })
  })

  // GET /workers/me/applications — candidaturas do trabalhador logado
  app.get('/workers/me/applications', { preHandler: [requireWorker] }, async (request, reply) => {
    const { sub } = request.user as { sub: string }
    const applications = await workersService.getMyApplications(sub)
    return reply.send({ data: applications })
  })

  // GET /workers/me/payments — histórico de pagamentos do trabalhador
  app.get('/workers/me/payments', { preHandler: [requireWorker] }, async (request, reply) => {
    const { sub } = request.user as { sub: string }
    const payments = await workersService.getMyPayments(sub)
    return reply.send({ data: payments })
  })

  // PUT /workers/me/specialties — atualiza especialidades do trabalhador
  app.put('/workers/me/specialties', { preHandler: [requireWorker] }, async (request, reply) => {
    const { sub } = request.user as { sub: string }
    const { specialties } = (request.body as any) ?? {}
    if (!Array.isArray(specialties)) {
      return reply.status(400).send({ error: { code: 'VALIDATION_ERROR', message: 'specialties deve ser um array' } })
    }
    const result = await workersService.updateSpecialties(sub, specialties)
    return reply.send({ data: result })
  })

  // GET /workers/:id — perfil público de um trabalhador (sem dados sensíveis)
  app.get('/workers/:id', {
    preHandler: [authenticate],
    schema: { response: { 200: dataResponse(workerPublicResponse) } },
  }, async (request, reply) => {
    const { id } = workerIdParam.parse(request.params)
    const profile = await workersService.getPublicProfile(id)
    return reply.send({ data: profile })
  })
}
