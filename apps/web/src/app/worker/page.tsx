'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { api } from '@/lib/api'
import { formatCurrency, formatDateTime, specialtyLabel } from '@/lib/format'

const C = {
  navy: '#0E2A78', navyLight: '#1B3FA0',
  jade: '#00C48C', jadeDeep: '#00A372', jadeInk: '#0A2A1E',
  orange: '#FF6B35',
  text: '#1A1A2E', textMute: '#5C6079', textSoft: '#8A8FA6',
  line: '#E6E8F0', lineSoft: '#EFF1F7', surface: '#FFFFFF', surface2: '#F8F9FC', surface3: '#F1F3F9',
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
  business_name: string
  address: { city: string; neighborhood: string; street: string; number: string; state: string; zip: string }
}

const LEVEL: Record<string, { label: string; fg: string; bg: string }> = {
  BEGINNER: { label: 'Iniciante', fg: C.textMute,  bg: C.surface3  },
  VERIFIED: { label: 'Verificado', fg: '#00805B', bg: '#E6FAF3' },
  TOP_PRO:  { label: 'Top Pro',   fg: '#C2511A', bg: '#FFF1E9' },
}

const BIZ_COLORS = ['#1B3FA0', '#FF6B35', '#00A372', '#7C2D12', '#6D28D9']

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

function MetricCard({ value, label, loading = false }: { value: string; label: string; loading?: boolean }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 14, padding: '14px 16px' }}>
      {loading ? (
        <>
          <div style={{ height: 22, width: '50%', borderRadius: 5, background: C.surface3, animation: 'pulse 1.4s ease-in-out infinite' }} />
          <div style={{ height: 11, width: '65%', borderRadius: 4, background: C.surface3, marginTop: 6, animation: 'pulse 1.4s ease-in-out infinite', animationDelay: '0.1s' }} />
        </>
      ) : (
        <>
          <div style={{ fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 22, fontWeight: 800, color: C.text, letterSpacing: -0.8, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
            {value}
          </div>
          <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 12, color: C.textSoft, marginTop: 5 }}>{label}</div>
        </>
      )}
    </div>
  )
}

function VagaCard({ shift }: { shift: Shift }) {
  const hours = (new Date(shift.ends_at).getTime() - new Date(shift.starts_at).getTime()) / 3600000
  const bizColor = BIZ_COLORS[shift.business_name.charCodeAt(0) % BIZ_COLORS.length]

  return (
    <Link href={`/worker/shifts/${shift.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div
        style={{
          background: C.surface, borderRadius: 16, padding: 16,
          border: `1px solid ${C.line}`, cursor: 'pointer',
          transition: 'border-color 100ms, box-shadow 100ms',
          position: 'relative',
        }}
        onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#C7CBDA'; el.style.boxShadow = '0 4px 16px rgba(14,42,120,0.07)' }}
        onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = C.line; el.style.boxShadow = 'none' }}
      >
        {shift.is_urgent && (
          <div style={{
            position: 'absolute', top: 14, right: 14,
            background: '#FFF1E9', color: C.orange,
            padding: '3px 9px', borderRadius: 999,
            fontFamily: '"DM Sans", system-ui', fontSize: 11, fontWeight: 700, letterSpacing: 0.2,
          }}>
            Urgente
          </div>
        )}

        {/* Biz + role */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', paddingRight: shift.is_urgent ? 72 : 0 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 11, background: bizColor, color: '#fff', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: '"Bricolage Grotesque", system-ui', fontWeight: 700, fontSize: 17,
          }}>
            {shift.business_name[0]?.toUpperCase() ?? '?'}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 12.5, fontWeight: 500, color: C.textMute, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {shift.business_name}
            </div>
            <div style={{ fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 17, fontWeight: 700, color: C.text, letterSpacing: -0.4, marginTop: 1 }}>
              {specialtyLabel(shift.specialty)}
            </div>
          </div>
        </div>

        {/* Meta row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
          {[
            formatDateTime(shift.starts_at),
            `${hours.toFixed(1)}h`,
            `${shift.address?.neighborhood ?? ''} · ${shift.address?.city ?? ''}`,
          ].map(text => (
            <span key={text} style={{
              background: C.surface3, color: C.textMute,
              padding: '4px 9px', borderRadius: 7,
              fontFamily: '"DM Sans", system-ui', fontSize: 12, fontWeight: 500,
            }}>
              {text}
            </span>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginTop: 14, paddingTop: 12, borderTop: `1px solid ${C.lineSoft}`,
        }}>
          <div>
            <div style={{ fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 22, fontWeight: 800, color: C.jadeDeep, letterSpacing: -0.7, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
              {formatCurrency(shift.total_value)}
            </div>
            <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 11, color: C.textSoft, marginTop: 3 }}>
              escrow · {formatCurrency(shift.rate_per_hour)}/h
            </div>
          </div>
          <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 13, fontWeight: 600, color: C.navy, display: 'flex', alignItems: 'center', gap: 3 }}>
            Ver vaga
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke={C.navy} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        </div>
      </div>
    </Link>
  )
}

function SkeletonCard() {
  return (
    <div style={{ background: C.surface, borderRadius: 16, padding: 16, border: `1px solid ${C.line}` }}>
      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 11, background: C.surface3, animation: 'pulse 1.4s ease-in-out infinite', flexShrink: 0 }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ height: 12, width: '40%', borderRadius: 4, background: C.surface3, animation: 'pulse 1.4s ease-in-out infinite' }} />
          <div style={{ height: 17, width: '65%', borderRadius: 5, background: C.surface3, animation: 'pulse 1.4s ease-in-out infinite', animationDelay: '0.1s' }} />
        </div>
      </div>
      <div style={{ height: 1, background: C.lineSoft, margin: '12px 0' }} />
      <div style={{ height: 22, width: '40%', borderRadius: 5, background: C.surface3, animation: 'pulse 1.4s ease-in-out infinite', animationDelay: '0.2s' }} />
    </div>
  )
}

const CHIPS = ['Todas', 'Garçom', 'Bartender', 'Aux. Cozinha', 'Promotor']

export default function WorkerShiftsPage() {
  const [filter, setFilter] = useState('Todas')

  const { data: shifts, isLoading: shiftsLoading } = useQuery({
    queryKey: ['worker-shifts'],
    queryFn: () => api.get<{ data: Shift[]; meta: { total: number } }>('/shifts?limit=50'),
    placeholderData: (prev) => prev,
  })
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['worker-profile'],
    queryFn: () => api.get<any>('/workers/me'),
    placeholderData: (prev) => prev,
  })

  const fullName: string = profile?.full_name ?? ''
  const firstName = fullName.split(' ')[0] || ''
  const score   = Number(profile?.score ?? 0)
  const shifts_ = profile?.total_shifts ?? 0
  const earnings = profile?.earnings_month ?? 0
  const lv = LEVEL[profile?.level ?? 'BEGINNER']
  const urgent = shifts?.data?.filter(s => s.is_urgent).length ?? 0
  const total  = shifts?.meta?.total ?? 0

  const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div style={{ background: C.surface2, minHeight: '100vh', padding: '32px 40px 60px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <p style={{ fontFamily: '"DM Sans", system-ui', fontSize: 13, fontWeight: 500, color: C.textSoft, margin: '0 0 4px', textTransform: 'capitalize' }}>
            {today}
          </p>
          <h1 style={{ fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 26, fontWeight: 800, color: C.text, letterSpacing: -0.8, margin: 0, lineHeight: 1.1 }}>
            {getGreeting()}{firstName ? `, ` : ''}
            {profileLoading && !firstName ? (
              <span style={{ display: 'inline-block', width: 140, height: 24, borderRadius: 7, background: C.surface3, verticalAlign: 'middle', animation: 'pulse 1.4s ease-in-out infinite' }} />
            ) : firstName ? (
              <span style={{ color: C.navy }}>{firstName}</span>
            ) : null}
          </h1>
        </div>
        {lv && !profileLoading && (
          <span style={{
            display: 'inline-flex', alignItems: 'center',
            background: lv.bg, color: lv.fg,
            padding: '6px 12px', borderRadius: 999,
            fontFamily: '"DM Sans", system-ui', fontSize: 12.5, fontWeight: 700,
            flexShrink: 0, marginTop: 6,
          }}>
            {lv.label}
          </span>
        )}
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 28 }}>
        <MetricCard loading={profileLoading} value={score.toFixed(1)} label="score" />
        <MetricCard loading={profileLoading} value={String(shifts_)} label="turnos realizados" />
        <MetricCard loading={profileLoading} value={formatCurrency(earnings)} label="ganhos este mês" />
      </div>

      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
        <h2 style={{ fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 18, fontWeight: 700, color: C.text, letterSpacing: -0.4, margin: 0 }}>
          Vagas para você
        </h2>
        {total > 0 && (
          <span style={{ fontFamily: '"DM Sans", system-ui', fontSize: 13, color: C.textSoft }}>
            {urgent > 0 && <span style={{ color: C.orange, fontWeight: 600 }}>{urgent} urgente{urgent > 1 ? 's' : ''} · </span>}
            {total} disponíveis
          </span>
        )}
      </div>

      {/* Filter chips */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {CHIPS.map(c => {
          const active = c === filter
          return (
            <button
              key={c}
              onClick={() => setFilter(c)}
              style={{
                appearance: 'none', cursor: 'pointer', border: 'none', outline: 'none',
                background: active ? C.navy : 'transparent',
                color: active ? '#fff' : C.textMute,
                borderRadius: 8, padding: '6px 12px',
                fontFamily: '"DM Sans", system-ui', fontSize: 13, fontWeight: active ? 700 : 500,
                transition: 'all 100ms',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.color = C.text }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.color = C.textMute }}
            >
              {c}
            </button>
          )
        })}
      </div>

      {/* Content */}
      {shiftsLoading ? (
        <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))' }}>
          {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : !shifts?.data?.length ? (
        <div style={{ background: C.surface, borderRadius: 16, padding: '52px 24px', textAlign: 'center', border: `1px solid ${C.line}` }}>
          <svg width={44} height={44} viewBox="0 0 44 44" fill="none" style={{ margin: '0 auto 14px', display: 'block', opacity: 0.3 }}>
            <circle cx="20" cy="20" r="13" stroke={C.navy} strokeWidth={2} />
            <path d="M31 31l7 7" stroke={C.navy} strokeWidth={2} strokeLinecap="round" />
            <path d="M15 20h10M20 15v10" stroke={C.textSoft} strokeWidth={2} strokeLinecap="round" />
          </svg>
          <p style={{ fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 17, fontWeight: 700, color: C.text, margin: '0 0 5px' }}>
            Nenhuma vaga disponível
          </p>
          <p style={{ fontFamily: '"DM Sans", system-ui', fontSize: 13.5, color: C.textMute, margin: 0, lineHeight: 1.5 }}>
            Novas vagas aparecem aqui assim que forem publicadas
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))' }}>
          {shifts.data.map(shift => <VagaCard key={shift.id} shift={shift} />)}
        </div>
      )}

      <style>{`@keyframes pulse { 0%, 100% { opacity: 0.6; } 50% { opacity: 0.3; } }`}</style>
    </div>
  )
}
