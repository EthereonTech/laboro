const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send'

export interface ExpoPushMessage {
  to: string
  title: string
  body: string
  data?: Record<string, unknown>
  sound?: 'default'
  badge?: number
}

export interface ExpoPushReceipt {
  status: 'ok' | 'error'
  message?: string
  details?: { error?: string }
}

export async function sendExpoPush(messages: ExpoPushMessage[]): Promise<ExpoPushReceipt[]> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }
  if (process.env.EXPO_ACCESS_TOKEN) {
    headers['Authorization'] = `Bearer ${process.env.EXPO_ACCESS_TOKEN}`
  }

  const res = await fetch(EXPO_PUSH_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify(messages),
  })

  if (!res.ok) throw new Error(`Expo push failed: ${res.status}`)

  const json = (await res.json()) as { data: ExpoPushReceipt[] }
  return json.data
}

export function isValidExpoPushToken(token: string): boolean {
  return token.startsWith('ExponentPushToken[') || token.startsWith('ExpoPushToken[')
}
