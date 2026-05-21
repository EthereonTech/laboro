'use client'
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { formatCurrency, specialtyLabel } from '@/lib/format'

const C = {
  navy: '#0E2A78', navyLight: '#1B3FA0',
  jade: '#00C48C', jadeDeep: '#00A372', jadeInk: '#0A2A1E', jadeSoft: '#E6FAF3',
  orange: '#FF6B35',
  text: '#1A1A2E', textMute: '#5C6079', textSoft: '#8A8FA6',
  line: '#E6E8F0', lineSoft: '#EFF1F7', surface2: '#F8F9FC', surface3: '#F1F3F9',
}

const BIZ_COLORS = ['#1B3FA0', '#FF6B35', '#00A372', '#7C2D12', '#6D28D9']

type ShiftDetail = {
  id: string
  specialty: string
  starts_at: string
  ends_at: string
  rate_per_hour: number
  total_value: number
  worker_amount: number
  laboro_fee: number
  slots: number
  slots_available: number
  is_urgent: boolean
  status: string
  instructions: string | null
  business_name: string
  address: { street: string; number: string; neighborhood: string; city: string; state: string; zip: string }
}

function Icon({ d, size = 18, stroke = 'currentColor', sw = 1.8 }: { d: string; size?: number; stroke?: string; sw?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d={d} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const ICONS = {
  back:     'M15 6l-6 6 6 6',
  share:    'M12 4v12m0-12l-4 4m4-4l4 4M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4',
  heart:    'M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10Z',
  pin:      'M12 21s7-7 7-12a7 7 0 0 0-14 0c0 5 7 12 7 12Zm0-9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  clock:    'M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  lock:     'M6 10V8a6 6 0 1 1 12 0v2M5 10h14v10H5z',
  calendar: 'M3 9h18M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm3-2v4m8-4v4',
  chev:     'M9 6l6 6-6 6',
  x:        'M6 6l12 12M6 18L18 6',
  route:    'M5 5a3 3 0 1 0 0 6h10a3 3 0 1 1 0 6H5',
  check:    'M5 12l4 4L19 7',
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function MiniMap() {
  return (
    <div style={{ borderRadius: 16, overflow: 'hidden', height: 130, border: `1px solid ${C.line}` }}>
      <svg viewBox="0 0 400 130" preserveAspectRatio="xMidYMid slice" width="100%" height="100%">
        <rect width="400" height="130" fill="#F1F3F9"/>
        <defs>
          <pattern id="g" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M20 0H0v20" fill="none" stroke="#E6E8F0" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="400" height="130" fill="url(#g)"/>
        <path d="M0 85 L400 68" stroke="#fff" strokeWidth="14"/>
        <path d="M130 -10 L155 140" stroke="#fff" strokeWidth="10"/>
        <path d="M260 -10 L280 140" stroke="#fff" strokeWidth="8"/>
        <path d="M-10 25 L410 45" stroke="#fff" strokeWidth="6"/>
        <rect x="175" y="15" width="65" height="38" rx="6" fill="#DCEFE0"/>
        <path d="M-10 125 Q 110 105 210 118 T 420 108 L 420 140 L -10 140 Z" fill="#D7E2F2"/>
        <g transform="translate(200, 58)">
          <circle r="20" fill="#1B3FA0" opacity="0.15"/>
          <circle r="12" fill="#1B3FA0" opacity="0.22"/>
          <path d="M0 -16 C 6 -16 10 -11 10 -7 C 10 -2 0 8 0 8 C 0 8 -10 -2 -10 -7 C -10 -11 -6 -16 0 -16 Z" fill="#1B3FA0"/>
          <circle cy="-9" r="3" fill="#fff"/>
        </g>
      </svg>
    </div>
  )
}

export default function WorkerShiftDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [showSuccess, setShowSuccess] = useState(false)

  const { data: shift, isLoading } = useQuery({
    queryKey: ['worker-shift-detail', id],
    queryFn: () => api.get<ShiftDetail>(`/shifts/${id}`),
  })

  const { data: myApp } = useQuery({
    queryKey: ['my-application', id],
    queryFn: () => api.get<{ id: string; status: string }>(`/shifts/${id}/my-application`),
    enabled: !!shift,
    retry: false,
  })

  const applyMutation = useMutation({
    mutationFn: () => api.post(`/shifts/${id}/apply`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-application', id] })
      queryClient.invalidateQueries({ queryKey: ['worker-shifts'] })
      setShowSuccess(true)
    },
  })

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: C.surface2 }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', border: `3px solid ${C.jade}`, borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    )
  }
  if (!shift) return null

  const hours = (new Date(shift.ends_at).getTime() - new Date(shift.starts_at).getTime()) / 3600000
  const bizColor = BIZ_COLORS[shift.business_name.charCodeAt(0) % BIZ_COLORS.length]
  const canApply = shift.status === 'OPEN' && !myApp

  const APP_STATUS_LABEL: Record<string, { label: string; bg: string; fg: string }> = {
    PENDING:   { label: 'Candidatura enviada — aguardando confirmação', bg: '#FFF7E6', fg: '#92400E' },
    CONFIRMED: { label: 'Candidatura confirmada!', bg: C.jadeSoft, fg: '#00805B' },
    CANCELLED: { label: 'Candidatura cancelada', bg: '#FEE2E2', fg: '#991B1B' },
    COMPLETED: { label: 'Turno concluído', bg: C.surface3, fg: C.textMute },
    NO_SHOW:   { label: 'No-show registrado', bg: '#FEE2E2', fg: '#991B1B' },
  }

  return (
    <div style={{ background: C.surface2, minHeight: '100vh', position: 'relative' }}>

      {/* ── Hero ── */}
      <div style={{
        background: C.navy, padding: '32px 32px 52px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -100, right: -80, width: 280, height: 280, borderRadius: '50%',
          background: 'radial-gradient(closest-side, rgba(0,196,140,0.22), transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* top bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <button onClick={() => router.back()} style={{
              appearance: 'none', border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer',
              width: 38, height: 38, borderRadius: 12,
              background: 'rgba(255,255,255,0.10)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon d={ICONS.back} size={18} stroke="#fff" sw={2.2} />
            </button>
            <div style={{ display: 'flex', gap: 8 }}>
              {[ICONS.heart, ICONS.share].map((d, i) => (
                <button key={i} style={{
                  appearance: 'none', border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer',
                  width: 38, height: 38, borderRadius: 12,
                  background: 'rgba(255,255,255,0.10)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon d={d} size={17} stroke="#fff" sw={2} />
                </button>
              ))}
            </div>
          </div>

          {/* company */}
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 22 }}>
            <div style={{
              width: 54, height: 54, borderRadius: 15, background: bizColor, color: '#fff', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: '"Bricolage Grotesque", system-ui', fontWeight: 700, fontSize: 26,
              boxShadow: '0 8px 22px rgba(0,0,0,0.20)',
            }}>
              {shift.business_name[0]?.toUpperCase() ?? '?'}
            </div>
            <div>
              <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 11.5, fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                Empresa
              </div>
              <div style={{ fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 18, fontWeight: 700, color: '#fff', letterSpacing: -0.4, marginTop: 2 }}>
                {shift.business_name}
              </div>
            </div>
          </div>

          {/* role + urgency */}
          {shift.is_urgent && (
            <div style={{
              display: 'inline-block', padding: '4px 10px', borderRadius: 6,
              background: 'rgba(255,107,53,0.18)', color: '#FFB89A',
              fontFamily: '"DM Sans", system-ui', fontSize: 10.5, fontWeight: 700,
              letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 8,
            }}>
              ⚡ Urgente
            </div>
          )}
          <div style={{ fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 34, fontWeight: 800, color: '#fff', letterSpacing: -1.2, lineHeight: 1.05 }}>
            {specialtyLabel(shift.specialty)}
          </div>
          <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 14, color: 'rgba(255,255,255,0.6)', marginTop: 6 }}>
            {fmtDate(shift.starts_at)} · {fmtTime(shift.starts_at)} → {fmtTime(shift.ends_at)} · {hours.toFixed(1)}h
          </div>
        </div>
      </div>

      {/* ── Pay card (overlaps hero) ── */}
      <div style={{ padding: '0 32px', marginTop: -28, position: 'relative', zIndex: 2 }}>
        <div style={{
          background: '#fff', borderRadius: 20, padding: '20px 22px',
          border: `1px solid ${C.line}`,
          boxShadow: '0 10px 30px rgba(14,42,120,0.10)',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 11.5, fontWeight: 700, color: C.textSoft, letterSpacing: 0.6, textTransform: 'uppercase' }}>
                Você recebe
              </div>
              <div style={{ fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 38, fontWeight: 800, color: C.jadeDeep, letterSpacing: -1.5, lineHeight: 1, marginTop: 4 }}>
                {formatCurrency(shift.worker_amount)}
              </div>
              <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 12.5, color: C.textMute, marginTop: 5 }}>
                Diária bruta · sem descontos
              </div>
            </div>
            <div style={{
              background: C.jadeSoft, padding: '10px 12px', borderRadius: 12,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, flexShrink: 0,
            }}>
              <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 10, color: C.jadeDeep, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase' }}>
                por hora
              </div>
              <div style={{ fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 17, fontWeight: 700, color: C.jadeDeep, letterSpacing: -0.3 }}>
                {formatCurrency(shift.rate_per_hour)}
              </div>
            </div>
          </div>

          {/* escrow strip */}
          <div style={{
            marginTop: 16, padding: '12px 14px',
            background: 'linear-gradient(180deg, #F7FFFB, #F1FBF6)',
            border: `1px solid rgba(0,196,140,0.25)`, borderRadius: 12,
            display: 'flex', gap: 12, alignItems: 'center',
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10, background: '#fff',
              border: `1px solid rgba(0,196,140,0.22)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Icon d={ICONS.lock} size={16} stroke={C.jadeDeep} sw={2} />
            </div>
            <div>
              <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 13, fontWeight: 700, color: C.jadeInk }}>
                Pagamento garantido em escrow
              </div>
              <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 11.5, color: C.textMute, marginTop: 1, lineHeight: 1.3 }}>
                A empresa reserva {formatCurrency(shift.total_value)} · liberamos via Pix após o check-out
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content sections ── */}
      <div style={{ padding: '20px 32px 120px' }}>

        {/* meta cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
          {[
            { icon: ICONS.calendar, label: 'Quando', primary: fmtDate(shift.starts_at), secondary: `${fmtTime(shift.starts_at)} → ${fmtTime(shift.ends_at)}` },
            { icon: ICONS.pin, label: 'Onde', primary: shift.address?.neighborhood ?? '', secondary: `${shift.address?.city ?? ''} · ${shift.address?.state ?? ''}` },
          ].map(card => (
            <div key={card.label} style={{ background: '#fff', borderRadius: 14, padding: 16, border: `1px solid ${C.line}` }}>
              <div style={{
                width: 30, height: 30, borderRadius: 9, background: C.surface3,
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10,
              }}>
                <Icon d={card.icon} size={15} stroke={C.navy} sw={2} />
              </div>
              <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 11, fontWeight: 700, color: C.textSoft, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                {card.label}
              </div>
              <div style={{ fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 15, fontWeight: 700, color: C.text, marginTop: 3, letterSpacing: -0.2 }}>
                {card.primary}
              </div>
              <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 12.5, color: C.textMute, marginTop: 2 }}>
                {card.secondary}
              </div>
            </div>
          ))}
        </div>

        {/* instructions */}
        {shift.instructions && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 15, fontWeight: 700, color: C.text, letterSpacing: -0.2, marginBottom: 10 }}>
              Instruções da empresa
            </div>
            <div style={{ background: '#fff', borderRadius: 14, padding: '4px 16px', border: `1px solid ${C.line}` }}>
              {shift.instructions.split('\n').map((line, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '10px 0', borderTop: i > 0 ? `1px solid ${C.lineSoft}` : 'none' }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 10, background: C.surface3,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1,
                  }}>
                    <Icon d={ICONS.check} size={14} stroke={C.navy} sw={2} />
                  </div>
                  <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 14, fontWeight: 500, color: C.text, paddingTop: 6, lineHeight: 1.4 }}>
                    {line}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* location */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 15, fontWeight: 700, color: C.text, letterSpacing: -0.2, marginBottom: 10 }}>
            Localização
          </div>
          <MiniMap />
          <div style={{
            marginTop: 10, background: '#fff', borderRadius: 14, padding: '14px 16px',
            border: `1px solid ${C.line}`, display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <Icon d={ICONS.pin} size={20} stroke={C.navy} sw={2} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 14, fontWeight: 600, color: C.text }}>
                {shift.address ? `${shift.address.street}, ${shift.address.number}` : 'Endereço não informado'}
              </div>
              <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 12, color: C.textMute, marginTop: 1 }}>
                {shift.address ? `${shift.address.neighborhood} · ${shift.address.city}` : ''}
              </div>
            </div>
            {shift.address && (
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(`${shift.address.street} ${shift.address.number}, ${shift.address.city}`)}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  appearance: 'none', textDecoration: 'none',
                  background: C.surface3, color: C.navy,
                  border: 0, borderRadius: 10, padding: '8px 12px',
                  fontFamily: '"DM Sans", system-ui', fontSize: 12.5, fontWeight: 700,
                  display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0,
                }}
              >
                <Icon d={ICONS.route} size={14} stroke={C.navy} sw={2.2} />
                Rota
              </a>
            )}
          </div>
        </div>

        {/* cancellation policy */}
        <div style={{
          background: C.surface3, borderRadius: 14, padding: 16,
          fontFamily: '"DM Sans", system-ui', fontSize: 13, color: C.textMute, lineHeight: 1.5,
        }}>
          <strong style={{ color: C.text }}>Política de cancelamento:</strong> cancele com mais de{' '}
          <strong style={{ color: C.text }}>24h de antecedência</strong> sem afetar seu score.
          Cancelamentos tardios reduzem sua reputação na plataforma.
        </div>

        {/* application status banner */}
        {myApp && APP_STATUS_LABEL[myApp.status] && (
          <div style={{
            marginTop: 16,
            background: APP_STATUS_LABEL[myApp.status].bg,
            borderRadius: 14, padding: '14px 18px',
            fontFamily: '"DM Sans", system-ui', fontSize: 14, fontWeight: 700,
            color: APP_STATUS_LABEL[myApp.status].fg,
            textAlign: 'center',
          }}>
            {APP_STATUS_LABEL[myApp.status].label}
          </div>
        )}

        {/* error */}
        {applyMutation.isError && (
          <div style={{
            marginTop: 12, background: '#FEE2E2', borderRadius: 12, padding: '12px 16px',
            fontFamily: '"DM Sans", system-ui', fontSize: 13, color: '#991B1B', textAlign: 'center',
          }}>
            {(applyMutation.error as any)?.message ?? 'Erro ao se candidatar'}
          </div>
        )}
      </div>

      {/* ── Sticky CTA ── */}
      {canApply && (
        <div style={{
          position: 'fixed', bottom: 0, left: 240, right: 0,
          padding: '12px 32px 28px',
          background: 'linear-gradient(180deg, rgba(248,249,252,0) 0%, #F8F9FC 28%)',
          zIndex: 10,
        }}>
          <button
            onClick={() => applyMutation.mutate()}
            disabled={applyMutation.isPending}
            style={{
              width: '100%', appearance: 'none', border: 0,
              cursor: applyMutation.isPending ? 'not-allowed' : 'pointer',
              background: C.jade, color: C.jadeInk, borderRadius: 18,
              padding: '16px 20px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              fontFamily: '"DM Sans", system-ui', fontWeight: 700,
              boxShadow: '0 12px 26px rgba(0,196,140,0.38)',
              opacity: applyMutation.isPending ? 0.7 : 1,
              transition: 'all 180ms',
            }}
          >
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 17, letterSpacing: -0.3 }}>
                {applyMutation.isPending ? 'Enviando...' : 'Aceitar turno'}
              </div>
              <div style={{ fontSize: 11.5, fontWeight: 600, opacity: 0.7, marginTop: 1 }}>
                {formatCurrency(shift.worker_amount)} reservado no seu nome
              </div>
            </div>
            <div style={{
              width: 38, height: 38, borderRadius: 12,
              background: 'rgba(10,42,30,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon d={ICONS.chev} size={18} stroke={C.jadeInk} sw={2.5} />
            </div>
          </button>
        </div>
      )}

      {/* ── Success sheet ── */}
      {showSuccess && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(8,16,30,0.55)',
          backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          zIndex: 50,
        }}>
          <div style={{
            background: '#fff', width: '100%', maxWidth: 680,
            borderTopLeftRadius: 28, borderTopRightRadius: 28,
            padding: '14px 28px 40px',
            position: 'relative',
            animation: 'slideUp 360ms cubic-bezier(.2,.8,.2,1)',
          }}>
            <div style={{ width: 40, height: 4, borderRadius: 4, background: C.line, margin: '0 auto 20px' }} />
            <button onClick={() => setShowSuccess(false)} style={{
              position: 'absolute', top: 18, right: 22,
              appearance: 'none', border: 0, cursor: 'pointer',
              background: C.surface3, width: 32, height: 32, borderRadius: 999,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon d={ICONS.x} size={16} stroke={C.text} sw={2.2} />
            </button>

            {/* icon */}
            <div style={{
              width: 90, height: 90, borderRadius: 999, background: C.jadeSoft,
              margin: '8px auto 18px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
                <path d="M6 10V8a6 6 0 1 1 12 0v2M5 10h14v10H5z" stroke={C.jadeDeep} strokeWidth="2" strokeLinecap="round"/>
                <path d="M9 16l2 2 4-4" stroke={C.jadeDeep} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            <div style={{ textAlign: 'center', fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 26, fontWeight: 800, color: C.text, letterSpacing: -0.7 }}>
              Candidatura enviada!
            </div>
            <div style={{ textAlign: 'center', marginTop: 8, fontFamily: '"DM Sans", system-ui', fontSize: 14.5, color: C.textMute, lineHeight: 1.4, padding: '0 10px' }}>
              Aguarde a empresa confirmar. Quando confirmado,{' '}
              <strong style={{ color: C.jadeDeep }}>{formatCurrency(shift.worker_amount)}</strong> serão reservados no escrow para você.
            </div>

            <div style={{
              marginTop: 22, padding: 16,
              background: C.surface2, borderRadius: 14, border: `1px solid ${C.line}`,
              display: 'flex', alignItems: 'center', gap: 14,
            }}>
              <div style={{
                width: 46, height: 46, borderRadius: 13, background: bizColor, color: '#fff', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: '"Bricolage Grotesque", system-ui', fontWeight: 700, fontSize: 22,
              }}>
                {shift.business_name[0]?.toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 12.5, fontWeight: 600, color: C.textMute }}>{shift.business_name}</div>
                <div style={{ fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 16, fontWeight: 700, color: C.text, letterSpacing: -0.3 }}>{specialtyLabel(shift.specialty)}</div>
                <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 12, color: C.textMute, marginTop: 2 }}>{fmtDate(shift.starts_at)} · {fmtTime(shift.starts_at)}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button
                onClick={() => { setShowSuccess(false); router.push('/worker/applications') }}
                style={{
                  flex: 1, appearance: 'none', cursor: 'pointer',
                  background: C.surface3, color: C.text, border: 0, borderRadius: 14, padding: '14px',
                  fontFamily: '"DM Sans", system-ui', fontSize: 14, fontWeight: 700,
                }}
              >
                Ver candidaturas
              </button>
              <button
                onClick={() => setShowSuccess(false)}
                style={{
                  flex: 1, appearance: 'none', cursor: 'pointer',
                  background: C.navy, color: '#fff', border: 0, borderRadius: 14, padding: '14px',
                  fontFamily: '"DM Sans", system-ui', fontSize: 14, fontWeight: 700,
                }}
              >
                Continuar buscando
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
      `}</style>
    </div>
  )
}
