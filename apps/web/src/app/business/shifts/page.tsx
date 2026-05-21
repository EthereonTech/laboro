'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { api } from '@/lib/api'
import { formatCurrency, formatDateTime, formatTime, specialtyLabel } from '@/lib/format'

const C = {
  navy: '#0E2A78', navyLight: '#1B3FA0',
  jade: '#00C48C', jadeInk: '#0A2A1E',
  orange: '#FF6B35',
  text: '#1A1A2E', textMute: '#5C6079', textSoft: '#8A8FA6',
  line: '#E6E8F0', lineSoft: '#EFF1F7', surface2: '#F8F9FC', surface3: '#F1F3F9',
}

const STATUS: Record<string, { bg: string; fg: string; dot: string; label: string }> = {
  OPEN:        { bg: '#FFF1E9', fg: '#C2511A', dot: C.orange,    label: 'Aberta' },
  FILLED:      { bg: '#E8F3FF', fg: '#1B3FA0', dot: C.navy,      label: 'Preenchida' },
  IN_PROGRESS: { bg: '#E6FAF3', fg: '#00805B', dot: C.jade,      label: 'Em andamento' },
  DONE:        { bg: C.surface3, fg: C.textMute, dot: '#9AA0B7', label: 'Concluída' },
  CANCELLED:   { bg: '#FEE2E2', fg: '#991B1B', dot: '#EF4444',   label: 'Cancelada' },
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
  { id: 'all',         label: 'Todas' },
  { id: 'OPEN',        label: 'Abertas' },
  { id: 'IN_PROGRESS', label: 'Em andamento' },
  { id: 'FILLED',      label: 'Preenchidas' },
  { id: 'DONE',        label: 'Concluídas' },
]

function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 16, padding: '52px 24px',
      textAlign: 'center', border: `1px solid ${C.line}`,
    }}>
      <svg width={44} height={44} viewBox="0 0 44 44" fill="none" style={{ margin: '0 auto 14px', display: 'block', opacity: 0.3 }}>
        <rect x="5" y="9" width="34" height="28" rx="4" stroke={C.navy} strokeWidth={2} />
        <path d="M5 18h34" stroke={C.navy} strokeWidth={2} />
        <path d="M13 9V5M31 9V5" stroke={C.navy} strokeWidth={2} strokeLinecap="round" />
        <path d="M14 28h16M17 33h10" stroke={C.textSoft} strokeWidth={2} strokeLinecap="round" />
      </svg>
      <p style={{
        fontFamily: '"Bricolage Grotesque", system-ui',
        fontSize: 17, fontWeight: 700, color: C.text, margin: '0 0 5px',
      }}>
        {filtered ? 'Nenhuma vaga nesta categoria' : 'Nenhuma vaga publicada ainda'}
      </p>
      {!filtered && (
        <>
          <p style={{
            fontFamily: '"DM Sans", system-ui',
            fontSize: 13.5, color: C.textMute, margin: '0 0 20px', lineHeight: 1.5,
          }}>
            Crie sua primeira vaga e encontre o profissional ideal.
          </p>
          <Link href="/business/shifts/create" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: C.jade, color: C.jadeInk,
            borderRadius: 12, padding: '10px 18px', textDecoration: 'none',
            fontFamily: '"DM Sans", system-ui', fontSize: 14, fontWeight: 700,
            boxShadow: '0 4px 12px rgba(0,196,140,0.28)',
          }}>
            <svg width={13} height={13} viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke={C.jadeInk} strokeWidth={2.4} strokeLinecap="round" />
            </svg>
            Publicar primeira vaga
          </Link>
        </>
      )}
    </div>
  )
}

function SkeletonRow() {
  return (
    <div style={{
      background: '#fff', borderRadius: 14, padding: '16px 20px',
      border: `1px solid ${C.line}`,
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16,
    }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ height: 18, width: '30%', borderRadius: 6, background: C.surface3, animation: 'pulse 1.4s ease-in-out infinite' }} />
        <div style={{ height: 13, width: '55%', borderRadius: 4, background: C.surface3, animation: 'pulse 1.4s ease-in-out infinite', animationDelay: '0.1s' }} />
      </div>
      <div style={{ height: 22, width: 80, borderRadius: 6, background: C.surface3, animation: 'pulse 1.4s ease-in-out infinite', animationDelay: '0.2s' }} />
    </div>
  )
}

export default function BusinessShiftsPage() {
  const [tab, setTab] = useState('all')
  const { data: shifts, isLoading } = useQuery({
    queryKey: ['my-shifts'],
    queryFn: () => api.get<Shift[]>('/shifts/mine'),
  })

  const filtered = tab === 'all' ? (shifts ?? []) : (shifts ?? []).filter(s => s.status === tab)

  return (
    <div style={{ background: C.surface2, minHeight: '100vh' }}>
      {/* Header */}
      <div style={{
        background: '#fff', borderBottom: `1px solid ${C.lineSoft}`,
        padding: '28px 40px 20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h1 style={{
            fontFamily: '"Bricolage Grotesque", system-ui',
            fontSize: 24, fontWeight: 800, color: C.text, letterSpacing: -0.7, margin: 0,
          }}>
            Vagas
          </h1>
          <Link href="/business/shifts/create" style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            background: C.navy, color: '#fff',
            borderRadius: 12, padding: '10px 16px', textDecoration: 'none',
            fontFamily: '"DM Sans", system-ui', fontSize: 13.5, fontWeight: 600,
            boxShadow: '0 2px 8px rgba(14,42,120,0.20)',
            transition: 'box-shadow 120ms, background 120ms',
          }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLElement
            el.style.background = C.navyLight
            el.style.boxShadow = '0 4px 16px rgba(14,42,120,0.30)'
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLElement
            el.style.background = C.navy
            el.style.boxShadow = '0 2px 8px rgba(14,42,120,0.20)'
          }}
          >
            <svg width={13} height={13} viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" />
            </svg>
            Postar vaga
          </Link>
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {TABS.map(t => {
            const count = t.id === 'all'
              ? (shifts?.length ?? 0)
              : (shifts ?? []).filter(s => s.status === t.id).length
            const isActive = t.id === tab
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  appearance: 'none', cursor: 'pointer', border: 'none', outline: 'none',
                  background: isActive ? C.navy : 'transparent',
                  color: isActive ? '#fff' : C.textMute,
                  borderRadius: 8, padding: '6px 12px',
                  fontFamily: '"DM Sans", system-ui', fontSize: 13, fontWeight: isActive ? 700 : 500,
                  display: 'flex', alignItems: 'center', gap: 6,
                  transition: 'all 100ms',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = C.text }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = C.textMute }}
              >
                {t.label}
                <span style={{
                  background: isActive ? 'rgba(255,255,255,0.18)' : C.surface3,
                  color: isActive ? '#fff' : C.textSoft,
                  padding: '1px 6px', borderRadius: 6,
                  fontSize: 11, fontWeight: 700,
                }}>{count}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '24px 40px 48px' }}>
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1, 2, 3, 4].map(i => <SkeletonRow key={i} />)}
          </div>
        ) : !filtered.length ? (
          <EmptyState filtered={tab !== 'all'} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map(shift => {
              const st = STATUS[shift.status] ?? STATUS.OPEN
              const hours = (new Date(shift.ends_at).getTime() - new Date(shift.starts_at).getTime()) / 3600000
              return (
                <Link key={shift.id} href={`/business/shifts/${shift.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                  <div
                    style={{
                      background: '#fff', borderRadius: 14, padding: '14px 20px',
                      border: `1px solid ${C.line}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
                      cursor: 'pointer', transition: 'border-color 100ms, box-shadow 100ms',
                    }}
                    onMouseEnter={e => {
                      const el = e.currentTarget as HTMLElement
                      el.style.borderColor = '#C7CBDA'
                      el.style.boxShadow = '0 4px 16px rgba(14,42,120,0.07)'
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget as HTMLElement
                      el.style.borderColor = C.line
                      el.style.boxShadow = 'none'
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                        <span style={{
                          fontFamily: '"Bricolage Grotesque", system-ui',
                          fontSize: 16, fontWeight: 700, color: C.text, letterSpacing: -0.3,
                        }}>
                          {specialtyLabel(shift.specialty)}
                        </span>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          background: st.bg, color: st.fg,
                          padding: '2px 8px', borderRadius: 999,
                          fontFamily: '"DM Sans", system-ui', fontSize: 11, fontWeight: 700,
                        }}>
                          <span style={{ width: 5, height: 5, borderRadius: '50%', background: st.dot, display: 'inline-block', flexShrink: 0 }} />
                          {st.label}
                        </span>
                        {shift.is_urgent && (
                          <span style={{
                            background: '#FFF1E9', color: C.orange,
                            padding: '2px 8px', borderRadius: 999,
                            fontFamily: '"DM Sans", system-ui', fontSize: 11, fontWeight: 700,
                            letterSpacing: 0.2,
                          }}>
                            Urgente
                          </span>
                        )}
                      </div>
                      <span style={{ fontFamily: '"DM Sans", system-ui', fontSize: 12.5, color: C.textMute }}>
                        {formatDateTime(shift.starts_at)} até {formatTime(shift.ends_at)}
                        {' · '}{hours.toFixed(1)}h
                        {' · '}{shift.slots} vaga{shift.slots !== 1 ? 's' : ''}
                      </span>
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{
                        fontFamily: '"Bricolage Grotesque", system-ui',
                        fontSize: 18, fontWeight: 800, color: C.text, letterSpacing: -0.5,
                        fontVariantNumeric: 'tabular-nums',
                      }}>
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

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  )
}
