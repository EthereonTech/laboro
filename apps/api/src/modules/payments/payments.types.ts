export interface PixQrCode {
  payload: string
  encoded_image: string
  expiration_date: string
}

export interface ReserveEscrowInput {
  shiftId: string
  workerId: string
  businessId: string
  grossAmount: number
  laboroFee: number
  workerAmount: number
}
