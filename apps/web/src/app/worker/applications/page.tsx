'use client'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { api } from '@/lib/api'
import { formatCurrency, formatDateTime, formatTime, specialtyLabel } from '@/lib/format'

const C = {
  navy: '#0E2A78',
  jade: '#00C48C', jadeDeep: '#00A372', jadeInk: '#0A2A1E',
  orange: '#FF6B35',
  text: '#1A1A2E', textMute: '#5C6079', textSoft: '#8A8FA6',
  line: '#E6E8F0', lineSoft: '#EFF1F7', surface: '#FFFFFF', surface2: '#F8F9FC', surface3: '#F1F3F9',
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

const STATUS: Record<string, { bg: string; fg: string; dot: string; label: string }> = {
  PENDING:   { bg: '#FFF7E6', fg: '#92400E', dot: '#F59E0B', label: 'Aguardando' },
  CONFIRMED: { bg: '#E6FAF3', fg: '#00805B', dot: C.jade,   label: 'Confirmado'  },
  CANCELLED: { bg: '#FEE2E2', fg: '#991B1B', dot: '#EF4444', label: 'Cancelado'  },
  NO_SHOW:   { bg: '#FFF1E9', fg: '#C2511A', dot: C.orange, label: 'No-show'     },
  COMPLETED: { bg: C.surface3, fg: C.textMute, dot: '#9AA0B7', label: 'Concluído' },
}

function SkeletonRow() {
  return (
    <div style={{ background: C.surface, borderRadius: 14, padding: '16px 20px', border: `1px solid ${C.line}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ height: 18, width: '35%', borderRadius: 5, background: C.surface3, animation: 'pulse 1.4s ease-in-out infinite' }} />
          <div style={{ height: 18, width: '18%', borderRadius: 999, background: C.surface3, animation: 'pulse 1.4s ease-in-out infinite', animationDelay: '0.05s' }} />
        </div>
        <div style={{ height: 13, width: '45%', borderRadius: 4, background: C.surface3, animation: 'pulse 1.4s ease-in-out infinite', animationDelay: '0.1s' }} />
        <div style={{ height: 11, width: '55%', borderRadius: 4, background: C.surface3, animation: 'pulse 1.4s ease-in-out infinite', animationDelay: '0.15s' }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
        <div style={{ height: 20, width: 72, borderRadius: 5, background: C.surface3, animation: 'pulse 1.4s ease-in-out infinite', animationDelay: '0.2s' }} />
        <div style={{ height: 12, width: 44, borderRadius: 4, background: C.surface3, animation: 'pulse 1.4s ease-in-out infinite', animationDelay: '0.25s' }} />
      </div>
    </div>
  )
}

export default function WorkerApplicationsPage() {
  const { data: applications, isLoading } = useQuery({
    queryKey: ['my-applications'],
    queryFn: () => api.get<Application[]>('/workers/me/applications'),
    placeholderData: (prev) => prev,
  })

  const total = applications?.length ?? 0
  const confirmed = applications?.filter(a => a.status === 'CONFIRMED').length ?? 0
  const pending   = applications?.filter(a => a.status === 'PENDING').length   ?? 0

  return (
    <div style={{ background: C.surface2, minHeight: '100vh', padding: '32px 40px 60px' }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 26, fontWeight: 800, color: C.text, letterSpacing: -0.8, margin: '0 0 5px' }}>
          Meus turnos
        </h1>
        <p style={{ fontFamily: '"DM Sans", system-ui', fontSize: 13.5, color: C.textSoft, margin: 0 }}>
          Candidaturas e turnos confirmados
        </p>
      </div>

      {/* Section header */}
      {total > 0 && (
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
          <h2 style={{ fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 17, fontWeight: 700, color: C.text, letterSpacing: -0.3, margin: 0 }}>
            Candidaturas
          </h2>
          <span style={{ fontFamily: '"DM Sans", system-ui', fontSize: 13, color: C.textSoft }}>
            {confirmed > 0 && <span style={{ color: C.jadeDeep, fontWeight: 600 }}>{confirmed} confirmado{confirmed > 1 ? 's' : ''} · </span>}
            {total} no total
          </span>
        </div>
      )}

      {/* Pending banner */}
      {pending > 0 && (
        <div style={{
          background: '#FFFBF0', border: `1px solid #F59E0B`, borderRadius: 12,
          padding: '10px 14px', marginBottom: 16,
          display: 'flex', alignItems: 'center', gap: 8,
          fontFamily: '"DM Sans", system-ui', fontSize: 13, color: '#92400E',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#F59E0B" strokeWidth="2"/><path d="M12 8v4M12 16v.5" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"/></svg>
          {pending} candidatura{pending > 1 ? 's' : ''} aguardando confirmação da empresa
        </div>
      )}

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1, 2, 3].map(i => <SkeletonRow key={i} />)}
        </div>
      ) : !applications?.length ? (
        <div style={{
          background: C.surface, borderRadius: 16, padding: '52px 24px',
          textAlign: 'center', border: `1px solid ${C.line}`,
        }}>
          <p style={{ fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 17, fontWeight: 700, color: C.text, margin: '0 0 5px' }}>
            Nenhuma candidatura ainda
          </p>
          <p style={{ fontFamily: '"DM Sans", system-ui', fontSize: 13.5, color: C.textMute, margin: '0 0 20px', lineHeight: 1.5 }}>
            Candidate-se a vagas disponíveis para vê-las aqui
          </p>
          <Link href="/worker" style={{
            display: 'inline-block', background: C.jade, color: C.jadeInk,
            borderRadius: 10, padding: '10px 18px',
            fontFamily: '"DM Sans", system-ui', fontSize: 13.5, fontWeight: 700,
            textDecoration: 'none',
          }}>
            Ver vagas
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {applications.map((app) => {
            const st = STATUS[app.status] ?? STATUS.PENDING
            const hours = (new Date(app.shift.ends_at).getTime() - new Date(app.shift.starts_at).getTime()) / 3600000
            return (
              <div key={app.id} style={{
                background: C.surface, borderRadius: 14, padding: '16px 20px',
                border: `1px solid ${C.line}`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
                transition: 'border-color 100ms',
              }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#C7CBDA')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = C.line)}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 17, fontWeight: 700, color: C.text, letterSpacing: -0.3 }}>
                      {specialtyLabel(app.shift.specialty)}
                    </span>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      background: st.bg, color: st.fg,
                      padding: '2px 8px', borderRadius: 999,
                      fontFamily: '"DM Sans", system-ui', fontSize: 11, fontWeight: 700, letterSpacing: 0.2,
                    }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: st.dot, display: 'inline-block', flexShrink: 0 }} />
                      {st.label}
                    </span>
                  </div>
                  <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 13, color: C.textMute, fontWeight: 500 }}>
                    {app.shift.business.trade_name}
                  </div>
                  <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 12, color: C.textSoft, marginTop: 2 }}>
                    {formatDateTime(app.shift.starts_at)} até {formatTime(app.shift.ends_at)} · {hours.toFixed(1)}h
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 19, fontWeight: 800, color: C.jadeDeep, letterSpacing: -0.5, fontVariantNumeric: 'tabular-nums' }}>
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

      <style>{`@keyframes pulse { 0%, 100% { opacity: 0.6; } 50% { opacity: 0.3; } }`}</style>
    </div>
  )
}
