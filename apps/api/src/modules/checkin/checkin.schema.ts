import { z } from 'zod'

export const checkinBody = z.object({
  lat: z.number({ required_error: 'Latitude obrigatória' }),
  lng: z.number({ required_error: 'Longitude obrigatória' }),
  accuracy: z.number().optional(), // precisão do GPS em metros (dispositivo informa)
})

export const checkinParam = z.object({
  id: z.string().uuid('ID de turno inválido'),
})
