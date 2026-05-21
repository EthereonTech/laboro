import * as Sentry from '@sentry/node'
import { FastifyInstance } from 'fastify'
import { ZodError } from 'zod'
import { isAppError } from '../modules/auth/auth.routes'

const PAYMENT_CODES = new Set(['PAYMENT_FAILED', 'ESCROW_NOT_CONFIRMED'])

const CODE_TO_STATUS: Record<string, number> = {
  AUTH_INVALID_OTP: 401,
  AUTH_TOO_MANY_ATTEMPTS: 429,
  AUTH_INVALID_TOKEN: 401,
  AUTH_INVALID_CREDENTIALS: 401,
  FORBIDDEN: 403,
  WORKER_NOT_FOUND: 404,
  BUSINESS_NOT_FOUND: 404,
  BUSINESS_ALREADY_EXISTS: 409,
  CNPJ_ALREADY_REGISTERED: 409,
  CNPJ_INVALID: 422,
  CNPJ_NOT_FOUND: 404,
  CNPJ_INACTIVE: 422,
  CNPJ_LOOKUP_FAILED: 502,
  SHIFT_NOT_FOUND: 404,
  SHIFT_NOT_OPEN: 409,
  SHIFT_NOT_EDITABLE: 409,
  SHIFT_ALREADY_APPLIED: 409,
  SHIFT_ALREADY_CANCELLED: 409,
  SHIFT_ALREADY_DONE: 409,
  SHIFT_STARTED: 409,
  SHIFT_CANCELLED: 409,
  SHIFT_FULL: 409,
  SHIFT_VALUE_ERROR: 422,
  APPLICATION_NOT_FOUND: 404,
  APPLICATION_NOT_PENDING: 409,
  CHECKIN_TOO_FAR: 422,
  CHECKIN_ALREADY_DONE: 409,
  CHECKIN_NOT_DONE: 409,
  CHECKOUT_ALREADY_DONE: 409,
  APPLICATION_NOT_COMPLETED: 409,
  RATING_ALREADY_EXISTS: 409,
  PAYMENT_FAILED: 502,
  ESCROW_NOT_CONFIRMED: 409,
  WORKER_SUSPENDED: 403,
}

export function registerErrorHandler(app: FastifyInstance) {
  app.setErrorHandler((err, _request, reply) => {
    if (err instanceof ZodError) {
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Dados inválidos',
          details: err.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
        },
      })
    }

    if (isAppError(err)) {
      const status = CODE_TO_STATUS[err.appCode] ?? 400
      if (PAYMENT_CODES.has(err.appCode)) {
        Sentry.captureException(err, { tags: { code: err.appCode } })
      }
      return reply.status(status).send({
        error: { code: err.appCode, message: err.message },
      })
    }

    if (err.validation) {
      return reply.status(400).send({
        error: { code: 'VALIDATION_ERROR', message: err.message },
      })
    }

    Sentry.captureException(err)
    app.log.error(err)
    return reply.status(500).send({
      error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' },
    })
  })
}
