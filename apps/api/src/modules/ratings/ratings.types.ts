export interface RatingSummary {
  id: string
  shift_id: string
  from_id: string
  to_id: string
  score: number
  tags: string[]
  comment?: string | null
  created_at: Date
}

export interface CreateRatingInput {
  shift_id: string
  to_id: string
  score: number
  tags: string[]
  comment?: string
}
