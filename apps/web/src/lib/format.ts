export function formatCurrency(value: number | string): string {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
  })
}

export function formatTime(date: string | Date): string {
  return new Date(date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export function specialtyLabel(specialty: string): string {
  const map: Record<string, string> = {
    garcom: 'Garçom', bartender: 'Bartender', aux_cozinha: 'Aux. Cozinha',
    promotor: 'Promotor(a)', caixa: 'Caixa', repositor: 'Repositor',
    cuidador: 'Cuidador(a)', aux_logistica: 'Aux. Logística',
  }
  return map[specialty] ?? specialty
}

export function shiftStatusLabel(status: string): { label: string; color: string; bg: string } {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    OPEN:        { label: 'Aberta',       color: 'text-blue-700',  bg: 'bg-blue-50' },
    FILLED:      { label: 'Preenchida',   color: 'text-purple-700', bg: 'bg-purple-50' },
    IN_PROGRESS: { label: 'Em andamento', color: 'text-amber-700', bg: 'bg-amber-50' },
    DONE:        { label: 'Concluída',    color: 'text-green-700', bg: 'bg-green-50' },
    CANCELLED:   { label: 'Cancelada',   color: 'text-red-700',   bg: 'bg-red-50' },
  }
  return map[status] ?? { label: status, color: 'text-gray-600', bg: 'bg-gray-100' }
}

export function applicationStatusLabel(status: string): { label: string; color: string; bg: string } {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    PENDING:   { label: 'Aguardando',  color: 'text-amber-700',  bg: 'bg-amber-50' },
    CONFIRMED: { label: 'Confirmado',  color: 'text-green-700',  bg: 'bg-green-50' },
    CANCELLED: { label: 'Cancelado',   color: 'text-red-700',    bg: 'bg-red-50' },
    NO_SHOW:   { label: 'No-show',     color: 'text-red-700',    bg: 'bg-red-50' },
    COMPLETED: { label: 'Concluído',   color: 'text-gray-600',   bg: 'bg-gray-100' },
  }
  return map[status] ?? { label: status, color: 'text-gray-600', bg: 'bg-gray-100' }
}

export function levelLabel(level: string): { label: string; color: string } {
  const map: Record<string, { label: string; color: string }> = {
    BEGINNER: { label: 'Iniciante',   color: 'text-gray-600' },
    VERIFIED: { label: 'Verificado',  color: 'text-blue-600' },
    TOP_PRO:  { label: 'Top Pro ⭐', color: 'text-green-700' },
  }
  return map[level] ?? { label: level, color: 'text-gray-600' }
}

export function segmentLabel(segment: string): string {
  const map: Record<string, string> = {
    bar: 'Bar', restaurante: 'Restaurante', evento: 'Evento',
    hotel: 'Hotel', varejo: 'Varejo', saude: 'Saúde',
    logistica: 'Logística', outro: 'Outro',
  }
  return map[segment] ?? segment
}
