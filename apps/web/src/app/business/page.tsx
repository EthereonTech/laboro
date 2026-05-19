'use client'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { api } from '@/lib/api'
import { formatCurrency, specialtyLabel, formatDateTime } from '@/lib/format'

const C = {
  navy: '#0E2A78', jade: '#00C48C', jadeDeep: '#00A372', jadeInk: '#0A2A1E',
  orange: '#FF6B35', orangeSoft: '#FFEEE6', text: '#1A1A2E', textMute: '#5C6079', textSoft: '#8A8FA6',
  line: '#E6E8F0', lineSoft: '#EFF1F7', surface2: '#F8F9FC', surface3: '#F1F3F9',
}

type Dashboard = {
  active_shifts: number
  monthly_spent: number
  pending_applications: number
  completed_shifts: number
  recent_shifts: {
    id: string
    specialty: string
    starts_at: string
    status: string
    slots: number
    total_value: number
    applications_count?: number
  }[]
}

const SHIFT_STATUS: Record<string, { bg: string; fg: string; dot: string; label: string }> = {
  OPEN:        { bg: '#FFF1E9', fg: '#C2511A', dot: C.orange, label: 'Aberta' },
  FILLED:      { bg: '#E8F3FF', fg: '#1B3FA0', dot: C.navy,  label: 'Preenchida' },
  IN_PROGRESS: { bg: '#E6FAF3', fg: '#00805B', dot: C.jade,  label: 'Em andamento' },
  DONE:        { bg: C.surface3, fg: C.textMute, dot: '#9AA0B7', label: 'Concluída' },
  CANCELLED:   { bg: '#FEE2E2', fg: '#991B1B', dot: '#EF4444', label: 'Cancelada' },
}

export default function BusinessDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['business-dashboard'],
    queryFn: () => api.get<Dashboard>('/businesses/me/dashboard'),
  })
  const { data: businessProfile } = useQuery({
    queryKey: ['business-profile'],
    queryFn: () => api.get<any>('/businesses/me'),
  })

  const tradeName = businessProfile?.data?.trade_name ?? 'Empresa'
  const firstLetter = tradeName[0] ?? 'E'

  return (
    <div style={{ background: C.surface2, minHeight: '100vh' }}>
      {/* navy header */}
      <div style={{
        background: C.navy, color: '#fff',
        padding: '40px 32px 68px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -100, right: -60, width: 280, height: 280, borderRadius: '50%',
          background: 'radial-gradient(closest-side, rgba(0,196,140,0.20), transparent 70%)',
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: C.orange, color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: '"Bricolage Grotesque", system-ui', fontWeight: 700, fontSize: 18,
                boxShadow: '0 4px 14px rgba(255,107,53,0.4)', flexShrink: 0,
              }}>
                {firstLetter}
              </div>
              <div>
                <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 11.5, fontWeight: 600, color: 'rgba(255,255,255,0.55)', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                  Painel da empresa
                </div>
                <div style={{ fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 18, fontWeight: 700, letterSpacing: -0.4, marginTop: 1 }}>
                  {tradeName}
                </div>
              </div>
            </div>
            <Link href="/business/shifts/create" style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: C.jade, color: C.jadeInk,
              borderRadius: 12, padding: '10px 16px', textDecoration: 'none',
              fontFamily: '"DM Sans", system-ui', fontSize: 13.5, fontWeight: 700,
              boxShadow: '0 6px 14px rgba(0,196,140,0.30)',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14M5 12h14" stroke={C.jadeInk} strokeWidth="2.4" strokeLinecap="round"/>
              </svg>
              Postar vaga
            </Link>
          </div>

          {/* KPI grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            {[
              { value: data?.active_shifts ?? 0, label: 'vagas abertas', tint: '#FFB89A' },
              { value: data?.pending_applications ?? 0, label: 'candidatos', sublabel: 'aguardando', tint: '#7FE6C5' },
              { value: data?.completed_shifts ?? 0, label: 'concluídos', tint: '#fff' },
            ].map(kpi => (
              <div key={kpi.label} style={{
                background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.10)',
                borderRadius: 14, padding: 12,
              }}>
                <div style={{ fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 26, fontWeight: 800, color: kpi.tint, letterSpacing: -0.8, lineHeight: 1 }}>
                  {kpi.value}
                </div>
                <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 11.5, fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginTop: 6 }}>
                  {kpi.label}
                </div>
                {kpi.sublabel && (
                  <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 10.5, color: 'rgba(255,255,255,0.5)', marginTop: 1 }}>
                    {kpi.sublabel}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{
        marginTop: -32, background: C.surface2,
        borderTopLeftRadius: 28, borderTopRightRadius: 28,
        padding: '24px 32px 40px', minHeight: 'calc(100vh - 260px)',
      }}>
        {/* monthly spend */}
        {(data?.monthly_spent ?? 0) > 0 && (
          <div style={{
            background: '#fff', borderRadius: 16, padding: '14px 20px',
            border: `1px solid ${C.line}`, marginBottom: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 11.5, fontWeight: 700, color: C.textSoft, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                Gasto mensal
              </div>
              <div style={{ fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 22, fontWeight: 800, color: C.navy, letterSpacing: -0.5 }}>
                {formatCurrency(data?.monthly_spent ?? 0)}
              </div>
            </div>
            <Link href="/business/history" style={{
              fontFamily: '"DM Sans", system-ui', fontSize: 13, fontWeight: 600, color: C.navy, textDecoration: 'none',
            }}>
              Ver histórico →
            </Link>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 20, fontWeight: 700, color: C.text, letterSpacing: -0.5 }}>
            Vagas recentes
          </div>
          <Link href="/business/shifts" style={{ fontFamily: '"DM Sans", system-ui', fontSize: 13, fontWeight: 600, color: C.navy, textDecoration: 'none' }}>
            Ver todas
          </Link>
        </div>

        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              border: `3px solid ${C.jade}`, borderTopColor: 'transparent',
              animation: 'spin 0.8s linear infinite',
            }} />
          </div>
        ) : !data?.recent_shifts?.length ? (
          <div style={{
            background: '#fff', borderRadius: 20, padding: '48px 24px',
            textAlign: 'center', border: `1px solid ${C.line}`,
          }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
            <div style={{ fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 6 }}>
              Nenhuma vaga publicada ainda
            </div>
            <Link href="/business/shifts/create" style={{
              display: 'inline-block', background: C.jade, color: C.jadeInk,
              borderRadius: 12, padding: '11px 20px', textDecoration: 'none',
              fontFamily: '"DM Sans", system-ui', fontSize: 14, fontWeight: 700,
              boxShadow: '0 6px 14px rgba(0,196,140,0.25)',
            }}>
              Publicar primeira vaga
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {data.recent_shifts.map(shift => {
              const st = SHIFT_STATUS[shift.status] ?? SHIFT_STATUS.OPEN
              return (
                <Link key={shift.id} href={`/business/shifts/${shift.id}`} style={{ textDecoration: 'none' }}>
                  <div style={{
                    background: '#fff', borderRadius: 18, padding: '16px 20px',
                    border: `1px solid ${C.line}`,
                    boxShadow: '0 2px 4px rgba(14,42,120,0.03), 0 8px 20px rgba(14,42,120,0.04)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
                    cursor: 'pointer', transition: 'all 120ms',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 8px rgba(14,42,120,0.05), 0 16px 32px rgba(14,42,120,0.08)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 4px rgba(14,42,120,0.03), 0 8px 20px rgba(14,42,120,0.04)' }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                        <div style={{ fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 18, fontWeight: 700, color: C.text, letterSpacing: -0.4 }}>
                          {specialtyLabel(shift.specialty)}
                        </div>
                        <div style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                          background: st.bg, color: st.fg,
                          padding: '3px 9px', borderRadius: 999,
                          fontFamily: '"DM Sans", system-ui', fontSize: 11, fontWeight: 700,
                        }}>
                          <span style={{ width: 5, height: 5, borderRadius: '50%', background: st.dot, display: 'inline-block' }} />
                          {st.label}
                        </div>
                      </div>
                      <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 12.5, color: C.textMute }}>
                        {formatDateTime(shift.starts_at)} · {shift.slots} vaga{shift.slots !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 20, fontWeight: 800, color: C.navy, letterSpacing: -0.5 }}>
                        {formatCurrency(shift.total_value)}
                      </div>
                      <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 11, color: C.textSoft, marginTop: 2 }}>
                        em escrow
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
