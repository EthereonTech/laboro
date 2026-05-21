'use client'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { formatCurrency, formatDate, specialtyLabel } from '@/lib/format'

const C = {
  navy: '#0E2A78',
  jade: '#00C48C', jadeDeep: '#00A372',
  orange: '#FF6B35',
  text: '#1A1A2E', textMute: '#5C6079', textSoft: '#8A8FA6',
  line: '#E6E8F0', lineSoft: '#EFF1F7', surface: '#FFFFFF', surface2: '#F8F9FC', surface3: '#F1F3F9',
}

type Payment = {
  id: string
  worker_amount: number
  status: string
  released_at: string | null
  shift: { specialty: string; starts_at: string; business: { trade_name: string } }
}

const STATUS: Record<string, { label: string; fg: string; bg: string; dot: string }> = {
  RESERVED:  { label: 'Aguardando pagamento', fg: '#92400E', bg: '#FFF7E6', dot: '#F59E0B' },
  CONFIRMED: { label: 'Pago — em escrow',     fg: '#1B3FA0', bg: '#E8F3FF', dot: C.navy   },
  RELEASED:  { label: 'Liberado via Pix',     fg: '#00805B', bg: '#E6FAF3', dot: C.jade   },
  REFUNDED:  { label: 'Estornado',            fg: '#991B1B', bg: '#FEE2E2', dot: '#EF4444' },
  FAILED:    { label: 'Falhou',               fg: '#991B1B', bg: '#FEE2E2', dot: '#EF4444' },
}

function MetricCard({
  value, label, accent = false, loading = false,
}: { value: string; label: string; accent?: boolean; loading?: boolean }) {
  return (
    <div style={{
      background: C.surface, border: `1px solid ${C.line}`, borderRadius: 14, padding: '16px 20px',
    }}>
      {loading ? (
        <>
          <div style={{ height: 22, width: '55%', borderRadius: 5, background: C.surface3, animation: 'pulse 1.4s ease-in-out infinite' }} />
          <div style={{ height: 11, width: '70%', borderRadius: 4, background: C.surface3, marginTop: 6, animation: 'pulse 1.4s ease-in-out infinite', animationDelay: '0.1s' }} />
        </>
      ) : (
        <>
          <div style={{ fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 24, fontWeight: 800, color: accent ? C.jadeDeep : C.text, letterSpacing: -0.8, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
            {value}
          </div>
          <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 12, color: C.textSoft, marginTop: 5 }}>{label}</div>
        </>
      )}
    </div>
  )
}

function SkeletonRow() {
  return (
    <div style={{ background: C.surface, borderRadius: 14, padding: '14px 18px', border: `1px solid ${C.line}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ height: 15, width: '40%', borderRadius: 5, background: C.surface3, animation: 'pulse 1.4s ease-in-out infinite' }} />
        <div style={{ height: 12, width: '55%', borderRadius: 4, background: C.surface3, animation: 'pulse 1.4s ease-in-out infinite', animationDelay: '0.1s' }} />
        <div style={{ height: 11, width: '35%', borderRadius: 4, background: C.surface3, animation: 'pulse 1.4s ease-in-out infinite', animationDelay: '0.15s' }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
        <div style={{ height: 19, width: 66, borderRadius: 5, background: C.surface3, animation: 'pulse 1.4s ease-in-out infinite', animationDelay: '0.2s' }} />
        <div style={{ height: 18, width: 100, borderRadius: 999, background: C.surface3, animation: 'pulse 1.4s ease-in-out infinite', animationDelay: '0.25s' }} />
      </div>
    </div>
  )
}

export default function WorkerHistoryPage() {
  const { data: payments, isLoading } = useQuery({
    queryKey: ['worker-payments'],
    queryFn: () => api.get<Payment[]>('/workers/me/payments'),
    placeholderData: (prev) => prev,
  })

  const list = payments ?? []
  const totalReceived = list.filter(p => p.status === 'RELEASED').reduce((s, p) => s + Number(p.worker_amount), 0)
  const totalEscrow   = list.filter(p => p.status === 'CONFIRMED').reduce((s, p) => s + Number(p.worker_amount), 0)
  const totalTurnos   = list.filter(p => p.status === 'RELEASED').length

  return (
    <div style={{ background: C.surface2, minHeight: '100vh', padding: '32px 40px 60px' }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 26, fontWeight: 800, color: C.text, letterSpacing: -0.8, margin: '0 0 5px' }}>
          Carteira
        </h1>
        <p style={{ fontFamily: '"DM Sans", system-ui', fontSize: 13.5, color: C.textSoft, margin: 0 }}>
          Pagamentos e histórico financeiro
        </p>
      </div>

      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: totalEscrow > 0 ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)', gap: 10, marginBottom: 28 }}>
        <MetricCard loading={isLoading} value={formatCurrency(totalReceived)} label="total recebido" accent />
        {totalEscrow > 0 && (
          <MetricCard loading={isLoading} value={formatCurrency(totalEscrow)} label="em escrow" />
        )}
        <MetricCard loading={isLoading} value={String(totalTurnos)} label="turnos pagos" />
      </div>

      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
        <h2 style={{ fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 17, fontWeight: 700, color: C.text, letterSpacing: -0.3, margin: 0 }}>
          Histórico de pagamentos
        </h2>
        {list.length > 0 && (
          <span style={{ fontFamily: '"DM Sans", system-ui', fontSize: 13, color: C.textSoft }}>
            {list.length} registro{list.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1, 2, 3, 4].map(i => <SkeletonRow key={i} />)}
        </div>
      ) : !list.length ? (
        <div style={{ background: C.surface, borderRadius: 16, padding: '52px 24px', textAlign: 'center', border: `1px solid ${C.line}` }}>
          <svg width={44} height={44} viewBox="0 0 44 44" fill="none" style={{ margin: '0 auto 14px', display: 'block', opacity: 0.3 }}>
            <rect x="8" y="10" width="28" height="24" rx="4" stroke={C.navy} strokeWidth={2} />
            <path d="M8 17h28" stroke={C.navy} strokeWidth={2} />
            <path d="M15 26h5M24 26h5" stroke={C.textSoft} strokeWidth={2} strokeLinecap="round" />
          </svg>
          <p style={{ fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 17, fontWeight: 700, color: C.text, margin: '0 0 5px' }}>
            Nenhum pagamento ainda
          </p>
          <p style={{ fontFamily: '"DM Sans", system-ui', fontSize: 13.5, color: C.textMute, margin: 0 }}>
            Seus pagamentos aparecem aqui após a conclusão dos turnos
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {list.map(p => {
            const st = STATUS[p.status] ?? { label: p.status, fg: C.textMute, bg: C.surface3, dot: '#9AA0B7' }
            return (
              <div key={p.id} style={{
                background: C.surface, borderRadius: 14, padding: '14px 18px',
                border: `1px solid ${C.line}`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
                transition: 'border-color 100ms',
              }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#C7CBDA')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = C.line)}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 15, fontWeight: 700, color: C.text, letterSpacing: -0.3, marginBottom: 3 }}>
                    {specialtyLabel(p.shift.specialty)}
                  </div>
                  <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 12.5, color: C.textMute }}>
                    {p.shift.business.trade_name}
                  </div>
                  <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 12, color: C.textSoft, marginTop: 2 }}>
                    {formatDate(p.shift.starts_at)}
                    {p.released_at && ` · Liberado ${formatDate(p.released_at)}`}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 19, fontWeight: 800, color: p.status === 'RELEASED' ? C.jadeDeep : C.text, letterSpacing: -0.5, fontVariantNumeric: 'tabular-nums' }}>
                    {formatCurrency(p.worker_amount)}
                  </div>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 4,
                    background: st.bg, color: st.fg,
                    padding: '2px 8px', borderRadius: 999,
                    fontFamily: '"DM Sans", system-ui', fontSize: 10.5, fontWeight: 700,
                  }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: st.dot, display: 'inline-block', flexShrink: 0 }} />
                    {st.label}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <style>{`@keyframes pulse { 0%, 100% { opacity: 0.6; } 50% { opacity: 0.3; } }`}</style>
    </div>
  )
}
