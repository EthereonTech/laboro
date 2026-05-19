const ZAPI_BASE = `https://api.z-api.io/instances/${process.env.ZAPI_INSTANCE_ID}/token/${process.env.ZAPI_TOKEN}`

export async function sendWhatsApp(phone: string, message: string): Promise<void> {
  if (!process.env.ZAPI_INSTANCE_ID || !process.env.ZAPI_TOKEN) {
    console.warn('[Z-API] Credenciais não configuradas — mensagem não enviada:', { phone, message })
    return
  }

  // Normalize phone: remove +, spaces, keep only digits
  const normalized = phone.replace(/\D/g, '')

  const res = await fetch(`${ZAPI_BASE}/send-text`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: normalized, message }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Z-API error ${res.status}: ${text}`)
  }
}
