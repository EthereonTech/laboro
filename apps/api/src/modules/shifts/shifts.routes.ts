import { FastifyInstance } from 'fastify'
import { authenticate, requireWorker, requireBusiness } from '../../middlewares/authenticate'
import {
  createShiftBody,
  updateShiftBody,
  listShiftsQuery,
  shiftIdParam,
  confirmWorkerParam,
  shiftSummaryResponse,
} from './shifts.schema'
import { dataResponse } from '../../lib/response-schema'
import { zodToJsonSchema } from 'zod-to-json-schema'
import { z } from 'zod'
import * as shiftsService from './shifts.service'

export async function shiftsRoutes(app: FastifyInstance) {
  // POST /shifts — empresa cria vaga
  app.post('/shifts', { preHandler: [requireBusiness] }, async (request, reply) => {
    const { sub } = request.user as { sub: string }
    const body = createShiftBody.parse(request.body)
    const shift = await shiftsService.createShiftByBusiness(sub, body)
    return reply.status(201).send({ data: shift })
  })

  // GET /shifts — trabalhador lista vagas disponíveis (geoespacial)
  app.get('/shifts', {
    preHandler: [requireWorker],
    schema: {
      response: {
        200: zodToJsonSchema(
          z.object({ data: z.array(shiftSummaryResponse), meta: z.object({ total: z.number(), page: z.number(), limit: z.number() }) }),
          { $refStrategy: 'none' },
        ) as object,
      },
    },
  }, async (request, reply) => {
    const { sub } = request.user as { sub: string }
    const query = listShiftsQuery.parse(request.query)
    const result = await shiftsService.listShiftsForWorker(sub, query)
    return reply.send({ data: result })
  })

  // GET /shifts/mine — empresa lista suas vagas
  app.get('/shifts/mine', {
    preHandler: [requireBusiness],
    schema: { response: { 200: dataResponse(z.array(shiftSummaryResponse)) } },
  }, async (request, reply) => {
    const { sub } = request.user as { sub: string }
    const shifts = await shiftsService.listBusinessShifts(sub)
    return reply.send({ data: shifts })
  })

  // GET /shifts/:id — detalhe de uma vaga com candidaturas (qualquer autenticado)
  app.get('/shifts/:id', { preHandler: [authenticate] }, async (request, reply) => {
    const { id } = shiftIdParam.parse(request.params)
    const shift = await shiftsService.getShiftDetail(id)
    return reply.send({ data: shift })
  })

  // PUT /shifts/:id — empresa edita vaga
  app.put('/shifts/:id', { preHandler: [requireBusiness] }, async (request, reply) => {
    const { sub } = request.user as { sub: string }
    const { id } = shiftIdParam.parse(request.params)
    const body = updateShiftBody.parse(request.body)
    const shift = await shiftsService.updateShiftDetails(sub, id, body)
    return reply.send({ data: shift })
  })

  // DELETE /shifts/:id — empresa cancela vaga
  app.delete('/shifts/:id', { preHandler: [requireBusiness] }, async (request, reply) => {
    const { sub } = request.user as { sub: string }
    const { id } = shiftIdParam.parse(request.params)
    const result = await shiftsService.cancelShift(sub, id)
    return reply.send({ data: result })
  })

  // GET /shifts/:id/applications — empresa lista candidatos
  app.get('/shifts/:id/applications', { preHandler: [requireBusiness] }, async (request, reply) => {
    const { sub } = request.user as { sub: string }
    const { id } = shiftIdParam.parse(request.params)
    const applications = await shiftsService.listApplications(sub, id)
    return reply.send({ data: applications })
  })

  // POST /shifts/:id/apply — trabalhador se candidata
  app.post('/shifts/:id/apply', { preHandler: [requireWorker] }, async (request, reply) => {
    const { sub } = request.user as { sub: string }
    const { id } = shiftIdParam.parse(request.params)
    const result = await shiftsService.applyToShift(sub, id)
    return reply.status(201).send({ data: result })
  })

  // POST /shifts/:id/confirm/:workerId — empresa confirma trabalhador
  app.post(
    '/shifts/:id/confirm/:workerId',
    { preHandler: [requireBusiness] },
    async (request, reply) => {
      const { sub } = request.user as { sub: string }
      const { id, workerId } = confirmWorkerParam.parse(request.params)
      const result = await shiftsService.confirmWorker(sub, id, workerId)
      return reply.send({ data: result })
    },
  )

  // POST /shifts/:id/report-noshow/:workerId — empresa reporta no-show
  app.post(
    '/shifts/:id/report-noshow/:workerId',
    { preHandler: [requireBusiness] },
    async (request, reply) => {
      const { sub } = request.user as { sub: string }
      const { id, workerId } = confirmWorkerParam.parse(request.params)
      const result = await shiftsService.reportNoShow(sub, id, workerId)
      return reply.send({ data: result })
    },
  )

  // POST /shifts/:id/cancel — empresa cancela vaga (alias para o frontend mobile)
  app.post('/shifts/:id/cancel', { preHandler: [requireBusiness] }, async (request, reply) => {
    const { sub } = request.user as { sub: string }
    const { id } = shiftIdParam.parse(request.params)
    const result = await shiftsService.cancelShift(sub, id)
    return reply.send({ data: result })
  })

  // GET /shifts/:id/my-application — trabalhador consulta sua própria candidatura
  app.get('/shifts/:id/my-application', { preHandler: [requireWorker] }, async (request, reply) => {
    const { sub } = request.user as { sub: string }
    const { id } = shiftIdParam.parse(request.params)
    const application = await shiftsService.getMyApplication(sub, id)
    return reply.send({ data: application })
  })
}
