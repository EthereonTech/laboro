import { FastifyInstance } from 'fastify'
import { requireWorker } from '../../middlewares/authenticate'
import { checkinBody, checkinParam } from './checkin.schema'
import * as checkinService from './checkin.service'

export async function checkinRoutes(app: FastifyInstance) {
  // POST /shifts/:id/checkin — trabalhador registra presença
  app.post('/shifts/:id/checkin', { preHandler: [requireWorker] }, async (request, reply) => {
    const { sub } = request.user as { sub: string }
    const { id } = checkinParam.parse(request.params)
    const { lat, lng, accuracy } = checkinBody.parse(request.body)
    const result = await checkinService.checkin(sub, id, lat, lng, accuracy)
    return reply.status(200).send({ data: result })
  })

  // POST /shifts/:id/checkout — trabalhador registra saída
  app.post('/shifts/:id/checkout', { preHandler: [requireWorker] }, async (request, reply) => {
    const { sub } = request.user as { sub: string }
    const { id } = checkinParam.parse(request.params)
    const result = await checkinService.checkout(sub, id)
    return reply.status(200).send({ data: result })
  })
}
