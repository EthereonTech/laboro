import { z } from 'zod'

// ─── Response schemas ─────────────────────────────────────────────────────────

const addressResponseSchema = z.object({
  street: z.string(),
  number: z.string(),
  neighborhood: z.string(),
  city: z.string(),
  state: z.string(),
  zip: z.string(),
  lat: z.number().optional(),
  lng: z.number().optional(),
})

export const businessProfileResponse = z.object({
  id: z.string(),
  user_id: z.string(),
  full_name: z.string(),
  phone: z.string(),
  photo_url: z.string().nullable(),
  cnpj: z.string(),
  trade_name: z.string(),
  legal_name: z.string(),
  segment: z.string(),
  address: addressResponseSchema,
  score: z.number(),
  is_verified: z.boolean(),
})

// ─── Request schemas ──────────────────────────────────────────────────────────

const addressSchema = z.object({
  street: z.string().min(1, 'Rua obrigatória'),
  number: z.string().min(1, 'Número obrigatório'),
  neighborhood: z.string().min(1, 'Bairro obrigatório'),
  city: z.string().min(1, 'Cidade obrigatória'),
  state: z.string().length(2, 'Estado deve ter 2 letras').toUpperCase(),
  zip: z.string().regex(/^\d{8}$/, 'CEP inválido (somente dígitos, 8 caracteres)'),
  lat: z.number().optional(),
  lng: z.number().optional(),
})

const segments = [
  'bar',
  'restaurante',
  'evento',
  'hotel',
  'varejo',
  'saude',
  'logistica',
  'outro',
] as const

export const createBusinessBody = z.object({
  cnpj: z.string().regex(/^\d{14}$/, 'CNPJ deve conter 14 dígitos (sem pontuação)'),
  trade_name: z.string().min(2, 'Nome fantasia obrigatório'),
  legal_name: z.string().min(2, 'Razão social obrigatória'),
  segment: z.enum(segments),
  address: addressSchema,
})

export const updateBusinessBody = z.object({
  full_name: z.string().min(3).optional(),
  trade_name: z.string().min(2).optional(),
  legal_name: z.string().min(2).optional(),
  segment: z.enum(segments).optional(),
  address: addressSchema.optional(),
})
