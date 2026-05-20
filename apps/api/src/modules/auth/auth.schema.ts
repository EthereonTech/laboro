import { z } from 'zod'

export const registerBody = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  full_name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  type: z.enum(['worker', 'business']),
  phone: z.string().optional(),
})

export const loginBody = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
  type: z.enum(['worker', 'business']),
})

export const refreshTokenBody = z.object({
  refreshToken: z.string().uuid('Refresh token inválido'),
})

export const logoutBody = z.object({
  refreshToken: z.string().uuid('Refresh token inválido'),
})
