import { FastifyInstance } from 'fastify'
import { authenticate } from '../../middlewares/authenticate'
import { deviceTokenBody } from './notifications.schema'
import { registerDeviceToken } from './notifications.service'

export async function notificationsRoutes(app: FastifyInstance) {
  // POST /notifications/device-token — app registra token de push do dispositivo
  app.post('/notifications/device-token', { preHandler: [authenticate] }, async (request, reply) => {
    const { sub } = request.user as { sub: string }
    const { push_token } = deviceTokenBody.parse(request.body)
    await registerDeviceToken(sub, push_token)
    return reply.send({ data: { registered: true } })
  })
}
