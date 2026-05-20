import { FastifyInstance } from 'fastify'
import { ZodError } from 'zod'
import { authenticate } from '../../middlewares/authenticate'
import { registerBody, loginBody, refreshTokenBody, logoutBody } from './auth.schema'
import * as authService from './auth.service'

export async function authRoutes(app: FastifyInstance) {
  // POST /auth/register
  app.post('/auth/register', async (request, reply) => {
    const body = registerBody.parse(request.body)
    const { user, isNew } = await authService.register(body)

    const accessToken = await reply.jwtSign(
      { sub: user.id, type: user.type },
      { expiresIn: '15m' },
    )
    const refreshToken = await authService.createRefreshToken(user.id, user.type as 'worker' | 'business')

    return reply.status(201).send({
      data: { accessToken, refreshToken, isNew, type: user.type },
    })
  })

  // POST /auth/login
  app.post('/auth/login', async (request, reply) => {
    const body = loginBody.parse(request.body)
    const { user } = await authService.login(body.email, body.password)

    const accessToken = await reply.jwtSign(
      { sub: user.id, type: user.type },
      { expiresIn: '15m' },
    )
    const refreshToken = await authService.createRefreshToken(user.id, user.type as 'worker' | 'business')

    return reply.status(200).send({
      data: { accessToken, refreshToken, isNew: false, type: user.type },
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
