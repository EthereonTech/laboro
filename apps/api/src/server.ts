import 'dotenv/config'
import * as Sentry from '@sentry/node'
import Fastify from 'fastify'
import jwt from '@fastify/jwt'
import cors from '@fastify/cors'
import rateLimit from '@fastify/rate-limit'
import { registerSwagger } from './plugins/swagger'
import { registerErrorHandler } from './plugins/error-handler'
import { authRoutes } from './modules/auth/auth.routes'
import { workersRoutes } from './modules/workers/workers.routes'
import { businessesRoutes } from './modules/businesses/businesses.routes'
import { shiftsRoutes } from './modules/shifts/shifts.routes'
import { checkinRoutes } from './modules/checkin/checkin.routes'
import { paymentsRoutes } from './modules/payments/payments.routes'
import { ratingsRoutes } from './modules/ratings/ratings.routes'
import { notificationsRoutes } from './modules/notifications/notifications.routes'
import { adminRoutes } from './modules/admin/admin.routes'
import { redis } from './lib/redis'
import { startWorkers } from './jobs/startWorkers'

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV ?? 'development',
    tracesSampleRate: 0.1,
  })
}

async function build() {
  const app = Fastify({ logger: true })

  await app.register(cors, { origin: true })

  await app.register(rateLimit, {
    max: (_req, key) => (key.startsWith('user:') ? 20 : 100),
    timeWindow: '1 minute',
    redis,
    keyGenerator: (request) => {
      const auth = request.headers.authorization
      if (auth?.startsWith('Bearer ')) {
        try {
          const payload = JSON.parse(Buffer.from(auth.split('.')[1], 'base64').toString('utf8'))
          if (payload.sub) return `user:${payload.sub}`
        } catch {}
      }
      return request.ip
    },
  })

  await app.register(jwt, { secret: process.env.JWT_SECRET! })

  await registerSwagger(app)
  registerErrorHandler(app)

  await app.register(authRoutes)
  await app.register(workersRoutes)
  await app.register(businessesRoutes)
  await app.register(shiftsRoutes)
  await app.register(checkinRoutes)
  await app.register(paymentsRoutes)
  await app.register(ratingsRoutes)
  await app.register(notificationsRoutes)
  await app.register(adminRoutes)

  app.get('/', async (_req, reply) => reply.redirect('/docs'))

  app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }))

  return app
}

build()
  .then(async (app) => {
    startWorkers()
    await app.listen({ port: Number(process.env.PORT) || 3000, host: '0.0.0.0' })
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
