import { z } from 'zod'

// ─── Response schemas ─────────────────────────────────────────────────────────

const shiftAddressResponse = z.object({
  street: z.string(),
  number: z.string(),
  neighborhood: z.string(),
  city: z.string(),
  state: z.string(),
  zip: z.string(),
  lat: z.number().optional(),
  lng: z.number().optional(),
}).nullable()

export const shiftSummaryResponse = z.object({
  id: z.string(),
  business_id: z.string(),
  business_name: z.string(),
  specialty: z.string(),
  starts_at: z.string().or(z.date()),
  ends_at: z.string().or(z.date()),
  slots: z.number(),
  slots_available: z.number(),
  rate_per_hour: z.number(),
  total_value: z.number(),
  laboro_fee: z.number(),
  worker_amount: z.number(),
  instructions: z.string().nullable(),
  status: z.string(),
  address: shiftAddressResponse,
  is_urgent: z.boolean(),
  distance_meters: z.number().optional(),
})

export const shiftListResponse = z.object({
  data: z.array(shiftSummaryResponse),
  meta: z.object({ total: z.number(), page: z.number(), limit: z.number() }),
})

// ─── Request schemas ──────────────────────────────────────────────────────────

const specialties = [
  'garcom', 'bartender', 'aux_cozinha', 'promotor',
  'caixa', 'repositor', 'cuidador', 'aux_logistica',
] as const

const addressSchema = z.object({
  street: z.string().min(1),
  number: z.string().min(1),
  neighborhood: z.string().min(1),
  city: z.string().min(1),
  state: z.string().length(2).toUpperCase(),
  zip: z.string().regex(/^\d{8}$/),
  lat: z.number().optional(),
  lng: z.number().optional(),
})

export const createShiftBody = z.object({
  specialty: z.enum(specialties),
  starts_at: z.string().datetime({ message: 'Data de início inválida (ISO 8601)' }),
  ends_at: z.string().datetime({ message: 'Data de término inválida (ISO 8601)' }),
  slots: z.number().int().min(1).max(50).default(1),
  rate_per_hour: z.number().positive('Valor por hora deve ser positivo'),
  instructions: z.string().max(1000).optional(),
  address: addressSchema.optional(),
  is_urgent: z.boolean().default(false),
}).refine(
  (d) => new Date(d.ends_at) > new Date(d.starts_at),
  { message: 'Horário de término deve ser após o início', path: ['ends_at'] },
).refine(
  (d) => new Date(d.starts_at) > new Date(),
  { message: 'Turno deve ser no futuro', path: ['starts_at'] },
)

export const updateShiftBody = z.object({
  instructions: z.string().max(1000).optional(),
  is_urgent: z.boolean().optional(),
})

export const listShiftsQuery = z.object({
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  radius: z.coerce.number().positive().default(50000), // metros, padrão 50km
  specialty: z.enum(specialties).optional(),
  date: z.string().date().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export const shiftIdParam = z.object({
  id: z.string().uuid('ID de turno inválido'),
})

export const confirmWorkerParam = z.object({
  id: z.string().uuid('ID de turno inválido'),
  workerId: z.string().uuid('ID de trabalhador inválido'),
})
