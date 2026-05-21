'use client'
import { useState, useMemo } from 'react'
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

const BIZ_COLORS = ['#1B3FA0', '#FF6B35', '#00A372', '#7C2D12', '#6D28D9']

type Shift = {
  id: string
  specialty: string
  starts_at: string
  ends_at: string
  rate_per_hour: number
  total_value: number
  worker_amount: number
  slots: number
  slots_available: number
  is_urgent: boolean
  status: string
  business_name: string
  address: { city: string; neighborhood: string; street: string; number: string; state: string; zip: string }
}

// ─── Filter types ─────────────────────────────────────────────────────────────

type Filters = {
  specialty: string        // '' = todas
  date: 'any' | 'today' | 'tomorrow' | 'week'
  minValue: number         // 0 = qualquer
  minHours: number         // 0 = qualquer
  urgentOnly: boolean
  sortBy: 'earliest' | 'highest_pay' | 'urgent_first'
}

const DEFAULT_FILTERS: Filters = {
  specialty: '',
  date: 'any',
  minValue: 0,
  minHours: 0,
  urgentOnly: false,
  sortBy: 'urgent_first',
}

const SPECIALTIES = [
  { value: 'garcom',       label: 'Garçom' },
  { value: 'bartender',    label: 'Bartender' },
  { value: 'aux_cozinha',  label: 'Aux. Cozinha' },
  { value: 'promotor',     label: 'Promotor' },
  { value: 'caixa',        label: 'Caixa' },
  { value: 'repositor',    label: 'Repositor' },
  { value: 'cuidador',     label: 'Cuidador' },
  { value: 'aux_logistica',label: 'Aux. Logística' },
]

function getGreeting() {
  const h = new Date().getHours()
  return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'
}

function isoToday() { return new Date().toISOString().slice(0, 10) }
function isoTomorrow() {
  const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().slice(0, 10)
}

function filterAndSort(shifts: Shift[], filters: Filters): Shift[] {
  const today = isoToday()
  const tomorrow = isoTomorrow()
  const weekEnd = new Date(); weekEnd.setDate(weekEnd.getDate() + 7)

  let result = shifts.filter(s => {
    if (filters.specialty && s.specialty !== filters.specialty) return false
    if (filters.urgentOnly && !s.is_urgent) return false

    const hours = (new Date(s.ends_at).getTime() - new Date(s.starts_at).getTime()) / 3_600_000
    if (filters.minHours > 0 && hours < filters.minHours) return false
    if (filters.minValue > 0 && s.worker_amount < filters.minValue) return false

    if (filters.date !== 'any') {
      const day = s.starts_at.slice(0, 10)
      if (filters.date === 'today' && day !== today) return false
      if (filters.date === 'tomorrow' && day !== tomorrow) return false
      if (filters.date === 'week' && new Date(s.starts_at) > weekEnd) return false
    }

    return true
  })

  result.sort((a, b) => {
    if (filters.sortBy === 'urgent_first') {
      if (a.is_urgent !== b.is_urgent) return a.is_urgent ? -1 : 1
      return new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()
    }
    if (filters.sortBy === 'highest_pay') return b.worker_amount - a.worker_amount
    return new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()
  })

  return result
}

function countActiveFilters(f: Filters): number {
  let n = 0
  if (f.specialty) n++
  if (f.date !== 'any') n++
  if (f.minValue > 0) n++
  if (f.minHours > 0) n++
  if (f.urgentOnly) n++
  if (f.sortBy !== 'urgent_first') n++
  return n
}

// ─── Filter panel ─────────────────────────────────────────────────────────────

function FilterPanel({
  filters, onChange, onClose,
}: {
  filters: Filters
  onChange: (f: Filters) => void
  onClose: () => void
}) {
  const [draft, setDraft] = useState<Filters>({ ...filters })
  const set = (patch: Partial<Filters>) => setDraft(prev => ({ ...prev, ...patch }))

  const activeCount = countActiveFilters(draft)

  return (
    <>
      {/* backdrop */}
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(8,16,30,0.4)', zIndex: 40, backdropFilter: 'blur(2px)' }}
      />
      {/* panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 380,
        background: '#fff', zIndex: 50, overflowY: 'auto',
        boxShadow: '-8px 0 40px rgba(14,42,120,0.12)',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* header */}
        <div style={{
          padding: '24px 24px 20px',
          borderBottom: `1px solid ${C.lineSoft}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, background: '#fff', zIndex: 1,
        }}>
          <div style={{ fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 20, fontWeight: 700, color: C.text, letterSpacing: -0.4 }}>
            Filtros
          </div>
          <button onClick={onClose} style={{
            appearance: 'none', border: 0, cursor: 'pointer', background: C.surface3,
            width: 32, height: 32, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M6 6l12 12M6 18L18 6" stroke={C.text} strokeWidth="2.2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div style={{ flex: 1, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 28 }}>

          {/* especialidade */}
          <section>
            <FilterSectionTitle>Especialidade</FilterSectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <FilterChip
                active={draft.specialty === ''}
                onClick={() => set({ specialty: '' })}
              >
                Todas as funções
              </FilterChip>
              {SPECIALTIES.map(s => (
                <FilterChip
                  key={s.value}
                  active={draft.specialty === s.value}
                  onClick={() => set({ specialty: s.value })}
                >
                  {s.label}
                </FilterChip>
              ))}
            </div>
          </section>

          {/* data */}
          <section>
            <FilterSectionTitle>Quando</FilterSectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {([
                { value: 'any',      label: 'Qualquer data' },
                { value: 'today',    label: 'Hoje' },
                { value: 'tomorrow', label: 'Amanhã' },
                { value: 'week',     label: 'Próximos 7 dias' },
              ] as const).map(opt => (
                <RadioRow
                  key={opt.value}
                  active={draft.date === opt.value}
                  onClick={() => set({ date: opt.value })}
                >
                  {opt.label}
                </RadioRow>
              ))}
            </div>
          </section>

          {/* valor mínimo */}
          <section>
            <FilterSectionTitle>Valor mínimo (o que você recebe)</FilterSectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[0, 50, 100, 150, 200, 300].map(v => (
                <FilterChip
                  key={v}
                  active={draft.minValue === v}
                  onClick={() => set({ minValue: v })}
                >
                  {v === 0 ? 'Qualquer' : `R$ ${v}+`}
                </FilterChip>
              ))}
            </div>
          </section>

          {/* duração */}
          <section>
            <FilterSectionTitle>Duração mínima</FilterSectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              {[0, 4, 6, 8].map(h => (
                <FilterChip
                  key={h}
                  active={draft.minHours === h}
                  onClick={() => set({ minHours: h })}
                >
                  {h === 0 ? 'Qualquer' : `${h}h+`}
                </FilterChip>
              ))}
            </div>
          </section>

          {/* urgente */}
          <section>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: draft.urgentOnly ? '#FFF1E9' : C.surface3,
              borderRadius: 12, padding: '14px 16px',
              border: `1px solid ${draft.urgentOnly ? C.orange : C.line}`,
              cursor: 'pointer', transition: 'all 120ms',
            }} onClick={() => set({ urgentOnly: !draft.urgentOnly })}>
              <div>
                <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 14, fontWeight: 600, color: draft.urgentOnly ? C.orange : C.text }}>
                  ⚡ Somente urgentes
                </div>
                <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 12, color: C.textMute, marginTop: 2 }}>
                  Vagas que precisam de confirmação rápida
                </div>
              </div>
              <div style={{
                width: 44, height: 24, borderRadius: 12,
                background: draft.urgentOnly ? C.orange : C.line,
                position: 'relative', transition: 'background 150ms', flexShrink: 0,
              }}>
                <div style={{
                  position: 'absolute', top: 3, left: draft.urgentOnly ? 23 : 3,
                  width: 18, height: 18, borderRadius: '50%', background: '#fff',
                  transition: 'left 150ms', boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
                }} />
              </div>
            </div>
          </section>

          {/* ordenação */}
          <section>
            <FilterSectionTitle>Ordenar por</FilterSectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {([
                { value: 'urgent_first',  label: 'Urgentes primeiro', sub: 'Padrão da plataforma' },
                { value: 'earliest',      label: 'Mais próximo no tempo', sub: 'Turno mais cedo aparece primeiro' },
                { value: 'highest_pay',   label: 'Melhor remuneração', sub: 'Maior valor que você recebe' },
              ] as const).map(opt => (
                <RadioRow
                  key={opt.value}
                  active={draft.sortBy === opt.value}
                  onClick={() => set({ sortBy: opt.value })}
                  sub={opt.sub}
                >
                  {opt.label}
                </RadioRow>
              ))}
            </div>
          </section>
        </div>

        {/* footer CTA */}
        <div style={{
          padding: '16px 24px 24px',
          borderTop: `1px solid ${C.lineSoft}`,
          display: 'flex', gap: 10,
          position: 'sticky', bottom: 0, background: '#fff',
        }}>
          <button
            onClick={() => { setDraft({ ...DEFAULT_FILTERS }) }}
            style={{
              flex: 1, appearance: 'none', border: `1.5px solid ${C.line}`, cursor: 'pointer',
              background: '#fff', color: C.textMute, borderRadius: 14, padding: '13px',
              fontFamily: '"DM Sans", system-ui', fontSize: 14, fontWeight: 600,
            }}
          >
            Limpar
          </button>
          <button
            onClick={() => { onChange(draft); onClose() }}
            style={{
              flex: 2, appearance: 'none', border: 0, cursor: 'pointer',
              background: C.navy, color: '#fff', borderRadius: 14, padding: '13px',
              fontFamily: '"DM Sans", system-ui', fontSize: 14, fontWeight: 700,
            }}
          >
            {activeCount > 0 ? `Aplicar ${activeCount} filtro${activeCount > 1 ? 's' : ''}` : 'Aplicar'}
          </button>
        </div>
      </div>
    </>
  )
}

function FilterSectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: '"DM Sans", system-ui', fontSize: 11.5, fontWeight: 700,
      color: C.textSoft, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 10,
    }}>
      {children}
    </div>
  )
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        appearance: 'none', cursor: 'pointer',
        background: active ? C.navy : C.surface3,
        color: active ? '#fff' : C.textMute,
        border: `1.5px solid ${active ? C.navy : 'transparent'}`,
        borderRadius: 10, padding: '9px 12px',
        fontFamily: '"DM Sans", system-ui', fontSize: 13, fontWeight: active ? 700 : 500,
        textAlign: 'center', transition: 'all 120ms',
      }}
    >
      {children}
    </button>
  )
}

function RadioRow({
  active, onClick, children, sub,
}: {
  active: boolean; onClick: () => void; children: React.ReactNode; sub?: string
}) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 14px', borderRadius: 12, cursor: 'pointer',
        background: active ? '#EEF1FF' : C.surface3,
        border: `1.5px solid ${active ? C.navy : 'transparent'}`,
        transition: 'all 120ms',
      }}
    >
      <div style={{
        width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
        border: `2px solid ${active ? C.navy : '#C7CBDA'}`,
        background: active ? C.navy : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 120ms',
      }}>
        {active && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 13.5, fontWeight: active ? 700 : 500, color: active ? C.navy : C.text }}>
          {children}
        </div>
        {sub && (
          <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 11.5, color: C.textMute, marginTop: 1 }}>
            {sub}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Shift card ───────────────────────────────────────────────────────────────

function VagaCard({ shift }: { shift: Shift }) {
  const hours = (new Date(shift.ends_at).getTime() - new Date(shift.starts_at).getTime()) / 3_600_000
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
            background: C.orange, color: '#fff',
            padding: '3px 9px', borderRadius: 999,
            fontFamily: '"DM Sans", system-ui', fontSize: 10.5, fontWeight: 700, letterSpacing: 0.3,
            boxShadow: '0 4px 10px rgba(255,107,53,0.35)',
          }}>
            ⚡ Urgente
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, alignItems: 'center', paddingRight: shift.is_urgent ? 80 : 0 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12, background: bizColor, color: '#fff', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: '"Bricolage Grotesque", system-ui', fontWeight: 700, fontSize: 18,
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

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
          {[
            formatDateTime(shift.starts_at),
            `${hours.toFixed(1)}h`,
            shift.address?.neighborhood ? `${shift.address.neighborhood} · ${shift.address.city}` : shift.address?.city ?? '',
          ].filter(Boolean).map(text => (
            <span key={text} style={{
              background: C.surface3, color: C.textMute,
              padding: '4px 9px', borderRadius: 7,
              fontFamily: '"DM Sans", system-ui', fontSize: 12, fontWeight: 500,
            }}>
              {text}
            </span>
          ))}
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginTop: 14, paddingTop: 12, borderTop: `1px dashed ${C.lineSoft}`,
        }}>
          <div>
            <div style={{ fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 22, fontWeight: 800, color: C.jadeDeep, letterSpacing: -0.7, lineHeight: 1 }}>
              {formatCurrency(shift.worker_amount)}
            </div>
            <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 11, color: C.textSoft, marginTop: 3, display: 'flex', alignItems: 'center', gap: 4 }}>
              <svg width="9" height="10" viewBox="0 0 24 24" fill="none">
                <path d="M6 10V8a6 6 0 1 1 12 0v2M5 10h14v10H5z" stroke={C.jadeDeep} strokeWidth="2"/>
              </svg>
              em escrow · {formatCurrency(shift.rate_per_hour)}/h
            </div>
          </div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            background: C.jade, color: C.jadeInk,
            padding: '10px 14px', borderRadius: 11,
            fontFamily: '"DM Sans", system-ui', fontSize: 13, fontWeight: 700,
            boxShadow: '0 6px 14px rgba(0,196,140,0.22)',
          }}>
            Ver vaga
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke={C.jadeInk} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
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
        <div style={{ width: 42, height: 42, borderRadius: 12, background: C.surface3, animation: 'pulse 1.4s ease-in-out infinite', flexShrink: 0 }} />
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

// ─── Quick-filter chips bar ───────────────────────────────────────────────────

const LEVEL: Record<string, { label: string; fg: string; bg: string }> = {
  BEGINNER: { label: 'Iniciante', fg: C.textMute,  bg: C.surface3 },
  VERIFIED: { label: 'Verificado', fg: '#00805B', bg: '#E6FAF3' },
  TOP_PRO:  { label: 'Top Pro',   fg: '#C2511A', bg: '#FFF1E9' },
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function WorkerShiftsPage() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
  const [panelOpen, setPanelOpen] = useState(false)
  const activeCount = countActiveFilters(filters)

  const { data: shifts, isLoading: shiftsLoading } = useQuery({
    queryKey: ['worker-shifts'],
    queryFn: () => api.get<Shift[]>('/shifts?limit=100'),
    placeholderData: prev => prev,
  })
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['worker-profile'],
    queryFn: () => api.get<any>('/workers/me'),
    placeholderData: prev => prev,
  })

  const filtered = useMemo(() => filterAndSort(shifts ?? [], filters), [shifts, filters])

  const fullName: string = profile?.full_name ?? ''
  const firstName = fullName.split(' ')[0] || ''
  const score     = Number(profile?.score ?? 0)
  const totalShifts = profile?.total_shifts ?? 0
  const earnings  = profile?.earnings_month ?? 0
  const lv = LEVEL[profile?.level ?? 'BEGINNER']

  const urgentCount = filtered.filter(s => s.is_urgent).length
  const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })

  // Quick chips derived from filters
  const QUICK_DATES = [
    { id: 'any',      label: 'Qualquer data' },
    { id: 'today',    label: 'Hoje' },
    { id: 'tomorrow', label: 'Amanhã' },
    { id: 'week',     label: 'Esta semana' },
  ] as const

  return (
    <div style={{ background: C.surface2, minHeight: '100vh', padding: '32px 40px 60px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <p style={{ fontFamily: '"DM Sans", system-ui', fontSize: 13, fontWeight: 500, color: C.textSoft, margin: '0 0 4px', textTransform: 'capitalize' }}>
            {today}
          </p>
          <h1 style={{ fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 26, fontWeight: 800, color: C.text, letterSpacing: -0.8, margin: 0, lineHeight: 1.1 }}>
            {getGreeting()}{firstName ? ', ' : ''}
            {profileLoading && !firstName
              ? <span style={{ display: 'inline-block', width: 140, height: 24, borderRadius: 7, background: C.surface3, verticalAlign: 'middle', animation: 'pulse 1.4s ease-in-out infinite' }} />
              : firstName ? <span style={{ color: C.navy }}>{firstName}</span> : null
            }
          </h1>
        </div>
        {lv && !profileLoading && (
          <span style={{
            display: 'inline-flex', alignItems: 'center',
            background: lv.bg, color: lv.fg,
            padding: '6px 12px', borderRadius: 999,
            fontFamily: '"DM Sans", system-ui', fontSize: 12.5, fontWeight: 700, flexShrink: 0, marginTop: 6,
          }}>
            {lv.label}
          </span>
        )}
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 28 }}>
        {[
          { loading: profileLoading, value: score.toFixed(1), label: 'score' },
          { loading: profileLoading, value: String(totalShifts), label: 'turnos realizados' },
          { loading: profileLoading, value: formatCurrency(earnings), label: 'ganhos este mês' },
        ].map(card => (
          <div key={card.label} style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 14, padding: '14px 16px' }}>
            {card.loading ? (
              <>
                <div style={{ height: 22, width: '50%', borderRadius: 5, background: C.surface3, animation: 'pulse 1.4s ease-in-out infinite' }} />
                <div style={{ height: 11, width: '65%', borderRadius: 4, background: C.surface3, marginTop: 6, animation: 'pulse 1.4s ease-in-out infinite', animationDelay: '0.1s' }} />
              </>
            ) : (
              <>
                <div style={{ fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 22, fontWeight: 800, color: C.text, letterSpacing: -0.8, lineHeight: 1 }}>
                  {card.value}
                </div>
                <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 12, color: C.textSoft, marginTop: 5 }}>{card.label}</div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <h2 style={{ fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 18, fontWeight: 700, color: C.text, letterSpacing: -0.4, margin: 0 }}>
            Vagas para você
          </h2>
          {!shiftsLoading && (
            <p style={{ fontFamily: '"DM Sans", system-ui', fontSize: 12.5, color: C.textSoft, margin: '3px 0 0' }}>
              {urgentCount > 0 && <span style={{ color: C.orange, fontWeight: 700 }}>{urgentCount} urgente{urgentCount > 1 ? 's' : ''} · </span>}
              {filtered.length} disponíve{filtered.length !== 1 ? 'is' : 'l'}
              {(shifts?.length ?? 0) > filtered.length && ` (de ${shifts?.length} total)`}
            </p>
          )}
        </div>
      </div>

      {/* Filter bar */}
      <div style={{
        display: 'flex', gap: 8, marginBottom: 20,
        overflowX: 'auto', scrollbarWidth: 'none',
        paddingBottom: 2,
      }}>
        {/* Filtros button */}
        <button
          onClick={() => setPanelOpen(true)}
          style={{
            appearance: 'none', cursor: 'pointer', border: 'none',
            background: activeCount > 0 ? C.navy : C.surface3,
            color: activeCount > 0 ? '#fff' : C.text,
            borderRadius: 10, padding: '8px 14px',
            fontFamily: '"DM Sans", system-ui', fontSize: 13, fontWeight: 700,
            display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0,
            transition: 'all 120ms',
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <path d="M4 5h16M7 12h10M10 19h4" stroke={activeCount > 0 ? '#fff' : C.text} strokeWidth="2.2" strokeLinecap="round"/>
          </svg>
          Filtros
          {activeCount > 0 && (
            <span style={{
              background: '#fff', color: C.navy,
              width: 18, height: 18, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: '"DM Sans", system-ui', fontSize: 11, fontWeight: 800,
            }}>
              {activeCount}
            </span>
          )}
        </button>

        {/* Quick date chips */}
        {QUICK_DATES.filter(d => d.id !== 'any').map(d => {
          const active = filters.date === d.id
          return (
            <button
              key={d.id}
              onClick={() => setFilters(f => ({ ...f, date: active ? 'any' : d.id }))}
              style={{
                appearance: 'none', cursor: 'pointer', border: 'none',
                background: active ? C.navyLight : C.surface3,
                color: active ? '#fff' : C.textMute,
                borderRadius: 10, padding: '8px 14px',
                fontFamily: '"DM Sans", system-ui', fontSize: 13, fontWeight: active ? 700 : 500,
                flexShrink: 0, transition: 'all 120ms',
              }}
            >
              {d.label}
            </button>
          )
        })}

        <div style={{ width: 1, background: C.line, flexShrink: 0, alignSelf: 'stretch', margin: '0 4px' }} />

        {/* Quick specialty chips */}
        {SPECIALTIES.slice(0, 4).map(s => {
          const active = filters.specialty === s.value
          return (
            <button
              key={s.value}
              onClick={() => setFilters(f => ({ ...f, specialty: active ? '' : s.value }))}
              style={{
                appearance: 'none', cursor: 'pointer', border: 'none',
                background: active ? C.navyLight : C.surface3,
                color: active ? '#fff' : C.textMute,
                borderRadius: 10, padding: '8px 14px',
                fontFamily: '"DM Sans", system-ui', fontSize: 13, fontWeight: active ? 700 : 500,
                flexShrink: 0, transition: 'all 120ms',
              }}
            >
              {s.label}
            </button>
          )
        })}

        <div style={{ width: 1, background: C.line, flexShrink: 0, alignSelf: 'stretch', margin: '0 4px' }} />

        {/* Quick value chips */}
        {[100, 150, 200].map(v => {
          const active = filters.minValue === v
          return (
            <button
              key={v}
              onClick={() => setFilters(f => ({ ...f, minValue: active ? 0 : v }))}
              style={{
                appearance: 'none', cursor: 'pointer', border: 'none',
                background: active ? C.navyLight : C.surface3,
                color: active ? '#fff' : C.textMute,
                borderRadius: 10, padding: '8px 14px',
                fontFamily: '"DM Sans", system-ui', fontSize: 13, fontWeight: active ? 700 : 500,
                flexShrink: 0, transition: 'all 120ms',
              }}
            >
              R${v}+
            </button>
          )
        })}

        {/* Clear filters */}
        {activeCount > 0 && (
          <button
            onClick={() => setFilters({ ...DEFAULT_FILTERS })}
            style={{
              appearance: 'none', cursor: 'pointer',
              border: `1px solid ${C.line}`, background: '#fff', color: C.textMute,
              borderRadius: 10, padding: '8px 12px',
              fontFamily: '"DM Sans", system-ui', fontSize: 12.5, fontWeight: 500,
              flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5,
              transition: 'all 120ms',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M6 6l12 12M6 18L18 6" stroke={C.textMute} strokeWidth="2.2" strokeLinecap="round"/>
            </svg>
            Limpar
          </button>
        )}
      </div>

      {/* Content */}
      {shiftsLoading ? (
        <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))' }}>
          {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ background: C.surface, borderRadius: 16, padding: '52px 24px', textAlign: 'center', border: `1px solid ${C.line}` }}>
          <svg width={44} height={44} viewBox="0 0 44 44" fill="none" style={{ margin: '0 auto 14px', display: 'block', opacity: 0.3 }}>
            <circle cx="20" cy="20" r="13" stroke={C.navy} strokeWidth={2} />
            <path d="M31 31l7 7" stroke={C.navy} strokeWidth={2} strokeLinecap="round" />
            <path d="M15 20h10M20 15v10" stroke={C.textSoft} strokeWidth={2} strokeLinecap="round" />
          </svg>
          <p style={{ fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 17, fontWeight: 700, color: C.text, margin: '0 0 5px' }}>
            Nenhuma vaga encontrada
          </p>
          <p style={{ fontFamily: '"DM Sans", system-ui', fontSize: 13.5, color: C.textMute, margin: '0 0 16px', lineHeight: 1.5 }}>
            {(shifts?.length ?? 0) > 0
              ? 'Tente ajustar os filtros para ver mais vagas.'
              : 'Novas vagas aparecem aqui assim que forem publicadas.'}
          </p>
          {activeCount > 0 && (
            <button
              onClick={() => setFilters({ ...DEFAULT_FILTERS })}
              style={{
                appearance: 'none', border: `1.5px solid ${C.navy}`, cursor: 'pointer',
                background: 'transparent', color: C.navy, borderRadius: 12, padding: '10px 20px',
                fontFamily: '"DM Sans", system-ui', fontSize: 13.5, fontWeight: 700,
              }}
            >
              Limpar filtros
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))' }}>
          {filtered.map(shift => <VagaCard key={shift.id} shift={shift} />)}
        </div>
      )}

      {/* Filter panel */}
      {panelOpen && (
        <FilterPanel
          filters={filters}
          onChange={setFilters}
          onClose={() => setPanelOpen(false)}
        />
      )}

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 0.6; } 50% { opacity: 0.3; } }
        ::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  )
}
