'use client'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
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

const LEVEL_MAP: Record<string, { label: string; fg: string; bg: string; icon: string }> = {
  BEGINNER: { label: 'Iniciante', fg: C.textMute,  bg: C.surface3,  icon: '◐' },
  VERIFIED: { label: 'Verificado', fg: '#00805B', bg: '#E6FAF3', icon: '✓' },
  TOP_PRO:  { label: 'Top Pro',    fg: '#C2511A', bg: '#FFF1E9', icon: '★' },
}

const RATING_TAGS = [
  { value: 'pontual',          label: 'Pontual' },
  { value: 'trabalhou_bem',    label: 'Trabalhou bem' },
  { value: 'boa_apresentacao', label: 'Boa apresentação' },
  { value: 'voltaria',         label: 'Voltaria a contratar' },
  { value: 'atrasou',          label: 'Atrasou' },
  { value: 'sumiu',            label: 'Sumiu sem avisar' },
  { value: 'nao_voltaria',     label: 'Não contrataria novamente' },
]

type Application = {
  id: string
  status: string
  worker: {
    id: string
    score: number
    level: string
    total_shifts: number
    user: { full_name: string; photo_url: string | null }
  }
}

type ShiftDetail = {
  id: string
  specialty: string
  starts_at: string
  ends_at: string
  rate_per_hour: number
  total_value: number
  laboro_fee: number
  slots: number
  is_urgent: boolean
  status: string
  instructions: string | null
  applications: Application[]
}

type WorkerPublicProfile = {
  id: string
  full_name: string
  photo_url: string | null
  score: number
  level: string
  total_shifts: number
  on_time_rate: number
  specialties: string[]
  is_verified: boolean
}

// ─── Worker Profile Drawer ────────────────────────────────────────────────────

function StarRow({ score }: { score: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
      {[1,2,3,4,5].map(n => (
        <svg key={n} width={14} height={14} viewBox="0 0 24 24" fill={n <= Math.round(score) ? '#F59E0B' : '#E5E7EB'}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
      <span style={{ fontFamily: '"DM Sans", system-ui', fontSize: 13, fontWeight: 700, color: C.text, marginLeft: 4 }}>
        {score.toFixed(1)}
      </span>
    </div>
  )
}

function WorkerProfileDrawer({
  workerId,
  app,
  shiftStatus,
  onClose,
  onConfirm,
  onNoShow,
  onRate,
}: {
  workerId: string
  app: Application
  shiftStatus: string
  onClose: () => void
  onConfirm?: () => void
  onNoShow?: () => void
  onRate?: () => void
}) {
  const { data: profile, isLoading } = useQuery({
    queryKey: ['worker-public', workerId],
    queryFn: () => api.get<WorkerPublicProfile>(`/workers/${workerId}`),
  })

  const lv = LEVEL_MAP[app.worker.level] ?? LEVEL_MAP.BEGINNER
  const initials = app.worker.user.full_name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()

  return (
    <>
      {/* backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 49,
          background: 'rgba(10,15,31,0.35)',
          backdropFilter: 'blur(3px)',
        }}
      />

      {/* drawer */}
      <div style={{
        position: 'fixed', right: 0, top: 0, bottom: 0, width: 420, zIndex: 50,
        background: '#fff',
        boxShadow: '-8px 0 40px rgba(14,42,120,0.14)',
        display: 'flex', flexDirection: 'column',
        animation: 'slideInRight 200ms ease',
      }}>
        {/* close */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px 20px 0' }}>
          <button
            onClick={onClose}
            style={{
              appearance: 'none', border: 0, cursor: 'pointer',
              width: 34, height: 34, borderRadius: 9,
              background: C.surface3, color: C.textMute,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 100ms',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#E6E8F0')}
            onMouseLeave={e => (e.currentTarget.style.background = C.surface3)}
          >
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 28px 24px' }}>
          {/* hero */}
          <div style={{
            background: `linear-gradient(135deg, ${C.navy} 0%, #1B3FA0 100%)`,
            borderRadius: 20, padding: '28px 24px', marginBottom: 20,
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: -40, right: -40, width: 140, height: 140, borderRadius: '50%',
              background: 'radial-gradient(closest-side, rgba(0,196,140,0.25), transparent 70%)',
              pointerEvents: 'none',
            }} />
            {/* avatar */}
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.25), rgba(0,196,140,0.4))',
              border: '3px solid rgba(255,255,255,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: '"Bricolage Grotesque", system-ui', fontWeight: 800, fontSize: 26, color: '#fff',
              marginBottom: 14,
            }}>
              {initials}
            </div>

            <div style={{ fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: -0.5, marginBottom: 8 }}>
              {app.worker.user.full_name}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                background: lv.bg, color: lv.fg,
                padding: '4px 10px', borderRadius: 999,
                fontFamily: '"DM Sans", system-ui', fontSize: 11.5, fontWeight: 700,
              }}>
                <span>{lv.icon}</span>{lv.label}
              </span>
              {profile?.is_verified && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  background: 'rgba(0,196,140,0.2)', color: C.jade,
                  padding: '4px 10px', borderRadius: 999,
                  fontFamily: '"DM Sans", system-ui', fontSize: 11.5, fontWeight: 700,
                }}>
                  ✓ Verificado
                </span>
              )}
            </div>
          </div>

          {isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[80, 120, 100].map((h, i) => (
                <div key={i} style={{ height: h, borderRadius: 14, background: C.surface3, animation: 'pulse 1.4s ease-in-out infinite' }} />
              ))}
            </div>
          ) : profile ? (
            <>
              {/* stats */}
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16,
              }}>
                {[
                  { value: profile.score.toFixed(1), label: 'Avaliação', accent: true },
                  { value: String(profile.total_shifts), label: 'Turnos', accent: false },
                  { value: `${profile.on_time_rate.toFixed(0)}%`, label: 'Pontualidade', accent: false },
                ].map(s => (
                  <div key={s.label} style={{
                    background: s.accent ? C.navy : '#fff',
                    border: `1px solid ${s.accent ? 'transparent' : C.line}`,
                    borderRadius: 14, padding: '14px 12px', textAlign: 'center',
                  }}>
                    <div style={{
                      fontFamily: '"Bricolage Grotesque", system-ui',
                      fontSize: 22, fontWeight: 800, letterSpacing: -0.5,
                      color: s.accent ? '#fff' : C.text, lineHeight: 1,
                    }}>
                      {s.value}
                    </div>
                    <div style={{
                      fontFamily: '"DM Sans", system-ui', fontSize: 11, fontWeight: 500,
                      color: s.accent ? 'rgba(255,255,255,0.6)' : C.textSoft, marginTop: 4,
                    }}>
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* score stars */}
              <div style={{
                background: '#fff', borderRadius: 14, padding: '14px 16px',
                border: `1px solid ${C.line}`, marginBottom: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <span style={{ fontFamily: '"DM Sans", system-ui', fontSize: 13, fontWeight: 600, color: C.textMute }}>
                  Score geral
                </span>
                <StarRow score={profile.score} />
              </div>

              {/* specialties */}
              {profile.specialties.length > 0 && (
                <div style={{
                  background: '#fff', borderRadius: 14, padding: '16px',
                  border: `1px solid ${C.line}`, marginBottom: 12,
                }}>
                  <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 11.5, fontWeight: 700, color: C.textSoft, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 10 }}>
                    Especialidades
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {profile.specialties.map(sp => (
                      <span key={sp} style={{
                        display: 'inline-flex', alignItems: 'center',
                        background: '#E8F3FF', color: '#1B3FA0',
                        padding: '5px 12px', borderRadius: 999,
                        fontFamily: '"DM Sans", system-ui', fontSize: 12, fontWeight: 600,
                      }}>
                        {specialtyLabel(sp)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* performance bar */}
              <div style={{
                background: '#fff', borderRadius: 14, padding: '16px',
                border: `1px solid ${C.line}`, marginBottom: 4,
              }}>
                <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 11.5, fontWeight: 700, color: C.textSoft, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 12 }}>
                  Desempenho
                </div>
                {[
                  { label: 'Taxa de pontualidade', value: profile.on_time_rate, color: C.jade },
                  { label: 'Avaliação média', value: (profile.score / 5) * 100, color: '#F59E0B' },
                ].map(bar => (
                  <div key={bar.label} style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontFamily: '"DM Sans", system-ui', fontSize: 12.5, color: C.textMute }}>{bar.label}</span>
                      <span style={{ fontFamily: '"DM Sans", system-ui', fontSize: 12.5, fontWeight: 700, color: C.text }}>{bar.value.toFixed(0)}%</span>
                    </div>
                    <div style={{ height: 5, borderRadius: 3, background: C.surface3, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: 3, width: `${Math.min(bar.value, 100)}%`,
                        background: bar.color, transition: 'width 600ms ease',
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : null}
        </div>

        {/* action footer */}
        {(onConfirm || onNoShow || onRate) && (
          <div style={{
            padding: '16px 28px 24px',
            borderTop: `1px solid ${C.lineSoft}`,
            display: 'flex', gap: 10,
          }}>
            {onConfirm && (
              <button
                onClick={() => { onConfirm(); onClose() }}
                style={{
                  flex: 1, appearance: 'none', border: 0, cursor: 'pointer',
                  background: C.jade, color: C.jadeInk,
                  borderRadius: 12, padding: '13px',
                  fontFamily: '"DM Sans", system-ui', fontSize: 14, fontWeight: 700,
                  boxShadow: '0 4px 14px rgba(0,196,140,0.30)',
                  transition: 'all 120ms',
                }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,196,140,0.42)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,196,140,0.30)')}
              >
                ✓ Confirmar candidato
              </button>
            )}
            {onNoShow && (
              <button
                onClick={() => { onNoShow(); onClose() }}
                style={{
                  flex: 1, appearance: 'none', border: 0, cursor: 'pointer',
                  background: '#FEE2E2', color: '#991B1B',
                  borderRadius: 12, padding: '13px',
                  fontFamily: '"DM Sans", system-ui', fontSize: 14, fontWeight: 700,
                }}
              >
                ⚠️ Reportar no-show
              </button>
            )}
            {onRate && (
              <button
                onClick={() => { onRate(); onClose() }}
                style={{
                  flex: 1, appearance: 'none', border: 0, cursor: 'pointer',
                  background: '#FFF7E6', color: '#92400E',
                  borderRadius: 12, padding: '13px',
                  fontFamily: '"DM Sans", system-ui', fontSize: 14, fontWeight: 700,
                }}
              >
                ⭐ Avaliar
              </button>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideInRight { from { transform: translateX(24px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes pulse { 0%, 100% { opacity: 0.6; } 50% { opacity: 0.3; } }
      `}</style>
    </>
  )
}

// ─── Application Card ─────────────────────────────────────────────────────────

function AppCard({ app, onViewProfile }: { app: Application; onViewProfile: () => void }) {
  const lv = LEVEL_MAP[app.worker.level] ?? LEVEL_MAP.BEGINNER
  const initials = app.worker.user.full_name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()

  const appStatusColors: Record<string, { bg: string; fg: string; label: string }> = {
    PENDING:   { bg: '#FFF1E9', fg: '#C2511A', label: 'Pendente' },
    CONFIRMED: { bg: '#E6FAF3', fg: '#00805B', label: 'Confirmado' },
    COMPLETED: { bg: '#E8F3FF', fg: '#1B3FA0', label: 'Concluído' },
    CANCELLED: { bg: '#FEE2E2', fg: '#991B1B', label: 'Cancelado' },
    NO_SHOW:   { bg: '#FEE2E2', fg: '#991B1B', label: 'No-show' },
  }
  const asc = appStatusColors[app.status] ?? appStatusColors.PENDING

  return (
    <div
      onClick={onViewProfile}
      style={{
        background: '#fff', borderRadius: 16, padding: '16px 18px',
        border: `1px solid ${C.line}`,
        boxShadow: '0 2px 4px rgba(14,42,120,0.02), 0 6px 16px rgba(14,42,120,0.04)',
        cursor: 'pointer', transition: 'border-color 120ms, box-shadow 120ms',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement
        el.style.borderColor = '#C7CBDA'
        el.style.boxShadow = '0 4px 16px rgba(14,42,120,0.10)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement
        el.style.borderColor = C.line
        el.style.boxShadow = '0 2px 4px rgba(14,42,120,0.02), 0 6px 16px rgba(14,42,120,0.04)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* avatar */}
        <div style={{
          width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, #1B3FA0, #00C48C)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: '"Bricolage Grotesque", system-ui', fontWeight: 700, fontSize: 17, color: '#fff',
          boxShadow: '0 2px 8px rgba(14,42,120,0.20)',
        }}>
          {initials}
        </div>

        {/* info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{
              fontFamily: '"Bricolage Grotesque", system-ui',
              fontSize: 15, fontWeight: 700, color: C.text, letterSpacing: -0.3,
            }}>
              {app.worker.user.full_name}
            </span>
            <span style={{
              background: asc.bg, color: asc.fg,
              padding: '3px 9px', borderRadius: 999,
              fontFamily: '"DM Sans", system-ui', fontSize: 10.5, fontWeight: 700,
            }}>
              {asc.label}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              background: lv.bg, color: lv.fg,
              padding: '3px 9px', borderRadius: 999,
              fontFamily: '"DM Sans", system-ui', fontSize: 11, fontWeight: 700,
            }}>
              <span>{lv.icon}</span>{lv.label}
            </span>
            <span style={{ fontFamily: '"DM Sans", system-ui', fontSize: 12, color: C.textSoft }}>
              ⭐ {Number(app.worker.score).toFixed(1)}
            </span>
            <span style={{ fontFamily: '"DM Sans", system-ui', fontSize: 12, color: C.textSoft }}>
              {app.worker.total_shifts} turno{app.worker.total_shifts !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* chevron */}
        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, opacity: 0.35 }}>
          <path d="M9 6l6 6-6 6" stroke={C.text} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BusinessShiftDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data: shift, isLoading } = useQuery({
    queryKey: ['shift-detail', id],
    queryFn: () => api.get<ShiftDetail>(`/shifts/${id}`),
  })

  const [viewingApp, setViewingApp] = useState<Application | null>(null)
  const [ratingWorker, setRatingWorker] = useState<Application | null>(null)
  const [ratingScore, setRatingScore] = useState(0)
  const [ratingTags, setRatingTags] = useState<string[]>([])
  const [ratingComment, setRatingComment] = useState('')

  const confirmMutation = useMutation({
    mutationFn: (workerId: string) => api.post(`/shifts/${id}/confirm/${workerId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shift-detail', id] })
      queryClient.invalidateQueries({ queryKey: ['business-dashboard'] })
    },
  })

  const noShowMutation = useMutation({
    mutationFn: (workerId: string) => api.post(`/shifts/${id}/report-noshow/${workerId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shift-detail', id] }),
  })

  const cancelMutation = useMutation({
    mutationFn: () => api.post(`/shifts/${id}/cancel`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-shifts'] })
      queryClient.invalidateQueries({ queryKey: ['business-dashboard'] })
      router.push('/business/shifts')
    },
  })

  const ratingMutation = useMutation({
    mutationFn: () => api.post('/ratings', {
      shift_id: id,
      to_id: ratingWorker!.worker.id,
      score: ratingScore,
      tags: ratingTags,
      comment: ratingComment.trim() || undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shift-detail', id] })
      setRatingWorker(null); setRatingScore(0); setRatingTags([]); setRatingComment('')
    },
  })

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0', background: C.surface2, minHeight: '100vh' }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', border: `3px solid ${C.jade}`, borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }
  if (!shift) return null

  const st = SHIFT_STATUS[shift.status] ?? SHIFT_STATUS.OPEN
  const hours = (new Date(shift.ends_at).getTime() - new Date(shift.starts_at).getTime()) / 3600000
  const pending   = shift.applications.filter(a => a.status === 'PENDING')
  const confirmed = shift.applications.filter(a => a.status === 'CONFIRMED')
  const completed = shift.applications.filter(a => a.status === 'COMPLETED')
  const canCancel = ['OPEN', 'FILLED'].includes(shift.status)
  const workerAmount = Number(shift.total_value) - Number(shift.laboro_fee)

  function renderGroup(title: string, apps: Application[], actionProps: (app: Application) => object) {
    if (apps.length === 0) return null
    return (
      <div style={{ marginBottom: 24 }}>
        <div style={{
          fontFamily: '"Bricolage Grotesque", system-ui',
          fontSize: 15, fontWeight: 700, color: C.text, letterSpacing: -0.3,
          marginBottom: 10,
        }}>
          {title} ({apps.length})
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {apps.map(app => (
            <AppCard
              key={app.id}
              app={app}
              onViewProfile={() => setViewingApp(app)}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: C.surface2, minHeight: '100vh' }}>
      {/* navy hero */}
      <div style={{ background: C.navy, color: '#fff', padding: '32px 32px 72px', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: -100, right: -80, width: 260, height: 260, borderRadius: '50%',
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <button
              onClick={() => router.back()}
              style={{
                appearance: 'none', border: 0, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'rgba(255,255,255,0.12)', borderRadius: 10, padding: '8px 12px',
                fontFamily: '"DM Sans", system-ui', fontSize: 13, fontWeight: 600, color: '#fff',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M15 6l-6 6 6 6" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Voltar
            </button>
            {canCancel && (
              <button
                onClick={() => { if (confirm('Cancelar esta vaga?')) cancelMutation.mutate() }}
                disabled={cancelMutation.isPending}
                style={{
                  appearance: 'none', border: '1px solid rgba(239,68,68,0.4)', cursor: 'pointer',
                  background: 'rgba(239,68,68,0.12)', borderRadius: 10, padding: '8px 14px',
                  fontFamily: '"DM Sans", system-ui', fontSize: 13, fontWeight: 600, color: '#FCA5A5',
                  opacity: cancelMutation.isPending ? 0.5 : 1,
                }}
              >
                Cancelar vaga
              </button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              background: st.bg, color: st.fg,
              padding: '4px 10px', borderRadius: 999,
              fontFamily: '"DM Sans", system-ui', fontSize: 11, fontWeight: 700,
            }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: st.dot, display: 'inline-block' }} />
              {st.label}
            </div>
            {shift.is_urgent && (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                background: C.orange, color: '#fff',
                padding: '4px 10px', borderRadius: 999,
                fontFamily: '"DM Sans", system-ui', fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase',
              }}>
                Urgente
              </div>
            )}
          </div>

          <div style={{ fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 30, fontWeight: 800, color: '#fff', letterSpacing: -0.8, lineHeight: 1.1, marginBottom: 4 }}>
            {specialtyLabel(shift.specialty)}
          </div>
          <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 14, color: 'rgba(255,255,255,0.65)' }}>
            {formatDateTime(shift.starts_at)} até {formatTime(shift.ends_at)} · {hours.toFixed(1)}h · {shift.slots} vaga{shift.slots !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      <div style={{
        marginTop: -32, background: C.surface2,
        borderTopLeftRadius: 28, borderTopRightRadius: 28,
        padding: '24px 32px 40px',
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* left */}
          <div>
            <div style={{
              background: '#fff', borderRadius: 18, padding: '18px 20px',
              border: `1px solid ${C.line}`,
              boxShadow: '0 2px 4px rgba(14,42,120,0.03), 0 8px 20px rgba(14,42,120,0.06)',
              marginBottom: 16,
            }}>
              <div style={{ fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 15, fontWeight: 700, color: C.text, letterSpacing: -0.3, marginBottom: 14 }}>
                Financeiro
              </div>
              {[
                { label: 'Total da vaga',     value: formatCurrency(shift.total_value), muted: false },
                { label: 'Taxa Laboro (18%)', value: `− ${formatCurrency(shift.laboro_fee)}`, muted: true },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                  <span style={{ fontFamily: '"DM Sans", system-ui', fontSize: 13, color: C.textMute }}>{row.label}</span>
                  <span style={{ fontFamily: '"DM Sans", system-ui', fontSize: 13, fontWeight: 600, color: row.muted ? C.textMute : C.text }}>{row.value}</span>
                </div>
              ))}
              <div style={{ height: 1, background: C.lineSoft, margin: '8px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '2px 0' }}>
                <span style={{ fontFamily: '"DM Sans", system-ui', fontSize: 13.5, fontWeight: 700, color: C.text }}>Repasse ao trabalhador</span>
                <span style={{ fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 18, fontWeight: 800, color: C.jadeDeep, letterSpacing: -0.4 }}>
                  {formatCurrency(workerAmount)}
                </span>
              </div>
            </div>

            {shift.instructions && (
              <div style={{
                background: '#FFF7E6', borderRadius: 14, padding: '14px 16px',
                border: '1px solid #FDE68A',
              }}>
                <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 11.5, fontWeight: 700, color: '#92400E', letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 6 }}>
                  Instruções
                </div>
                <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 13.5, color: C.text, lineHeight: 1.5 }}>
                  {shift.instructions}
                </div>
              </div>
            )}
          </div>

          {/* right: candidates */}
          <div>
            {renderGroup('Confirmados', confirmed, (app) => ({
              onNoShow: shift.status === 'IN_PROGRESS' ? () => {
                if (confirm(`Registrar no-show de ${app.worker.user.full_name}?`)) noShowMutation.mutate(app.worker.id)
              } : undefined,
            }))}
            {renderGroup('Candidatos pendentes', pending, (app) => ({
              onConfirm: shift.status === 'OPEN' ? () => {
                if (confirm(`Confirmar ${app.worker.user.full_name}?`)) confirmMutation.mutate(app.worker.id)
              } : undefined,
            }))}
            {renderGroup('Concluídos', completed, (app) => ({
              onRate: () => setRatingWorker(app),
            }))}

            {shift.applications.length === 0 && (
              <div style={{
                background: '#fff', borderRadius: 18, padding: '32px 20px',
                textAlign: 'center', border: `1px solid ${C.line}`,
              }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>👀</div>
                <div style={{ fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 4 }}>
                  Nenhum candidato ainda
                </div>
                <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 13, color: C.textMute }}>
                  Trabalhadores de {specialtyLabel(shift.specialty)} foram notificados
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Worker profile drawer */}
      {viewingApp && (
        <WorkerProfileDrawer
          workerId={viewingApp.worker.id}
          app={viewingApp}
          shiftStatus={shift.status}
          onClose={() => setViewingApp(null)}
          onConfirm={shift.status === 'OPEN' && viewingApp.status === 'PENDING' ? () => {
            if (confirm(`Confirmar ${viewingApp.worker.user.full_name}?`)) confirmMutation.mutate(viewingApp.worker.id)
          } : undefined}
          onNoShow={shift.status === 'IN_PROGRESS' && viewingApp.status === 'CONFIRMED' ? () => {
            if (confirm(`Registrar no-show de ${viewingApp.worker.user.full_name}?`)) noShowMutation.mutate(viewingApp.worker.id)
          } : undefined}
          onRate={viewingApp.status === 'COMPLETED' ? () => setRatingWorker(viewingApp) : undefined}
        />
      )}

      {/* Rating modal */}
      {ratingWorker && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 60,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(10,15,31,0.6)', padding: '24px',
          backdropFilter: 'blur(4px)',
        }}>
          <div style={{
            background: '#fff', borderRadius: 24, padding: '28px',
            width: '100%', maxWidth: 440,
            boxShadow: '0 24px 60px rgba(14,42,120,0.25)',
          }}>
            <div style={{ fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 20, fontWeight: 700, color: C.text, letterSpacing: -0.4, marginBottom: 4 }}>
              Avaliar trabalhador
            </div>
            <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 14, color: C.textMute, marginBottom: 20 }}>
              {ratingWorker.worker.user.full_name}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 16 }}>
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} onClick={() => setRatingScore(n)} style={{ appearance: 'none', border: 0, background: 'transparent', cursor: 'pointer', fontSize: 36, lineHeight: 1, color: n <= ratingScore ? '#F59E0B' : '#E5E7EB', transition: 'color 100ms' }}>
                  ★
                </button>
              ))}
            </div>
            {ratingScore > 0 && (
              <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 14, fontWeight: 700, color: C.textMute, textAlign: 'center', marginBottom: 16 }}>
                {['', 'Péssimo', 'Ruim', 'Regular', 'Bom', 'Excelente!'][ratingScore]}
              </div>
            )}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {RATING_TAGS.map(t => {
                const isSelected = ratingTags.includes(t.value)
                return (
                  <button
                    key={t.value}
                    onClick={() => setRatingTags(prev => prev.includes(t.value) ? prev.filter(x => x !== t.value) : [...prev, t.value])}
                    style={{
                      appearance: 'none', cursor: 'pointer',
                      background: isSelected ? '#E6FAF3' : C.surface3,
                      color: isSelected ? '#00805B' : C.textMute,
                      border: `1px solid ${isSelected ? C.jade : C.line}`,
                      borderRadius: 999, padding: '6px 12px',
                      fontFamily: '"DM Sans", system-ui', fontSize: 12, fontWeight: 600,
                      transition: 'all 120ms',
                    }}
                  >
                    {t.label}
                  </button>
                )
              })}
            </div>

            <textarea
              value={ratingComment}
              onChange={e => setRatingComment(e.target.value)}
              rows={2}
              maxLength={300}
              placeholder="Comentário (opcional)"
              style={{
                width: '100%', appearance: 'none', outline: 0,
                border: `1.5px solid ${C.line}`, borderRadius: 12,
                padding: '12px 14px', marginBottom: 16, resize: 'none',
                fontFamily: '"DM Sans", system-ui', fontSize: 14, color: C.text,
                boxSizing: 'border-box',
              }}
              onFocus={e => (e.target.style.borderColor = C.navy)}
              onBlur={e => (e.target.style.borderColor = C.line)}
            />

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => { setRatingWorker(null); setRatingScore(0); setRatingTags([]) }}
                style={{
                  flex: 1, appearance: 'none', cursor: 'pointer',
                  border: `1.5px solid ${C.line}`, background: '#fff',
                  borderRadius: 12, padding: '12px',
                  fontFamily: '"DM Sans", system-ui', fontSize: 14, fontWeight: 600, color: C.textMute,
                }}
              >
                Cancelar
              </button>
              <button
                onClick={() => ratingMutation.mutate()}
                disabled={ratingScore === 0 || ratingMutation.isPending}
                style={{
                  flex: 1, appearance: 'none', cursor: ratingScore === 0 ? 'not-allowed' : 'pointer',
                  border: 0, background: C.jade, color: C.jadeInk,
                  borderRadius: 12, padding: '12px',
                  fontFamily: '"DM Sans", system-ui', fontSize: 14, fontWeight: 700,
                  opacity: ratingScore === 0 ? 0.5 : 1,
                  boxShadow: '0 6px 14px rgba(0,196,140,0.25)',
                }}
              >
                {ratingMutation.isPending ? 'Enviando...' : 'Enviar avaliação'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
