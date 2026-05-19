import '@fastify/jwt'
import { FastifyRequest, FastifyReply } from 'fastify'

export type JwtPayload = {
  sub: string
  type: 'worker' | 'business'
}

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify()
  } catch {
    reply.status(401).send({ error: { code: 'AUTH_INVALID_TOKEN', message: 'Token inválido ou expirado' } })
  }
}

export async function requireWorker(request: FastifyRequest, reply: FastifyReply) {
  await authenticate(request, reply)
  const user = request.user as JwtPayload
  if (user?.type !== 'worker') {
    reply.status(403).send({ error: { code: 'FORBIDDEN', message: 'Acesso restrito a trabalhadores' } })
  }
}

export async function requireBusiness(request: FastifyRequest, reply: FastifyReply) {
  await authenticate(request, reply)
  const user = request.user as JwtPayload
  if (user?.type !== 'business') {
    reply.status(403).send({ error: { code: 'FORBIDDEN', message: 'Acesso restrito a empresas' } })
  }
}
