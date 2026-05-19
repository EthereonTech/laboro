export interface NotificationPayload {
  title: string
  body: string
  data?: Record<string, unknown>
}

export type NotificationChannel = 'push' | 'whatsapp'

export interface NotificationResult {
  channel: NotificationChannel
  success: boolean
  error?: string
}
