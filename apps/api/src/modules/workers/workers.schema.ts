import { z } from 'zod'

// ─── Response schemas ─────────────────────────────────────────────────────────

export const workerPublicResponse = z.object({
  id: z.string(),
  full_name: z.string(),
  photo_url: z.string().nullable(),
  score: z.number(),
  total_shifts: z.number(),
  on_time_rate: z.number(),
  level: z.enum(['BEGINNER', 'VERIFIED', 'TOP_PRO']),
  specialties: z.array(z.string()),
  is_verified: z.boolean(),
})

export const workerPrivateResponse = workerPublicResponse.extend({
  user_id: z.string(),
  phone: z.string(),
  pix_key: z.string().nullable(),
  pix_key_type: z.enum(['cpf', 'phone', 'email', 'cnpj', 'random']).nullable(),
})

// ─── Request schemas ──────────────────────────────────────────────────────────

export const updateWorkerBody = z.object({
  full_name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres').optional(),
  cpf: z
    .string()
    .regex(/^\d{11}$/, 'CPF deve ter 11 dígitos numéricos (sem pontuação)')
    .optional(),
  pix_key: z.string().min(1).optional(),
  pix_key_type: z.enum(['cpf', 'phone', 'email', 'cnpj', 'random']).optional(),
  specialties: z
    .array(
      z.enum([
        'garcom',
        'bartender',
        'aux_cozinha',
        'promotor',
        'caixa',
        'repositor',
        'cuidador',
        'aux_logistica',
      ]),
    )
    .min(1, 'Selecione pelo menos uma especialidade')
    .optional(),
})

export const workerIdParam = z.object({
  id: z.string().uuid('ID inválido'),
})
