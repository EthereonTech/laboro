'use client'
import { create } from 'zustand'
import { api, setStoredToken, removeStoredToken, getStoredToken, getTokenPayload } from '@/lib/api'

export type AuthUser = {
  id: string
  type: 'worker' | 'business'
}

type AuthState = {
  user: AuthUser | null
  isLoading: boolean
  loadSession: () => void
  sendOtp: (phone: string, type: 'worker' | 'business') => Promise<void>
  verifyOtp: (phone: string, code: string, type: 'worker' | 'business') => Promise<{ isNew: boolean }>
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,

  loadSession: () => {
    const payload = getTokenPayload()
    if (!payload) { set({ isLoading: false }); return }
    set({ user: { id: payload.sub, type: payload.type }, isLoading: false })
  },

  sendOtp: async (phone, type) => {
    await api.post('/auth/otp/send', { phone, type }, { skipAuth: true })
  },

  verifyOtp: async (phone, code, type) => {
    const data = await api.post<{
      accessToken: string
      refreshToken: string
      isNew: boolean
      type: 'worker' | 'business'
    }>('/auth/otp/verify', { phone, code, type }, { skipAuth: true })

    setStoredToken('access_token', data.accessToken)
    setStoredToken('refresh_token', data.refreshToken)

    const payload = getTokenPayload()!
    set({ user: { id: payload.sub, type: data.type } })
    return { isNew: data.isNew }
  },

  logout: async () => {
    const refreshToken = getStoredToken('refresh_token')
    if (refreshToken) {
      await api.post('/auth/logout', { refreshToken }).catch(() => {})
    }
    removeStoredToken('access_token')
    removeStoredToken('refresh_token')
    set({ user: null })
  },
}))
