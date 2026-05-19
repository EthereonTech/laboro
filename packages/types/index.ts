export type UserType = 'worker' | 'business'
export type WorkerLevel = 'BEGINNER' | 'VERIFIED' | 'TOP_PRO'
export type ShiftStatus = 'OPEN' | 'FILLED' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED'
export type ApplicationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'NO_SHOW' | 'COMPLETED'
export type EscrowStatus = 'RESERVED' | 'CONFIRMED' | 'RELEASED' | 'REFUNDED' | 'FAILED'

export type ApiResponse<T> = {
  data: T
  meta?: { total: number; page: number; limit: number }
}

export type ApiError = {
  error: { code: string; message: string; details?: unknown }
}
