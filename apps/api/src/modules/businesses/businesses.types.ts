import { BusinessSegment } from '@prisma/client'

export type BusinessAddress = {
  street: string
  number: string
  neighborhood: string
  city: string
  state: string
  zip: string
  lat?: number
  lng?: number
}

export type BusinessProfile = {
  id: string
  user_id: string
  full_name: string
  phone: string
  photo_url: string | null
  cnpj: string
  trade_name: string
  legal_name: string
  segment: BusinessSegment
  address: BusinessAddress
  score: number
  is_verified: boolean
}

export type CreateBusinessBody = {
  cnpj: string
  trade_name: string
  legal_name: string
  segment: BusinessSegment
  address: BusinessAddress
}

export type UpdateBusinessBody = Partial<
  Omit<CreateBusinessBody, 'cnpj'> & { full_name: string }
>
