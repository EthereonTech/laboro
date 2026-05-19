import { FastifyInstance } from 'fastify'
import { authenticate } from '../../middlewares/authenticate'
import { createRatingBody } from './ratings.schema'
import * as ratingsService from './ratings.service'

export async function ratingsRoutes(app: FastifyInstance) {
  // POST /ratings — cria avaliação (trabalhador avalia empresa ou empresa avalia trabalhador)
  app.post('/ratings', { preHandler: [authenticate] }, async (request, reply) => {
    const { sub, type } = request.user as { sub: string; type: 'worker' | 'business' }
    const body = createRatingBody.parse(request.body)

    const rating =
      type === 'business'
        ? await ratingsService.rateAsBase(sub, body)
        : await ratingsService.rateAsWorker(sub, body)

    return reply.status(201).send({ data: rating })
  })
}
