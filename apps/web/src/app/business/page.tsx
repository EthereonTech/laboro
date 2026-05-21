'use client'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { api } from '@/lib/api'
import { formatCurrency, specialtyLabel } from '@/lib/format'

const C = {
  navy: '#0E2A78', navyLight: '#1B3FA0',
  jade: '#00C48C', jadeDeep: '#00A372', jadeInk: '#0A2A1E', jadeSoft: '#E6FAF3',
  orange: '#FF6B35', orangeSoft: '#FFF1E9',
  text: '#1A1A2E', textMute: '#5C6079', textSoft: '#8A8FA6',
  line: '#E6E8F0', lineSoft: '#EFF1F7',
  surface: '#FFFFFF', surface2: '#F8F9FC', surface3: '#F1F3F9',
}

// Icon paths
const I = {
  briefcase: 'M4 8h16v12H4zM8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 14h18',
  users:     'M9 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm9 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-15 9a6 6 0 0 1 12 0M16 14a5 5 0 0 1 5 6',
  check:     'M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4 12 14.01l-3-3',
  shield:    'M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6l8-3Z',
  plus:      'M12 5v14M5 12h14',
  chevR:     'M9 6l6 6-6 6',
  person:    'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 9a7 7 0 0 1 14 0',
  sparkle:   'M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z',
}

type DashboardShift = {
  id: string
  specialty: string
  starts_at: string
  ends_at: string
  status: string
  slots: number
  total_value: number
  applications: { id: string; status: string }[]
}

type Dashboard = {
  active_shifts: DashboardShift[]
  monthly_spent: number
  pending_applications: number
  completed_shifts: number
}

const STATUS: Record<string, { bg: string; fg: string; dot: string; label: string }> = {
  OPEN:        { bg: '#FFF1E9', fg: '#C2511A', dot: C.orange,    label: 'Aberta' },
  FILLED:      { bg: '#E8F3FF', fg: '#1B3FA0', dot: C.navy,      label: 'Preenchida' },
  IN_PROGRESS: { bg: '#E6FAF3', fg: '#00805B', dot: C.jade,      label: 'Em andamento' },
  DONE:        { bg: C.surface3, fg: C.textMute, dot: '#9AA0B7', label: 'Concluída' },
  CANCELLED:   { bg: '#FEE2E2', fg: '#991B1B', dot: '#EF4444',   label: 'Cancelada' },
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

function formatShortDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' }).replace('.', '')
}

function formatShortTime(iso: string) {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function SvgIcon({ d, size = 15, stroke = C.textSoft, sw = 1.7 }: { d: string; size?: number; stroke?: string; sw?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d={d} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function MetricCard({
  value, label, sub, accent = false, loading = false, icon,
}: { value: string; label: string; sub?: string; accent?: boolean; loading?: boolean; icon: string }) {
  const iconBg = accent ? 'rgba(255,255,255,0.10)' : C.surface3
  const iconStroke = accent ? 'rgba(255,255,255,0.45)' : C.textSoft

  return (
    <div style={{
      background: accent ? C.navy : C.surface,
      border: `1px solid ${accent ? 'transparent' : C.line}`,
      borderRadius: 16, padding: '18px 20px',
      display: 'flex', flexDirection: 'column', gap: 4,
      position: 'relative',
    }}>
      {/* icon badge */}
      <div style={{
        position: 'absolute', top: 16, right: 16,
        width: 30, height: 30, borderRadius: 9,
        background: iconBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <SvgIcon d={icon} size={14} stroke={iconStroke} sw={1.8} />
      </div>

      {loading ? (
        <>
          <div style={{ height: 28, width: '55%', borderRadius: 7, background: accent ? 'rgba(255,255,255,0.12)' : C.surface3, animation: 'pulse 1.4s ease-in-out infinite' }} />
          <div style={{ height: 13, width: '75%', borderRadius: 4, marginTop: 4, background: accent ? 'rgba(255,255,255,0.08)' : C.surface3, animation: 'pulse 1.4s ease-in-out infinite', animationDelay: '0.1s' }} />
          <div style={{ height: 11, width: '55%', borderRadius: 4, background: accent ? 'rgba(255,255,255,0.06)' : C.surface3, animation: 'pulse 1.4s ease-in-out infinite', animationDelay: '0.2s' }} />
        </>
      ) : (
        <>
          <span style={{
            fontFamily: '"Bricolage Grotesque", system-ui',
            fontSize: 28, fontWeight: 800, letterSpacing: -1, lineHeight: 1,
            color: accent ? '#fff' : C.text, fontVariantNumeric: 'tabular-nums',
            paddingRight: 40,
          }}>{value}</span>
          <span style={{ fontFamily: '"DM Sans", system-ui', fontSize: 13, fontWeight: 500, color: accent ? 'rgba(255,255,255,0.65)' : C.textMute, marginTop: 2 }}>{label}</span>
          {sub && <span style={{ fontFamily: '"DM Sans", system-ui', fontSize: 11, color: accent ? 'rgba(255,255,255,0.40)' : C.textSoft }}>{sub}</span>}
        </>
      )}
    </div>
  )
}

function ShiftRow({ shift }: { shift: DashboardShift }) {
  const st = STATUS[shift.status] ?? STATUS.OPEN
  const confirmed = shift.applications?.filter(a => a.status === 'CONFIRMED').length ?? 0
  const fillPct = shift.slots > 0 ? Math.min((confirmed / shift.slots) * 100, 100) : 0

  return (
    <Link href={`/business/shifts/${shift.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div
        style={{
          background: C.surface, border: `1px solid ${C.line}`, borderRadius: 14,
          padding: '14px 18px', display: 'grid', gridTemplateColumns: '1fr auto',
          gap: 16, alignItems: 'center', cursor: 'pointer',
          transition: 'border-color 100ms, box-shadow 100ms',
        }}
        onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#C7CBDA'; el.style.boxShadow = '0 4px 16px rgba(14,42,120,0.07)' }}
        onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = C.line; el.style.boxShadow = 'none' }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 16, fontWeight: 700, color: C.text, letterSpacing: -0.3 }}>
              {specialtyLabel(shift.specialty)}
            </span>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              background: st.bg, color: st.fg, padding: '2px 8px', borderRadius: 999,
              fontFamily: '"DM Sans", system-ui', fontSize: 11, fontWeight: 700, letterSpacing: 0.2,
            }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: st.dot, display: 'inline-block', flexShrink: 0 }} />
              {st.label}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 5, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: '"DM Sans", system-ui', fontSize: 12.5, color: C.textMute }}>
              {formatShortDate(shift.starts_at)}, {formatShortTime(shift.starts_at)}–{formatShortTime(shift.ends_at)}
            </span>
            <span style={{ fontFamily: '"DM Sans", system-ui', fontSize: 12.5, color: C.textSoft }}>
              {confirmed}/{shift.slots} confirmados
            </span>
          </div>
          <div style={{ marginTop: 8, height: 3, borderRadius: 2, background: C.surface3, overflow: 'hidden', width: '100%', maxWidth: 180 }}>
            <div style={{
              height: '100%', borderRadius: 2, width: `${fillPct}%`,
              background: shift.status === 'IN_PROGRESS' ? C.jade : fillPct >= 100 ? C.navy : C.orange,
              transition: 'width 300ms ease',
            }} />
          </div>
        </div>

        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 18, fontWeight: 800, color: C.text, letterSpacing: -0.5, fontVariantNumeric: 'tabular-nums' }}>
            {formatCurrency(shift.total_value)}
          </div>
          <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 11, color: C.textSoft, marginTop: 2 }}>em escrow</div>
        </div>
      </div>
    </Link>
  )
}

// Shown only on first use, when there are no shifts yet
function GettingStarted() {
  const steps = [
    {
      n: '01',
      title: 'Publique uma vaga',
      desc: 'Escolha a especialidade, defina o horário e o valor por hora.',
      cta: { label: 'Publicar agora', href: '/business/shifts/create' },
      accent: true,
    },
    {
      n: '02',
      title: 'Receba candidatos',
      desc: 'Trabalhadores verificados se candidatam. Você confirma quem quer.',
      cta: null,
      accent: false,
    },
    {
      n: '03',
      title: 'Pagamento garantido',
      desc: 'O valor fica retido em escrow e é liberado só após o turno concluído.',
      cta: null,
      accent: false,
    },
  ]

  return (
    <div>
      {/* Connector line above */}
      <div style={{
        display: 'flex', alignItems: 'stretch', gap: 0,
        background: C.surface, border: `1px solid ${C.line}`, borderRadius: 16, overflow: 'hidden',
      }}>
        {steps.map((step, idx) => (
          <div key={step.n} style={{
            flex: 1, padding: '22px 22px',
            borderRight: idx < steps.length - 1 ? `1px solid ${C.lineSoft}` : 'none',
            display: 'flex', flexDirection: 'column', gap: 10,
            background: step.accent ? '#FAFBFF' : 'transparent',
          }}>
            {/* Step number */}
            <div>
              <span style={{
                fontFamily: '"DM Sans", system-ui', fontSize: 11, fontWeight: 700,
                color: C.textSoft, letterSpacing: 0.8,
              }}>
                PASSO {step.n}
              </span>
            </div>

            {/* Content */}
            <div>
              <p style={{ fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 15, fontWeight: 700, color: C.text, margin: '0 0 5px', letterSpacing: -0.2 }}>
                {step.title}
              </p>
              <p style={{ fontFamily: '"DM Sans", system-ui', fontSize: 13, color: C.textMute, margin: 0, lineHeight: 1.55 }}>
                {step.desc}
              </p>
            </div>

            {/* CTA */}
            {step.cta && (
              <Link href={step.cta.href} style={{
                marginTop: 4,
                display: 'inline-flex', alignItems: 'center', gap: 5,
                background: C.jade, color: C.jadeInk,
                borderRadius: 10, padding: '8px 14px', textDecoration: 'none',
                fontFamily: '"DM Sans", system-ui', fontSize: 13, fontWeight: 700,
                boxShadow: '0 3px 10px rgba(0,196,140,0.25)',
                alignSelf: 'flex-start',
              }}>
                <SvgIcon d={I.plus} size={12} stroke={C.jadeInk} sw={2.4} />
                {step.cta.label}
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function BusinessDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['business-dashboard'],
    queryFn: () => api.get<Dashboard>('/businesses/me/dashboard'),
    placeholderData: (prev) => prev,
  })
  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ['business-profile'],
    queryFn: () => api.get<any>('/businesses/me'),
    placeholderData: (prev) => prev,
  })

  const tradeName: string = profileData?.data?.trade_name ?? profileData?.trade_name ?? ''
  const greeting = getGreeting()

  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  const hasShifts = (data?.active_shifts?.length ?? 0) > 0

  return (
    <div style={{ background: C.surface2, minHeight: '100vh', padding: '32px 40px 60px' }}>

      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <p style={{ fontFamily: '"DM Sans", system-ui', fontSize: 13, fontWeight: 500, color: C.textSoft, margin: '0 0 4px', textTransform: 'capitalize' }}>
            {today}
          </p>
          <h1 style={{ fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 26, fontWeight: 800, color: C.text, letterSpacing: -0.8, margin: 0, lineHeight: 1.1 }}>
            {greeting},{' '}
            {profileLoading && !tradeName ? (
              <span style={{
                display: 'inline-block', width: 160, height: 26, borderRadius: 8,
                background: C.surface3, verticalAlign: 'middle', marginBottom: 2,
                animation: 'pulse 1.4s ease-in-out infinite',
              }} />
            ) : (
              <span style={{ color: C.navy }}>{tradeName || 'Empresa'}</span>
            )}
          </h1>
        </div>
        <Link
          href="/business/shifts/create"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            background: C.navy, color: '#fff',
            borderRadius: 12, padding: '11px 18px', textDecoration: 'none',
            fontFamily: '"DM Sans", system-ui', fontSize: 14, fontWeight: 600,
            letterSpacing: -0.1, flexShrink: 0,
            boxShadow: '0 2px 8px rgba(14,42,120,0.20)',
            transition: 'box-shadow 120ms, background 120ms',
          }}
          onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = C.navyLight; el.style.boxShadow = '0 4px 16px rgba(14,42,120,0.30)' }}
          onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = C.navy; el.style.boxShadow = '0 2px 8px rgba(14,42,120,0.20)' }}
        >
          <SvgIcon d={I.plus} size={14} stroke="#fff" sw={2.4} />
          Postar vaga
        </Link>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 32 }}>
        <MetricCard loading={isLoading} icon={I.briefcase} value={String(data?.active_shifts?.length ?? 0)} label="Vagas abertas" sub="aguardando candidatos" />
        <MetricCard loading={isLoading} icon={I.users} value={String(data?.pending_applications ?? 0)} label="Candidatos" sub="aguardando confirmação" />
        <MetricCard loading={isLoading} icon={I.check} value={String(data?.completed_shifts ?? 0)} label="Turnos concluídos" sub="histórico total" />
        <MetricCard loading={isLoading} icon={I.shield} value={formatCurrency(data?.monthly_spent ?? 0)} label="Gasto este mês" sub="via escrow Laboro" accent />
      </div>

      {/* Content section */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h2 style={{ fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 18, fontWeight: 700, color: C.text, letterSpacing: -0.4, margin: 0 }}>
            {hasShifts ? 'Vagas ativas' : 'Como começar'}
          </h2>
          {hasShifts && (
            <Link href="/business/shifts" style={{
              fontFamily: '"DM Sans", system-ui', fontSize: 13, fontWeight: 600, color: C.navy, textDecoration: 'none',
              display: 'flex', alignItems: 'center', gap: 3,
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = C.navyLight }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = C.navy }}
            >
              Ver todas
              <SvgIcon d={I.chevR} size={14} stroke="currentColor" sw={2} />
            </Link>
          )}
        </div>

        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{
                height: 82, borderRadius: 14, background: C.surface,
                border: `1px solid ${C.line}`,
                animation: 'pulse 1.5s ease-in-out infinite',
                opacity: 1 - (i - 1) * 0.2,
              }} />
            ))}
          </div>
        ) : hasShifts ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {data!.active_shifts.map(shift => <ShiftRow key={shift.id} shift={shift} />)}
          </div>
        ) : (
          <GettingStarted />
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
