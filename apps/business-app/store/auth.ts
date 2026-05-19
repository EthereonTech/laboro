import { create } from 'zustand'
import * as SecureStore from 'expo-secure-store'
import { api } from '../lib/api'

export type AuthUser = { id: string; type: 'worker' | 'business' }

type AuthState = {
  user: AuthUser | null
  isLoading: boolean
  sendOtp: (phone: string) => Promise<void>
  verifyOtp: (phone: string, code: string) => Promise<{ isNew: boolean }>
  logout: () => Promise<void>
  loadSession: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,

  loadSession: async () => {
    try {
      const token = await SecureStore.getItemAsync('access_token')
      if (!token) { set({ isLoading: false }); return }
      const payload = JSON.parse(atob(token.split('.')[1]))
      if (payload.exp * 1000 > Date.now()) {
        set({ user: { id: payload.sub, type: payload.type }, isLoading: false })
      } else {
        set({ isLoading: false })
      }
    } catch {
      set({ isLoading: false })
    }
  },

  sendOtp: async (phone) => {
    await api.post('/auth/otp/send', { phone, type: 'business' }, { skipAuth: true })
  },

  verifyOtp: async (phone, code) => {
    const data = await api.post<{ accessToken: string; refreshToken: string; isNew: boolean; type: string }>(
      '/auth/otp/verify', { phone, code }, { skipAuth: true },
    )
    await SecureStore.setItemAsync('access_token', data.accessToken)
    await SecureStore.setItemAsync('refresh_token', data.refreshToken)
    const payload = JSON.parse(atob(data.accessToken.split('.')[1]))
    set({ user: { id: payload.sub, type: data.type as 'business' } })
    return { isNew: data.isNew }
  },

  logout: async () => {
    const refreshToken = await SecureStore.getItemAsync('refresh_token')
    if (refreshToken) await api.post('/auth/logout', { refreshToken }).catch(() => {})
    await SecureStore.deleteItemAsync('access_token')
    await SecureStore.deleteItemAsync('refresh_token')
    set({ user: null })
  },
}))
