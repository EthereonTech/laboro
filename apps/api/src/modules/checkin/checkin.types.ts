export interface CheckinResult {
  checked_in: boolean
  shift_id: string
  warning?: string
}

export interface CheckoutResult {
  checked_out: boolean
  shift_id: string
  hours_worked: number
}
