import { z } from 'zod'

const ALL_TAGS = [
  'pontual', 'boa_apresentacao', 'trabalhou_bem', 'voltaria',
  'nao_voltaria', 'atrasou', 'sumiu',
  'boa_estrutura', 'pagamento_rapido', 'boa_comunicacao', 'recomendo', 'nao_recomendo',
] as const

export const createRatingBody = z.object({
  shift_id: z.string().uuid('ID de turno inválido'),
  to_id: z.string().uuid('ID do avaliado inválido'),
  score: z.number().int().min(1).max(5),
  tags: z.array(z.enum(ALL_TAGS)).max(5).default([]),
  comment: z.string().max(500).optional(),
})

export type CreateRatingBody = z.infer<typeof createRatingBody>
