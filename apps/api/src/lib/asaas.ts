const BASE_URL = process.env.ASAAS_BASE_URL ?? 'https://sandbox.asaas.com/api/v3'

// Maps Prisma PixKeyType to Asaas pixAddressKeyType
export const PIX_KEY_TYPE_MAP: Record<string, string> = {
  cpf: 'CPF',
  phone: 'PHONE',
  email: 'EMAIL',
  cnpj: 'CNPJ',
  random: 'EVP',
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const apiKey = process.env.ASAAS_API_KEY
  if (!apiKey) throw Object.assign(new Error('ASAAS_API_KEY não configurada'), { appCode: 'PAYMENT_FAILED' })

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', access_token: apiKey },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const text = await res.text()
    throw Object.assign(new Error(`Asaas ${res.status}: ${text}`), { appCode: 'PAYMENT_FAILED' })
  }

  return res.json() as Promise<T>
}

export interface AsaasCustomer {
  id: string
  name: string
  cpfCnpj: string
}

export interface AsaasPayment {
  id: string
  status: string
  value: number
  externalReference: string
}

export interface AsaasPixQrCode {
  encodedImage: string
  payload: string
  expirationDate: string
}

export interface AsaasTransfer {
  id: string
  status: string
  value: number
}

export const asaas = {
  createCustomer: (data: { name: string; cpfCnpj: string; mobilePhone?: string; email?: string }) =>
    request<AsaasCustomer>('POST', '/customers', data),

  createPixCharge: (data: {
    customer: string
    billingType: 'PIX'
    value: number
    dueDate: string
    externalReference: string
    description?: string
  }) => request<AsaasPayment>('POST', '/payments', data),

  getPixQrCode: (paymentId: string) =>
    request<AsaasPixQrCode>('GET', `/payments/${paymentId}/pixQrCode`),

  cancelPayment: (paymentId: string) =>
    request<{ deleted: boolean }>('POST', `/payments/${paymentId}/cancel`),

  refundPayment: (paymentId: string, value?: number) =>
    request<AsaasPayment>('POST', `/payments/${paymentId}/refund`, value !== undefined ? { value } : undefined),

  createTransfer: (data: {
    value: number
    pixAddressKey: string
    pixAddressKeyType: string
    description?: string
  }) => request<AsaasTransfer>('POST', '/transfers', data),
}

export function verifyWebhookSignature(token: string): boolean {
  return token === process.env.ASAAS_WEBHOOK_TOKEN
}
