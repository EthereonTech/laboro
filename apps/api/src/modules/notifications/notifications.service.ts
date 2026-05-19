import { sendExpoPush, isValidExpoPushToken } from '../../lib/expo-push'
import { sendWhatsApp } from '../../lib/zapi'
import { findUserNotificationData, savePushToken } from './notifications.repository'
import { NotificationPayload, NotificationResult } from './notifications.types'

export async function registerDeviceToken(userId: string, pushToken: string): Promise<void> {
  await savePushToken(userId, pushToken)
}

/**
 * Envia notificação para um usuário.
 * Tenta push primeiro; se não houver token ou falhar, cai para WhatsApp.
 */
export async function notifyUser(
  userId: string,
  payload: NotificationPayload,
): Promise<NotificationResult> {
  const user = await findUserNotificationData(userId)
  if (!user) return { channel: 'push', success: false, error: 'Usuário não encontrado' }

  // Tenta push
  if (user.push_token && isValidExpoPushToken(user.push_token)) {
    try {
      const receipts = await sendExpoPush([
        { to: user.push_token, title: payload.title, body: payload.body, data: payload.data, sound: 'default' },
      ])
      const receipt = receipts[0]
      if (receipt?.status === 'ok') {
        return { channel: 'push', success: true }
      }
      // Push bounced — fallthrough to WhatsApp
      console.warn('[push] receipt error:', receipt?.message)
    } catch (err: any) {
      console.warn('[push] send failed:', err.message)
    }
  }

  // Fallback: WhatsApp
  if (user.phone) {
    try {
      await sendWhatsApp(user.phone, `*${payload.title}*\n${payload.body}`)
      return { channel: 'whatsapp', success: true }
    } catch (err: any) {
      console.error('[whatsapp] send failed:', err.message)
      return { channel: 'whatsapp', success: false, error: err.message }
    }
  }

  return { channel: 'push', success: false, error: 'Sem token de push nem telefone' }
}
