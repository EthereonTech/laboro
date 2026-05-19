import { z } from 'zod'

export const deviceTokenBody = z.object({
  push_token: z.string().min(1, 'Token inválido'),
})

export type DeviceTokenBody = z.infer<typeof deviceTokenBody>
