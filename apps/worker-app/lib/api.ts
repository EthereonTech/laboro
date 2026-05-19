import * as SecureStore from 'expo-secure-store'

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000'

async function getAccessToken() {
  return SecureStore.getItemAsync('access_token')
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = await SecureStore.getItemAsync('refresh_token')
  if (!refreshToken) return null

  const res = await fetch(`${BASE_URL}/auth/token/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })
  if (!res.ok) return null

  const { data } = await res.json()
  await SecureStore.setItemAsync('access_token', data.accessToken)
  return data.accessToken
}

async function request<T>(
  path: string,
  options: RequestInit & { skipAuth?: boolean } = {},
): Promise<T> {
  const { skipAuth, ...fetchOptions } = options

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string>),
  }

  if (!skipAuth) {
    let token = await getAccessToken()
    if (!token) token = await refreshAccessToken()
    if (token) headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...fetchOptions, headers })

  // Token expirado — tentar refresh uma vez
  if (res.status === 401 && !skipAuth) {
    const newToken = await refreshAccessToken()
    if (newToken) {
      headers['Authorization'] = `Bearer ${newToken}`
      const retry = await fetch(`${BASE_URL}${path}`, { ...fetchOptions, headers })
      if (!retry.ok) {
        const err = await retry.json().catch(() => ({}))
        throw Object.assign(new Error(err?.error?.message ?? 'Erro na requisição'), {
          status: retry.status,
          code: err?.error?.code,
        })
      }
      return retry.json().then((r) => r.data ?? r)
    }
    // Sem token válido — limpar sessão
    await SecureStore.deleteItemAsync('access_token')
    await SecureStore.deleteItemAsync('refresh_token')
    throw Object.assign(new Error('Sessão expirada'), { status: 401, code: 'SESSION_EXPIRED' })
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw Object.assign(new Error(err?.error?.message ?? 'Erro na requisição'), {
      status: res.status,
      code: err?.error?.code,
    })
  }

  if (res.status === 204) return undefined as T
  const body = await res.json()
  return body.data ?? body
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T>(path: string, body?: unknown, opts?: { skipAuth?: boolean }) =>
    request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined, ...opts }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
  postForm: <T>(path: string, form: FormData) =>
    request<T>(path, {
      method: 'POST',
      body: form,
      headers: {},  // deixar Content-Type ser setado pelo browser com boundary
    }),
}
