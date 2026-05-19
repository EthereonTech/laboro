import { FastifyInstance } from 'fastify'
import multipart from '@fastify/multipart'
import { authenticate, requireBusiness } from '../../middlewares/authenticate'
import { createBusinessBody, updateBusinessBody, businessProfileResponse } from './businesses.schema'
import { dataResponse } from '../../lib/response-schema'
import * as businessesService from './businesses.service'

const MAX_PHOTO_SIZE = 5 * 1024 * 1024
const ALLOWED_MIMETYPES = ['image/jpeg', 'image/png', 'image/webp']

export async function businessesRoutes(app: FastifyInstance) {
  await app.register(multipart, { limits: { fileSize: MAX_PHOTO_SIZE } })

  // POST /businesses/me — criar perfil de empresa
  app.post('/businesses/me', {
    preHandler: [authenticate],
    schema: { response: { 201: dataResponse(businessProfileResponse) } },
  }, async (request, reply) => {
    const { sub, type } = request.user as { sub: string; type: string }
    if (type !== 'business') {
      return reply.status(403).send({ error: { code: 'FORBIDDEN', message: 'Acesso restrito a empresas' } })
    }
    const body = createBusinessBody.parse(request.body)
    const profile = await businessesService.createProfile(sub, body)
    return reply.status(201).send({ data: profile })
  })

  // GET /businesses/me — perfil da própria empresa
  app.get('/businesses/me', {
    preHandler: [requireBusiness],
    schema: { response: { 200: dataResponse(businessProfileResponse) } },
  }, async (request, reply) => {
    const { sub } = request.user as { sub: string }
    const profile = await businessesService.getMyProfile(sub)
    return reply.send({ data: profile })
  })

  // PUT /businesses/me — atualizar perfil
  app.put('/businesses/me', {
    preHandler: [requireBusiness],
    schema: { response: { 200: dataResponse(businessProfileResponse) } },
  }, async (request, reply) => {
    const { sub } = request.user as { sub: string }
    const body = updateBusinessBody.parse(request.body)
    const profile = await businessesService.updateProfile(sub, body)
    return reply.send({ data: profile })
  })

  // POST /businesses/me/photo — upload de logo
  app.post('/businesses/me/photo', { preHandler: [requireBusiness] }, async (request, reply) => {
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
    const result = await businessesService.uploadProfilePhoto(sub, buffer, file.mimetype)
    return reply.send({ data: result })
  })

  // POST /businesses/validate-cnpj — valida CNPJ antes do cadastro (usado pelo app no step1)
  app.post('/businesses/validate-cnpj', { preHandler: [authenticate] }, async (request, reply) => {
    const { cnpj } = (request.body as any) ?? {}
    if (!cnpj || typeof cnpj !== 'string') {
      return reply.status(400).send({ error: { code: 'VALIDATION_ERROR', message: 'CNPJ obrigatório' } })
    }
    await businessesService.validateCnpj(cnpj.replace(/\D/g, ''))
    return reply.send({ data: { valid: true } })
  })

  // GET /businesses/me/shifts — vagas da empresa logada
  app.get('/businesses/me/shifts', { preHandler: [requireBusiness] }, async (request, reply) => {
    const { sub } = request.user as { sub: string }
    const shifts = await businessesService.getMyShifts(sub)
    return reply.send({ data: shifts })
  })

  // GET /businesses/me/payments — histórico de escrow da empresa
  app.get('/businesses/me/payments', { preHandler: [requireBusiness] }, async (request, reply) => {
    const { sub } = request.user as { sub: string }
    const payments = await businessesService.getMyPayments(sub)
    return reply.send({ data: payments })
  })

  // GET /businesses/me/dashboard — dados do dashboard
  app.get('/businesses/me/dashboard', { preHandler: [requireBusiness] }, async (request, reply) => {
    const { sub } = request.user as { sub: string }
    const dashboard = await businessesService.getDashboard(sub)
    return reply.send({ data: dashboard })
  })

  // GET /businesses/:id — perfil público
  app.get('/businesses/:id', { preHandler: [authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const profile = await businessesService.getPublicProfile(id)
    return reply.send({ data: profile })
  })
}
