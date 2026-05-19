import { Specialty, ShiftStatus, ApplicationStatus } from '@prisma/client'

export type ShiftAddress = {
  street: string
  number: string
  neighborhood: string
  city: string
  state: string
  zip: string
  lat?: number
  lng?: number
}

export type ShiftSummary = {
  id: string
  business_id: string
  business_name: string
  specialty: Specialty
  starts_at: Date
  ends_at: Date
  slots: number
  slots_available: number
  rate_per_hour: number
  total_value: number
  laboro_fee: number
  worker_amount: number
  instructions: string | null
  status: ShiftStatus
  address: ShiftAddress
  is_urgent: boolean
  distance_meters?: number
}

export type ApplicationSummary = {
  id: string
  worker_id: string
  worker_name: string
  worker_score: number
  worker_level: string
  worker_total_shifts: number
  specialties: Specialty[]
  status: ApplicationStatus
  created_at: Date
}

export type ListShiftsQuery = {
  lat: number
  lng: number
  radius?: number
  specialty?: Specialty
  date?: string
  page?: number
  limit?: number
}
