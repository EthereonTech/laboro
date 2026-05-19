export function formatCurrency(value: number | string): string {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
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

export function shiftStatusLabel(status: string): { label: string; color: string } {
  const map: Record<string, { label: string; color: string }> = {
    OPEN: { label: 'Aberta', color: '#3B82F6' },
    FILLED: { label: 'Preenchida', color: '#8B5CF6' },
    IN_PROGRESS: { label: 'Em andamento', color: '#F59E0B' },
    DONE: { label: 'Concluída', color: '#10B981' },
    CANCELLED: { label: 'Cancelada', color: '#EF4444' },
  }
  return map[status] ?? { label: status, color: '#9CA3AF' }
}

export function applicationStatusLabel(status: string): { label: string; color: string } {
  const map: Record<string, { label: string; color: string }> = {
    PENDING: { label: 'Aguardando', color: '#F59E0B' },
    CONFIRMED: { label: 'Confirmado', color: '#10B981' },
    CANCELLED: { label: 'Cancelado', color: '#EF4444' },
    NO_SHOW: { label: 'No-show', color: '#EF4444' },
    COMPLETED: { label: 'Concluído', color: '#6B7280' },
  }
  return map[status] ?? { label: status, color: '#9CA3AF' }
}

export function segmentLabel(segment: string): string {
  const map: Record<string, string> = {
    bar: 'Bar', restaurante: 'Restaurante', evento: 'Evento',
    hotel: 'Hotel', varejo: 'Varejo', saude: 'Saúde',
    logistica: 'Logística', outro: 'Outro',
  }
  return map[segment] ?? segment
}
