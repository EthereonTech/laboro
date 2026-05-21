'use client'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { formatCurrency, formatDate, specialtyLabel } from '@/lib/format'

const C = {
  navy: '#0E2A78', navyLight: '#1B3FA0',
  jade: '#00C48C', jadeDeep: '#00A372',
  orange: '#FF6B35',
  text: '#1A1A2E', textMute: '#5C6079', textSoft: '#8A8FA6',
  line: '#E6E8F0', lineSoft: '#EFF1F7', surface2: '#F8F9FC', surface3: '#F1F3F9',
}

type Payment = {
  id: string
  gross_amount: number
  laboro_fee: number
  worker_amount: number
  status: string
  reserved_at: string | null
  released_at: string | null
  shift: { specialty: string; starts_at: string }
  worker: { user: { full_name: string } }
}

const STATUS_MAP: Record<string, { label: string; fg: string; bg: string; dot: string }> = {
  RESERVED:  { label: 'Aguardando Pix',  fg: '#92400E', bg: '#FFF7E6', dot: '#F59E0B' },
  CONFIRMED: { label: 'Pago — em escrow', fg: '#1B3FA0', bg: '#E8F3FF', dot: C.navy },
  RELEASED:  { label: 'Liberado',        fg: '#00805B', bg: '#E6FAF3', dot: C.jade },
  REFUNDED:  { label: 'Estornado',       fg: '#991B1B', bg: '#FEE2E2', dot: '#EF4444' },
  FAILED:    { label: 'Falhou',          fg: '#991B1B', bg: '#FEE2E2', dot: '#EF4444' },
}

function MetricCard({ label, value, sub, loading = false }: { label: string; value: string; sub?: string; loading?: boolean }) {
  return (
    <div style={{
      background: '#fff', border: `1px solid ${C.line}`,
      borderRadius: 16, padding: '18px 20px',
      display: 'flex', flexDirection: 'column', gap: 4,
    }}>
      <span style={{
        fontFamily: '"DM Sans", system-ui',
        fontSize: 12, fontWeight: 600, color: C.textSoft,
        letterSpacing: 0.3, textTransform: 'uppercase',
      }}>{label}</span>
      {loading ? (
        <>
          <div style={{
            height: 26, width: '60%', borderRadius: 6, marginTop: 2,
            background: C.surface3, animation: 'pulse 1.4s ease-in-out infinite',
          }} />
          <div style={{
            height: 11, width: '70%', borderRadius: 4,
            background: C.surface3, animation: 'pulse 1.4s ease-in-out infinite', animationDelay: '0.1s',
          }} />
        </>
      ) : (
        <>
          <span style={{
            fontFamily: '"Bricolage Grotesque", system-ui',
            fontSize: 26, fontWeight: 800, color: C.text, letterSpacing: -0.8, lineHeight: 1,
            fontVariantNumeric: 'tabular-nums',
          }}>{value}</span>
          {sub && (
            <span style={{
              fontFamily: '"DM Sans", system-ui',
              fontSize: 11.5, color: C.textSoft, marginTop: 2,
            }}>{sub}</span>
          )}
        </>
      )}
    </div>
  )
}

function EmptyPayments() {
  return (
    <div style={{
      background: '#fff', borderRadius: 16, padding: '52px 24px',
      textAlign: 'center', border: `1px solid ${C.line}`,
    }}>
      <svg width={44} height={44} viewBox="0 0 44 44" fill="none" style={{ margin: '0 auto 14px', display: 'block', opacity: 0.3 }}>
        <rect x="5" y="8" width="34" height="28" rx="4" stroke={C.navy} strokeWidth={2} />
        <path d="M5 18h34" stroke={C.navy} strokeWidth={2} />
        <circle cx="22" cy="30" r="5" stroke={C.navy} strokeWidth={2} />
        <path d="M22 27v3l2 1" stroke={C.navy} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <p style={{
        fontFamily: '"Bricolage Grotesque", system-ui',
        fontSize: 17, fontWeight: 700, color: C.text, margin: '0 0 5px',
      }}>
        Nenhum pagamento ainda
      </p>
      <p style={{
        fontFamily: '"DM Sans", system-ui',
        fontSize: 13.5, color: C.textMute, margin: 0, lineHeight: 1.5,
      }}>
        O histórico de transações aparece aqui após o primeiro turno concluído.
      </p>
    </div>
  )
}

function SkeletonRow() {
  return (
    <div style={{
      background: '#fff', borderRadius: 14, padding: '16px 20px',
      border: `1px solid ${C.line}`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 10 }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
          <div style={{ height: 17, width: '28%', borderRadius: 5, background: C.surface3, animation: 'pulse 1.4s ease-in-out infinite' }} />
          <div style={{ height: 13, width: '45%', borderRadius: 4, background: C.surface3, animation: 'pulse 1.4s ease-in-out infinite', animationDelay: '0.1s' }} />
        </div>
        <div style={{ height: 22, width: 90, borderRadius: 5, background: C.surface3, animation: 'pulse 1.4s ease-in-out infinite', animationDelay: '0.15s' }} />
      </div>
      <div style={{ height: 1, background: C.surface3, margin: '8px 0' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ height: 12, width: '35%', borderRadius: 4, background: C.surface3, animation: 'pulse 1.4s ease-in-out infinite', animationDelay: '0.2s' }} />
        <div style={{ height: 12, width: '28%', borderRadius: 4, background: C.surface3, animation: 'pulse 1.4s ease-in-out infinite', animationDelay: '0.25s' }} />
      </div>
    </div>
  )
}

export default function BusinessHistoryPage() {
  const { data: payments, isLoading } = useQuery({
    queryKey: ['business-payments'],
    queryFn: () => api.get<Payment[]>('/businesses/me/payments'),
  })

  const totalSpent = (payments ?? [])
    .filter(p => ['CONFIRMED', 'RELEASED'].includes(p.status))
    .reduce((acc, p) => acc + Number(p.gross_amount), 0)

  const totalFee = (payments ?? [])
    .filter(p => ['CONFIRMED', 'RELEASED'].includes(p.status))
    .reduce((acc, p) => acc + Number(p.laboro_fee), 0)

  const workerTotal = (payments ?? [])
    .filter(p => p.status === 'RELEASED')
    .reduce((acc, p) => acc + Number(p.worker_amount), 0)

  return (
    <div style={{ background: C.surface2, minHeight: '100vh', padding: '32px 40px 60px' }}>

      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{
          fontFamily: '"Bricolage Grotesque", system-ui',
          fontSize: 24, fontWeight: 800, color: C.text, letterSpacing: -0.7, margin: 0,
        }}>
          Financeiro
        </h1>
        <p style={{
          fontFamily: '"DM Sans", system-ui',
          fontSize: 13.5, color: C.textMute, margin: '4px 0 0',
        }}>
          Histórico de transações e pagamentos via escrow
        </p>
      </div>

      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 32 }}>
        <MetricCard
          loading={isLoading}
          label="Total investido"
          value={formatCurrency(totalSpent)}
          sub="turnos pagos e em escrow"
        />
        <MetricCard
          loading={isLoading}
          label="Repassado aos trabalhadores"
          value={formatCurrency(workerTotal)}
          sub="turnos liberados"
        />
        <MetricCard
          loading={isLoading}
          label="Taxa Laboro · 18%"
          value={formatCurrency(totalFee)}
          sub="comissão cobrada"
        />
      </div>

      {/* Payments list */}
      <div>
        <h2 style={{
          fontFamily: '"Bricolage Grotesque", system-ui',
          fontSize: 17, fontWeight: 700, color: C.text, letterSpacing: -0.4,
          margin: '0 0 14px',
        }}>
          Histórico de pagamentos
          {(payments?.length ?? 0) > 0 && (
            <span style={{
              fontFamily: '"DM Sans", system-ui',
              fontSize: 13, fontWeight: 500, color: C.textSoft, marginLeft: 8,
            }}>
              {payments!.length} {payments!.length === 1 ? 'transação' : 'transações'}
            </span>
          )}
        </h2>

        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[1, 2, 3].map(i => <SkeletonRow key={i} />)}
          </div>
        ) : !payments?.length ? (
          <EmptyPayments />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {payments.map(p => {
              const st = STATUS_MAP[p.status] ?? { label: p.status, fg: C.textMute, bg: C.surface3, dot: '#9AA0B7' }
              return (
                <div key={p.id} style={{
                  background: '#fff', borderRadius: 14, padding: '14px 20px',
                  border: `1px solid ${C.line}`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 10 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontFamily: '"Bricolage Grotesque", system-ui',
                        fontSize: 16, fontWeight: 700, color: C.text, letterSpacing: -0.3,
                        margin: '0 0 3px',
                      }}>
                        {specialtyLabel(p.shift.specialty)}
                      </p>
                      <p style={{ fontFamily: '"DM Sans", system-ui', fontSize: 13, color: C.textMute, margin: '0 0 2px' }}>
                        {p.worker.user.full_name}
                      </p>
                      <p style={{ fontFamily: '"DM Sans", system-ui', fontSize: 12, color: C.textSoft, margin: 0 }}>
                        {formatDate(p.shift.starts_at)}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{
                        fontFamily: '"Bricolage Grotesque", system-ui',
                        fontSize: 19, fontWeight: 800, color: C.text, letterSpacing: -0.5,
                        fontVariantNumeric: 'tabular-nums',
                      }}>
                        {formatCurrency(p.gross_amount)}
                      </div>
                      <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 5,
                        background: st.bg, color: st.fg,
                        padding: '2px 8px', borderRadius: 999,
                        fontFamily: '"DM Sans", system-ui', fontSize: 11, fontWeight: 700,
                      }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: st.dot, flexShrink: 0, display: 'inline-block' }} />
                        {st.label}
                      </div>
                    </div>
                  </div>

                  <div style={{
                    borderTop: `1px solid ${C.lineSoft}`, paddingTop: 10,
                    display: 'flex', justifyContent: 'space-between',
                    fontFamily: '"DM Sans", system-ui', fontSize: 12, color: C.textSoft,
                  }}>
                    <span>
                      Taxa Laboro{' '}
                      <strong style={{ color: C.textMute, fontWeight: 600 }}>{formatCurrency(p.laboro_fee)}</strong>
                    </span>
                    <span>
                      Trabalhador{' '}
                      <strong style={{ color: C.textMute, fontWeight: 600 }}>{formatCurrency(p.worker_amount)}</strong>
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  )
}
