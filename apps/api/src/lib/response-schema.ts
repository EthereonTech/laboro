import { zodToJsonSchema } from 'zod-to-json-schema'
import { z } from 'zod'

// Cast to object to prevent TypeScript from deeply expanding zod-to-json-schema's
// complex return type, which causes the default tsc heap to OOM.
export function dataResponse(schema: z.ZodTypeAny): object {
  return zodToJsonSchema(z.object({ data: schema }), { $refStrategy: 'none' }) as object
}

export function dataListResponse(itemSchema: z.ZodTypeAny): object {
  return zodToJsonSchema(
    z.object({
      data: z.array(itemSchema),
      meta: z.object({ total: z.number(), page: z.number(), limit: z.number() }).optional(),
    }),
    { $refStrategy: 'none' },
  ) as object
}
