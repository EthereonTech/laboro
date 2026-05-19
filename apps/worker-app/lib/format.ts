export function formatCurrency(value: number | string): string {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatTime(date: string | Date): string {
  return new Date(date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export function specialtyLabel(specialty: string): string {
  const map: Record<string, string> = {
    garcom: 'Garçom',
    bartender: 'Bartender',
    aux_cozinha: 'Aux. Cozinha',
    promotor: 'Promotor(a)',
    caixa: 'Caixa',
    repositor: 'Repositor',
    cuidador: 'Cuidador(a)',
    aux_logistica: 'Aux. Logística',
  }
  return map[specialty] ?? specialty
}

export function levelLabel(level: string): string {
  const map: Record<string, string> = {
    BEGINNER: 'Iniciante',
    VERIFIED: 'Verificado',
    TOP_PRO: 'Top Pro',
  }
  return map[level] ?? level
}

export function applicationStatusLabel(status: string): string {
  const map: Record<string, string> = {
    PENDING: 'Aguardando confirmação',
    CONFIRMED: 'Confirmado',
    CANCELLED: 'Cancelado',
    NO_SHOW: 'No-show',
    COMPLETED: 'Concluído',
  }
  return map[status] ?? status
}
