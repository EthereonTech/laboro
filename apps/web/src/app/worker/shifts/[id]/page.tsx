'use client'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { formatCurrency, formatDateTime, formatTime, specialtyLabel } from '@/lib/format'

const C = {
  navy: '#0E2A78', jade: '#00C48C', jadeDeep: '#00A372', jadeInk: '#0A2A1E',
  orange: '#FF6B35', text: '#1A1A2E', textMute: '#5C6079', textSoft: '#8A8FA6',
  line: '#E6E8F0', lineSoft: '#EFF1F7', surface2: '#F8F9FC', surface3: '#F1F3F9',
}

const SHIFT_STATUS: Record<string, { bg: string; fg: string; dot: string; label: string }> = {
  OPEN:        { bg: '#FFF1E9', fg: '#C2511A', dot: C.orange, label: 'Aberta' },
  FILLED:      { bg: '#E8F3FF', fg: '#1B3FA0', dot: C.navy,  label: 'Preenchida' },
  IN_PROGRESS: { bg: '#E6FAF3', fg: '#00805B', dot: C.jade,  label: 'Em andamento' },
  DONE:        { bg: C.surface3, fg: C.textMute, dot: '#9AA0B7', label: 'Concluída' },
  CANCELLED:   { bg: '#FEE2E2', fg: '#991B1B', dot: '#EF4444', label: 'Cancelada' },
}

const APP_STATUS: Record<string, { bg: string; fg: string; label: string }> = {
  PENDING:   { bg: '#FFF7E6', fg: '#92400E', label: 'Aguardando' },
  CONFIRMED: { bg: '#E6FAF3', fg: '#00805B', label: 'Confirmado' },
  CANCELLED: { bg: '#FEE2E2', fg: '#991B1B', label: 'Cancelado' },
  COMPLETED: { bg: C.surface3, fg: C.textMute, label: 'Concluído' },
}

type ShiftDetail = {
  id: string
  specialty: string
  starts_at: string
  ends_at: string
  rate_per_hour: number
  total_value: number
  slots: number
  is_urgent: boolean
  status: string
  instructions: string | null
  business: { trade_name: string; address: { street: string; number: string; neighborhood: string; city: string } }
}

type MyApplication = { id: string; status: string } | null

export default function WorkerShiftDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data: shift, isLoading } = useQuery({
    queryKey: ['worker-shift-detail', id],
    queryFn: () => api.get<ShiftDetail>(`/shifts/${id}`),
  })

  const { data: myApp } = useQuery({
    queryKey: ['my-application', id],
    queryFn: () => api.get<MyApplication>(`/shifts/${id}/my-application`),
    enabled: !!shift,
  })

  const applyMutation = useMutation({
    mutationFn: () => api.post(`/shifts/${id}/apply`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-application', id] })
      queryClient.invalidateQueries({ queryKey: ['worker-shifts'] })
    },
  })

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0', background: C.surface2, minHeight: '100vh' }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', border: `3px solid ${C.jade}`, borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }
  if (!shift) return null

  const st = SHIFT_STATUS[shift.status] ?? SHIFT_STATUS.OPEN
  const hours = (new Date(shift.ends_at).getTime() - new Date(shift.starts_at).getTime()) / 3600000
  const canApply = shift.status === 'OPEN' && !myApp
  const appSt = myApp ? (APP_STATUS[myApp.status] ?? APP_STATUS.PENDING) : null

  return (
    <div style={{ background: C.surface2, minHeight: '100vh' }}>
      {/* navy hero */}
      <div style={{
        background: C.navy, color: '#fff',
        padding: '32px 32px 80px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -100, right: -80, width: 260, height: 260, borderRadius: '50%',
          background: 'radial-gradient(closest-side, rgba(0,196,140,0.22), transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          maskImage: 'linear-gradient(180deg, transparent, #000 30%, #000 100%)',
          WebkitMaskImage: 'linear-gradient(180deg, transparent, #000 30%, #000 100%)',
          pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <button
            onClick={() => router.back()}
            style={{
              appearance: 'none', border: 0, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'rgba(255,255,255,0.12)', borderRadius: 10, padding: '8px 12px',
              fontFamily: '"DM Sans", system-ui', fontSize: 13, fontWeight: 600, color: '#fff',
              marginBottom: 20,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M15 6l-6 6 6 6" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Voltar
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              background: st.bg, color: st.fg,
              padding: '4px 10px', borderRadius: 999,
              fontFamily: '"DM Sans", system-ui', fontSize: 11, fontWeight: 700,
            }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: st.dot, display: 'inline-block' }} />
              {st.label}
            </div>
            {shift.is_urgent && (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                background: C.orange, color: '#fff',
                padding: '4px 10px', borderRadius: 999,
                fontFamily: '"DM Sans", system-ui', fontSize: 10.5, fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: 0.4,
              }}>
                <svg width="9" height="11" viewBox="0 0 24 24" fill="#fff"><path d="M13 3L4 14h7l-1 7 9-11h-7l1-7Z"/></svg>
                Urgente
              </div>
            )}
          </div>

          <div style={{ fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 32, fontWeight: 800, color: '#fff', letterSpacing: -1, lineHeight: 1.1, marginBottom: 6 }}>
            {specialtyLabel(shift.specialty)}
          </div>
          <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 15, fontWeight: 500, color: 'rgba(255,255,255,0.7)' }}>
            {shift.business.trade_name}
          </div>
        </div>
      </div>

      <div style={{
        marginTop: -48, position: 'relative', zIndex: 2,
        padding: '0 32px 40px',
        maxWidth: 720, margin: '-48px auto 0',
      }}>
        {/* floating pay card */}
        <div style={{
          background: '#fff', borderRadius: 20, padding: '20px 24px',
          border: `1px solid ${C.line}`,
          boxShadow: '0 4px 8px rgba(14,42,120,0.06), 0 20px 40px rgba(14,42,120,0.10)',
          marginBottom: 20,
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div>
              <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 11.5, fontWeight: 700, color: C.textSoft, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 6 }}>
                Remuneração total
              </div>
              <div style={{ fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 32, fontWeight: 800, color: C.jadeDeep, letterSpacing: -1, lineHeight: 1 }}>
                {formatCurrency(shift.total_value)}
              </div>
              <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 12, color: C.textSoft, marginTop: 5, display: 'flex', alignItems: 'center', gap: 4 }}>
                <svg width="10" height="11" viewBox="0 0 24 24" fill="none">
                  <path d="M6 10V8a6 6 0 1 1 12 0v2M5 10h14v10H5z" stroke={C.jadeDeep} strokeWidth="2"/>
                </svg>
                Reservado em escrow · {hours.toFixed(1)}h
              </div>
            </div>
            <div>
              <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 11.5, fontWeight: 700, color: C.textSoft, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 6 }}>
                Valor/hora
              </div>
              <div style={{ fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 24, fontWeight: 800, color: C.navy, letterSpacing: -0.6, lineHeight: 1 }}>
                {formatCurrency(shift.rate_per_hour)}/h
              </div>
              <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 12, color: C.textSoft, marginTop: 5 }}>
                {shift.slots} vaga{shift.slots !== 1 ? 's' : ''} disponíve{shift.slots !== 1 ? 'is' : 'l'}
              </div>
            </div>
          </div>
        </div>

        {/* details card */}
        <div style={{
          background: '#fff', borderRadius: 20, padding: '20px 24px',
          border: `1px solid ${C.line}`,
          boxShadow: '0 2px 4px rgba(14,42,120,0.03), 0 8px 20px rgba(14,42,120,0.06)',
          marginBottom: 20,
        }}>
          <div style={{ fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 16, fontWeight: 700, color: C.text, letterSpacing: -0.3, marginBottom: 14 }}>
            Detalhes do turno
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              {
                icon: 'M3 9h18M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm3-2v4m8-4v4',
                label: 'Data e horário',
                value: `${formatDateTime(shift.starts_at)} até ${formatTime(shift.ends_at)} (${hours.toFixed(1)}h)`,
              },
              {
                icon: 'M12 21s7-7 7-12a7 7 0 0 0-14 0c0 5 7 12 7 12Zm0-9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
                label: 'Endereço',
                value: `${shift.business.address.street}, ${shift.business.address.number} · ${shift.business.address.neighborhood} · ${shift.business.address.city}`,
              },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 10, background: C.surface3,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                    <path d={row.icon} stroke={C.navy} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 11, fontWeight: 700, color: C.textSoft, letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 2 }}>{row.label}</div>
                  <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 13.5, fontWeight: 500, color: C.text }}>{row.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* instructions */}
        {shift.instructions && (
          <div style={{
            background: '#FFF7E6', borderRadius: 16, padding: '14px 18px',
            border: '1px solid #FDE68A', marginBottom: 20,
          }}>
            <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 11.5, fontWeight: 700, color: '#92400E', letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 6 }}>
              Instruções
            </div>
            <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 14, color: C.text, lineHeight: 1.5 }}>
              {shift.instructions}
            </div>
          </div>
        )}

        {/* CTA / status */}
        {myApp && appSt ? (
          <div style={{
            background: appSt.bg, borderRadius: 16, padding: '16px 20px',
            textAlign: 'center',
          }}>
            <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 15, fontWeight: 700, color: appSt.fg }}>
              Candidatura: {appSt.label}
            </div>
          </div>
        ) : canApply ? (
          <div>
            <button
              onClick={() => applyMutation.mutate()}
              disabled={applyMutation.isPending}
              style={{
                width: '100%', appearance: 'none', border: 0,
                cursor: applyMutation.isPending ? 'not-allowed' : 'pointer',
                background: C.jade, color: C.jadeInk, borderRadius: 16,
                padding: '17px 24px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                fontFamily: '"DM Sans", system-ui', fontSize: 16, fontWeight: 700,
                boxShadow: '0 14px 30px rgba(0,196,140,0.35)',
                opacity: applyMutation.isPending ? 0.7 : 1,
                transition: 'all 200ms',
              }}
            >
              {applyMutation.isPending ? 'Enviando...' : 'Me candidatar'}
              {!applyMutation.isPending && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M9 6l6 6-6 6" stroke={C.jadeInk} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
            {applyMutation.isError && (
              <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 13, color: '#991B1B', textAlign: 'center', marginTop: 10 }}>
                {(applyMutation.error as any)?.message}
              </div>
            )}
          </div>
        ) : (
          <div style={{
            background: C.surface3, borderRadius: 14, padding: '14px 20px',
            textAlign: 'center',
            fontFamily: '"DM Sans", system-ui', fontSize: 14, color: C.textMute,
          }}>
            Esta vaga não está aceitando candidaturas
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
