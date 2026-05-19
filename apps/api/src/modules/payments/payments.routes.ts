import { FastifyInstance } from 'fastify'
import { webhookBody } from './payments.schema'
import * as paymentsService from './payments.service'

export async function paymentsRoutes(app: FastifyInstance) {
  // POST /payments/webhook — Asaas envia eventos de pagamento
  app.post('/payments/webhook', async (request, reply) => {
    const token = (request.headers['asaas-webhook-token'] as string) ?? ''
    const body = webhookBody.parse(request.body)
    await paymentsService.processWebhook(token, body)
    return reply.send({ received: true })
  })
}
