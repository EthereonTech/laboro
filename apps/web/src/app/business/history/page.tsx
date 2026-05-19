'use client'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { formatCurrency, formatDate, specialtyLabel } from '@/lib/format'

const C = {
  navy: '#0E2A78', jade: '#00C48C', jadeDeep: '#00A372',
  orange: '#FF6B35', text: '#1A1A2E', textMute: '#5C6079', textSoft: '#8A8FA6',
  line: '#E6E8F0', surface2: '#F8F9FC', surface3: '#F1F3F9',
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
  RESERVED:  { label: 'Aguardando Pix',   fg: '#92400E', bg: '#FFF7E6', dot: '#F59E0B' },
  CONFIRMED: { label: 'Pago — em escrow', fg: '#1B3FA0', bg: '#E8F3FF', dot: C.navy },
  RELEASED:  { label: 'Liberado',         fg: '#00805B', bg: '#E6FAF3', dot: C.jade },
  REFUNDED:  { label: 'Estornado',        fg: '#991B1B', bg: '#FEE2E2', dot: '#EF4444' },
  FAILED:    { label: 'Falhou',           fg: '#991B1B', bg: '#FEE2E2', dot: '#EF4444' },
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

  return (
    <div style={{ background: C.surface2, minHeight: '100vh' }}>
      {/* navy header */}
      <div style={{
        background: C.navy, color: '#fff',
        padding: '40px 32px 72px',
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
          <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.55)', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 6 }}>
            Empresa
          </div>
          <div style={{ fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 28, fontWeight: 700, letterSpacing: -0.8, marginBottom: 20 }}>
            Financeiro
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.10)',
            borderRadius: 18, padding: 16,
            backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 11.5, fontWeight: 600, color: 'rgba(255,255,255,0.55)', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 6 }}>
                  Total investido
                </div>
                <div style={{ fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 28, fontWeight: 800, color: '#FFB89A', letterSpacing: -0.8, lineHeight: 1 }}>
                  {formatCurrency(totalSpent)}
                </div>
              </div>
              <div>
                <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 11.5, fontWeight: 600, color: 'rgba(255,255,255,0.55)', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 6 }}>
                  Taxa Laboro
                </div>
                <div style={{ fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 28, fontWeight: 800, color: 'rgba(255,255,255,0.5)', letterSpacing: -0.8, lineHeight: 1 }}>
                  {formatCurrency(totalFee)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{
        marginTop: -32, background: C.surface2,
        borderTopLeftRadius: 28, borderTopRightRadius: 28,
        padding: '24px 32px 40px', minHeight: 'calc(100vh - 260px)',
      }}>
        <div style={{ fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 20, fontWeight: 700, color: C.text, letterSpacing: -0.5, marginBottom: 16 }}>
          Histórico de pagamentos
        </div>

        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', border: `3px solid ${C.jade}`, borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : !payments?.length ? (
          <div style={{ background: '#fff', borderRadius: 20, padding: '48px 24px', textAlign: 'center', border: `1px solid ${C.line}` }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>💰</div>
            <div style={{ fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 18, fontWeight: 700, color: C.text }}>
              Nenhum pagamento ainda
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {payments.map(p => {
              const st = STATUS_MAP[p.status] ?? { label: p.status, fg: C.textMute, bg: C.surface3, dot: '#9AA0B7' }
              return (
                <div key={p.id} style={{
                  background: '#fff', borderRadius: 18, padding: '16px 20px',
                  border: `1px solid ${C.line}`,
                  boxShadow: '0 2px 4px rgba(14,42,120,0.03), 0 8px 20px rgba(14,42,120,0.04)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 17, fontWeight: 700, color: C.text, letterSpacing: -0.3, marginBottom: 3 }}>
                        {specialtyLabel(p.shift.specialty)}
                      </div>
                      <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 13, color: C.textMute }}>
                        {p.worker.user.full_name}
                      </div>
                      <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 12, color: C.textSoft, marginTop: 2 }}>
                        {formatDate(p.shift.starts_at)}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 20, fontWeight: 800, color: C.text, letterSpacing: -0.5 }}>
                        {formatCurrency(p.gross_amount)}
                      </div>
                      <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 4,
                        background: st.bg, color: st.fg,
                        padding: '3px 9px', borderRadius: 999,
                        fontFamily: '"DM Sans", system-ui', fontSize: 10.5, fontWeight: 700,
                      }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: st.dot, display: 'inline-block' }} />
                        {st.label}
                      </div>
                    </div>
                  </div>
                  <div style={{
                    borderTop: `1px solid ${C.surface3}`, paddingTop: 10,
                    display: 'grid', gridTemplateColumns: '1fr 1fr',
                    fontFamily: '"DM Sans", system-ui', fontSize: 12, color: C.textSoft,
                  }}>
                    <span>Taxa Laboro: <strong style={{ color: C.textMute }}>{formatCurrency(p.laboro_fee)}</strong></span>
                    <span style={{ textAlign: 'right' }}>Trabalhador: <strong style={{ color: C.textMute }}>{formatCurrency(p.worker_amount)}</strong></span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
