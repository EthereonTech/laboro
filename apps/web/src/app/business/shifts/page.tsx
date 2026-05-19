'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
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

type Shift = {
  id: string
  specialty: string
  starts_at: string
  ends_at: string
  rate_per_hour: number
  total_value: number
  slots: number
  is_urgent: boolean
  status: string
}

const TABS = [
  { id: 'all', label: 'Todas' },
  { id: 'OPEN', label: 'Abertas' },
  { id: 'IN_PROGRESS', label: 'Em andamento' },
  { id: 'FILLED', label: 'Preenchidas' },
  { id: 'DONE', label: 'Concluídas' },
]

export default function BusinessShiftsPage() {
  const [tab, setTab] = useState('all')
  const { data: shifts, isLoading } = useQuery({
    queryKey: ['my-shifts'],
    queryFn: () => api.get<Shift[]>('/shifts/mine'),
  })

  const filtered = tab === 'all' ? (shifts ?? []) : (shifts ?? []).filter(s => s.status === tab)

  return (
    <div style={{ background: C.surface2, minHeight: '100vh' }}>
      {/* nav header */}
      <div style={{ padding: '32px 32px 24px', background: '#fff', borderBottom: `1px solid ${C.lineSoft}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 26, fontWeight: 700, color: C.text, letterSpacing: -0.7 }}>
            Vagas
          </div>
          <Link href="/business/shifts/create" style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: C.jade, color: C.jadeInk,
            borderRadius: 12, padding: '10px 16px', textDecoration: 'none',
            fontFamily: '"DM Sans", system-ui', fontSize: 13.5, fontWeight: 700,
            boxShadow: '0 6px 14px rgba(0,196,140,0.25)',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke={C.jadeInk} strokeWidth="2.4" strokeLinecap="round"/>
            </svg>
            Postar vaga
          </Link>
        </div>

        {/* tabs */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {TABS.map(t => {
            const count = t.id === 'all' ? (shifts?.length ?? 0) : (shifts ?? []).filter(s => s.status === t.id).length
            const isActive = t.id === tab
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  appearance: 'none', cursor: 'pointer',
                  background: isActive ? C.navy : '#fff',
                  color: isActive ? '#fff' : C.text,
                  border: `1px solid ${isActive ? C.navy : C.line}`,
                  borderRadius: 999, padding: '7px 13px',
                  fontFamily: '"DM Sans", system-ui', fontSize: 13, fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: 6,
                  transition: 'all 120ms',
                }}
              >
                {t.label}
                <span style={{
                  background: isActive ? 'rgba(255,255,255,0.2)' : C.surface3,
                  color: isActive ? '#fff' : C.textMute,
                  padding: '1px 6px', borderRadius: 999,
                  fontSize: 11, fontWeight: 700,
                }}>{count}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div style={{ padding: '24px 32px 40px' }}>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', border: `3px solid ${C.jade}`, borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : !filtered.length ? (
          <div style={{
            background: '#fff', borderRadius: 20, padding: '48px 24px',
            textAlign: 'center', border: `1px solid ${C.line}`,
          }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
            <div style={{ fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 6 }}>
              {tab === 'all' ? 'Nenhuma vaga publicada ainda' : 'Nenhuma vaga nesta categoria'}
            </div>
            {tab === 'all' && (
              <Link href="/business/shifts/create" style={{
                display: 'inline-block', background: C.jade, color: C.jadeInk,
                borderRadius: 12, padding: '11px 20px', textDecoration: 'none',
                fontFamily: '"DM Sans", system-ui', fontSize: 14, fontWeight: 700,
                boxShadow: '0 6px 14px rgba(0,196,140,0.25)',
              }}>
                Publicar primeira vaga
              </Link>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map(shift => {
              const st = SHIFT_STATUS[shift.status] ?? SHIFT_STATUS.OPEN
              const hours = (new Date(shift.ends_at).getTime() - new Date(shift.starts_at).getTime()) / 3600000
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
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
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
                        {shift.is_urgent && (
                          <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            background: C.orange, color: '#fff',
                            padding: '3px 8px', borderRadius: 999,
                            fontFamily: '"DM Sans", system-ui', fontSize: 10.5, fontWeight: 700,
                            textTransform: 'uppercase', letterSpacing: 0.3,
                          }}>
                            Urgente
                          </div>
                        )}
                      </div>
                      <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 12.5, color: C.textMute }}>
                        {formatDateTime(shift.starts_at)} até {formatTime(shift.ends_at)} · {hours.toFixed(1)}h · {shift.slots} vaga{shift.slots !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 20, fontWeight: 800, color: C.navy, letterSpacing: -0.5 }}>
                        {formatCurrency(shift.total_value)}
                      </div>
                      <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 11.5, color: C.textSoft, marginTop: 2 }}>
                        {formatCurrency(shift.rate_per_hour)}/h
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
