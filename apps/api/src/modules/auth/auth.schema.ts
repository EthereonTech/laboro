import { z } from 'zod'

const phoneRegex = /^\+55\d{10,11}$/

export const sendOtpBody = z.object({
  phone: z.string().regex(phoneRegex, 'Telefone inválido. Formato: +5541999999999'),
  type: z.enum(['worker', 'business']),
})

export const verifyOtpBody = z.object({
  phone: z.string().regex(phoneRegex, 'Telefone inválido'),
  code: z.string().length(6, 'OTP deve ter exatamente 6 dígitos'),
})

export const refreshTokenBody = z.object({
  refreshToken: z.string().uuid('Refresh token inválido'),
})

export const logoutBody = z.object({
  refreshToken: z.string().uuid('Refresh token inválido'),
})
