import { FastifyInstance } from 'fastify'
import { ZodError } from 'zod'
import { authenticate } from '../../middlewares/authenticate'
import { sendOtpBody, verifyOtpBody, refreshTokenBody, logoutBody } from './auth.schema'
import * as authService from './auth.service'

export async function authRoutes(app: FastifyInstance) {
  // POST /auth/otp/send
  app.post('/auth/otp/send', async (request, reply) => {
    const body = sendOtpBody.parse(request.body)
    await authService.sendOtp(body.phone, body.type)
    return reply.send({ data: { message: 'Código enviado com sucesso' } })
  })

  // POST /auth/otp/verify
  app.post('/auth/otp/verify', async (request, reply) => {
    const body = verifyOtpBody.parse(request.body)
    const { user, isNew } = await authService.verifyOtpCode(body.phone, body.code)

    const accessToken = await reply.jwtSign(
      { sub: user.id, type: user.type },
      { expiresIn: '15m' },
    )
    const refreshToken = await authService.createRefreshToken(user.id, user.type as 'worker' | 'business')

    return reply.status(isNew ? 201 : 200).send({
      data: { accessToken, refreshToken, isNew, type: user.type },
    })
  })

  // POST /auth/token/refresh
  app.post('/auth/token/refresh', async (request, reply) => {
    const { refreshToken } = refreshTokenBody.parse(request.body)
    const { userId, type } = await authService.validateRefreshToken(refreshToken)

    const accessToken = await reply.jwtSign(
      { sub: userId, type },
      { expiresIn: '15m' },
    )

    return reply.send({ data: { accessToken } })
  })

  // POST /auth/logout
  app.post('/auth/logout', { preHandler: [authenticate] }, async (request, reply) => {
    const { refreshToken } = logoutBody.parse(request.body)
    await authService.revokeRefreshToken(refreshToken)
    return reply.status(204).send()
  })

  // DELETE /users/me — LGPD: soft delete + anonimização
  app.delete('/users/me', { preHandler: [authenticate] }, async (request, reply) => {
    const { sub } = request.user as { sub: string }
    await authService.deleteAccount(sub)
    return reply.status(204).send()
  })
}

export function isAppError(err: unknown): err is Error & { appCode: string } {
  return err instanceof Error && 'appCode' in err
}

export function handleZodError(err: ZodError) {
  return {
    error: {
      code: 'VALIDATION_ERROR',
      message: 'Dados inválidos',
      details: err.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
    },
  }
}
