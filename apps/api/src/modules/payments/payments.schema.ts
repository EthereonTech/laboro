import { z } from 'zod'

export const webhookBody = z.object({
  event: z.string(),
  payment: z
    .object({
      id: z.string(),
      status: z.string(),
      externalReference: z.string().optional(),
    })
    .optional(),
})

export type WebhookBody = z.infer<typeof webhookBody>
