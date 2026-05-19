import { Logtail } from '@logtail/node'

const logtail = process.env.LOGTAIL_TOKEN ? new Logtail(process.env.LOGTAIL_TOKEN) : null

// Masks CPF to ***.***.XXX-XX (shows only last 3 digits before dash)
export function maskCpf(cpf: string): string {
  const digits = cpf.replace(/\D/g, '')
  if (digits.length !== 11) return '***.***.***-**'
  return `***.***.${digits.slice(6, 9)}-${digits.slice(9)}`
}

// Masks Pix key — shows type prefix only
export function maskPixKey(key: string): string {
  if (key.includes('@')) return `${key[0]}***@***.***`
  if (key.length === 11 && /^\d+$/.test(key)) return maskCpf(key)
  return `${key.slice(0, 4)}****`
}

type LogLevel = 'info' | 'warn' | 'error'
type LogData = Record<string, unknown>

function emit(level: LogLevel, data: LogData | string): void {
  const entry = typeof data === 'string' ? { message: data } : data
  const json = JSON.stringify(entry)

  if (level === 'info') console.info(json)
  else if (level === 'warn') console.warn(json)
  else console.error(json)

  if (logtail) {
    if (level === 'info') logtail.info(json)
    else if (level === 'warn') logtail.warn(json)
    else logtail.error(json)
  }
}

export const logger = {
  info: (data: LogData) => emit('info', data),
  warn: (data: LogData | string) => emit('warn', typeof data === 'string' ? { message: data } : data),
  error: (data: LogData | string) => emit('error', typeof data === 'string' ? { message: data } : data),

  payment: (event: string, data: LogData) =>
    emit('info', { event, ...data }),

  escrow: (event: string, data: LogData) =>
    emit('info', { event, ...data }),
}
