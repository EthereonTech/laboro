'use client'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { api } from '@/lib/api'
import { formatCurrency, formatDateTime, formatTime, specialtyLabel } from '@/lib/format'

const C = {
  navy: '#0E2A78', jade: '#00C48C', jadeDeep: '#00A372', jadeInk: '#0A2A1E',
  orange: '#FF6B35', text: '#1A1A2E', textMute: '#5C6079', textSoft: '#8A8FA6',
  line: '#E6E8F0', lineSoft: '#EFF1F7', surface2: '#F8F9FC', surface3: '#F1F3F9',
}

type Application = {
  id: string
  status: string
  shift: {
    id: string
    specialty: string
    starts_at: string
    ends_at: string
    rate_per_hour: number
    total_value: number
    business: { trade_name: string }
  }
}

const STATUS_STYLE: Record<string, { bg: string; fg: string; dot: string; label: string }> = {
  PENDING:   { bg: '#FFF7E6', fg: '#92400E', dot: '#F59E0B', label: 'Aguardando' },
  CONFIRMED: { bg: '#E6FAF3', fg: '#00805B', dot: C.jade,   label: 'Confirmado' },
  CANCELLED: { bg: '#FEE2E2', fg: '#991B1B', dot: '#EF4444', label: 'Cancelado' },
  NO_SHOW:   { bg: '#FFF1E9', fg: '#C2511A', dot: C.orange, label: 'No-show' },
  COMPLETED: { bg: C.surface3, fg: C.textMute, dot: '#9AA0B7', label: 'Concluído' },
}

export default function WorkerApplicationsPage() {
  const { data: applications, isLoading } = useQuery({
    queryKey: ['my-applications'],
    queryFn: () => api.get<Application[]>('/workers/me/applications'),
  })

  return (
    <div style={{ background: C.surface2, minHeight: '100vh' }}>
      {/* navy header */}
      <div style={{
        background: C.navy, color: '#fff',
        padding: '40px 32px 64px',
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
            Área do trabalhador
          </div>
          <div style={{ fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 28, fontWeight: 700, letterSpacing: -0.8 }}>
            Meus turnos
          </div>
        </div>
      </div>

      <div style={{
        marginTop: -32, background: C.surface2,
        borderTopLeftRadius: 28, borderTopRightRadius: 28,
        padding: '24px 32px 40px', minHeight: 'calc(100vh - 180px)',
      }}>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              border: `3px solid ${C.jade}`, borderTopColor: 'transparent',
              animation: 'spin 0.8s linear infinite',
            }} />
          </div>
        ) : !applications?.length ? (
          <div style={{
            background: '#fff', borderRadius: 20, padding: '48px 24px',
            textAlign: 'center', border: `1px solid ${C.line}`,
          }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
            <div style={{ fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 6 }}>
              Nenhuma candidatura ainda
            </div>
            <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 14, color: C.textMute, marginBottom: 20 }}>
              Candidate-se a vagas disponíveis para vê-las aqui
            </div>
            <Link href="/worker" style={{
              display: 'inline-block', background: C.jade, color: C.jadeInk,
              borderRadius: 12, padding: '11px 20px',
              fontFamily: '"DM Sans", system-ui', fontSize: 14, fontWeight: 700,
              textDecoration: 'none', boxShadow: '0 6px 14px rgba(0,196,140,0.25)',
            }}>
              Ver vagas
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {applications.map((app) => {
              const st = STATUS_STYLE[app.status] ?? STATUS_STYLE.PENDING
              const hours = (new Date(app.shift.ends_at).getTime() - new Date(app.shift.starts_at).getTime()) / 3600000
              return (
                <div key={app.id} style={{
                  background: '#fff', borderRadius: 18, padding: '16px 20px',
                  border: `1px solid ${C.line}`,
                  boxShadow: '0 2px 4px rgba(14,42,120,0.03), 0 8px 20px rgba(14,42,120,0.04)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <div style={{
                        fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 18, fontWeight: 700,
                        color: C.text, letterSpacing: -0.4,
                      }}>
                        {specialtyLabel(app.shift.specialty)}
                      </div>
                      <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        background: st.bg, color: st.fg,
                        padding: '3px 9px', borderRadius: 999,
                        fontFamily: '"DM Sans", system-ui', fontSize: 11, fontWeight: 700,
                        letterSpacing: 0.3,
                      }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: st.dot, display: 'inline-block' }} />
                        {st.label}
                      </div>
                    </div>
                    <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 13, color: C.textMute, fontWeight: 500 }}>
                      {app.shift.business.trade_name}
                    </div>
                    <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 12, color: C.textSoft, marginTop: 3 }}>
                      {formatDateTime(app.shift.starts_at)} até {formatTime(app.shift.ends_at)} · {hours.toFixed(1)}h
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{
                      fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 20, fontWeight: 800,
                      color: C.jadeDeep, letterSpacing: -0.5,
                    }}>
                      {formatCurrency(app.shift.total_value)}
                    </div>
                    <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 11.5, color: C.textSoft, marginTop: 2 }}>
                      {formatCurrency(app.shift.rate_per_hour)}/h
                    </div>
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
