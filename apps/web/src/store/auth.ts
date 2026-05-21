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
  login: (email: string, password: string, type: 'worker' | 'business') => Promise<void>
  register: (email: string, password: string, fullName: string, type: 'worker' | 'business') => Promise<{ isNew: boolean }>
  logout: () => Promise<void>
}

function readSessionFromStorage(): { user: AuthUser | null; isLoading: boolean } {
  if (typeof window === 'undefined') return { user: null, isLoading: true }
  const payload = getTokenPayload()
  if (!payload) return { user: null, isLoading: false }
  return { user: { id: payload.sub, type: payload.type }, isLoading: false }
}

export const useAuthStore = create<AuthState>((set) => ({
  ...readSessionFromStorage(),

  loadSession: () => {
    const payload = getTokenPayload()
    if (!payload) { set({ user: null, isLoading: false }); return }
    set({ user: { id: payload.sub, type: payload.type }, isLoading: false })
  },

  login: async (email, password, type) => {
    const data = await api.post<{
      accessToken: string
      refreshToken: string
      type: 'worker' | 'business'
    }>('/auth/login', { email, password, type }, { skipAuth: true })

    setStoredToken('access_token', data.accessToken)
    setStoredToken('refresh_token', data.refreshToken)

    const payload = getTokenPayload()!
    set({ user: { id: payload.sub, type: data.type } })
  },

  register: async (email, password, fullName, type) => {
    const data = await api.post<{
      accessToken: string
      refreshToken: string
      isNew: boolean
      type: 'worker' | 'business'
    }>('/auth/register', { email, password, full_name: fullName, type }, { skipAuth: true })

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
