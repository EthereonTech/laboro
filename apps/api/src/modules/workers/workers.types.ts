import { Specialty, PixKeyType, WorkerLevel } from '@prisma/client'

export type WorkerProfile = {
  id: string
  user_id: string
  full_name: string
  phone: string
  photo_url: string | null
  pix_key: string | null
  pix_key_type: PixKeyType | null
  score: number
  total_shifts: number
  on_time_rate: number
  level: WorkerLevel
  specialties: Specialty[]
  is_verified: boolean
}

export type UpdateWorkerBody = {
  full_name?: string
  pix_key?: string
  pix_key_type?: PixKeyType
  specialties?: Specialty[]
}
