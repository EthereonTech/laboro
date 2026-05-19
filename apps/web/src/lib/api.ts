const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'

function getStoredToken(key: string): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(key)
}

function setStoredToken(key: string, value: string) {
  localStorage.setItem(key, value)
}

function removeStoredToken(key: string) {
  localStorage.removeItem(key)
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getStoredToken('refresh_token')
  if (!refreshToken) return null

  const res = await fetch(`${BASE_URL}/auth/token/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })
  if (!res.ok) return null

  const { data } = await res.json()
  setStoredToken('access_token', data.accessToken)
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
    let token = getStoredToken('access_token')
    if (!token) token = await refreshAccessToken()
    if (token) headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...fetchOptions, headers })

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
    removeStoredToken('access_token')
    removeStoredToken('refresh_token')
    if (typeof window !== 'undefined') window.location.href = '/login'
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
}

export function getTokenPayload(): { sub: string; type: 'worker' | 'business' } | null {
  const token = getStoredToken('access_token')
  if (!token) return null
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch {
    return null
  }
}

export { setStoredToken, removeStoredToken, getStoredToken }
