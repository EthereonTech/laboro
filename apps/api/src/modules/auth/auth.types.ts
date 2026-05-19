export type OtpData = {
  code: string
  type: 'worker' | 'business'
  attempts: number
}

export type RefreshTokenData = {
  userId: string
  type: 'worker' | 'business'
}

export type AuthTokens = {
  accessToken: string
  refreshToken: string
}
