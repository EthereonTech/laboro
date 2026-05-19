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
  business: { trade_name: string; address: { city: string; neighborhood: string } }
}

function MetaPill({ icon, text }: { icon: string; text: string }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: C.surface3, color: C.textMute,
      padding: '5px 9px', borderRadius: 8,
      fontFamily: '"DM Sans", system-ui', fontSize: 12, fontWeight: 500,
    }}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
        <path d={icon} stroke={C.navy} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {text}
    </div>
  )
}

function VagaCard({ shift }: { shift: Shift }) {
  const hours = (new Date(shift.ends_at).getTime() - new Date(shift.starts_at).getTime()) / 3600000
  const letterColor = ['#1B3FA0', '#FF6B35', '#00A372', '#7C2D12', '#6D28D9'][
    shift.business.trade_name.charCodeAt(0) % 5
  ]

  return (
    <Link href={`/worker/shifts/${shift.id}`} style={{ textDecoration: 'none' }}>
      <div
        style={{
          background: '#fff', borderRadius: 18, padding: 14,
          border: `1px solid ${C.line}`,
          boxShadow: '0 2px 4px rgba(14,42,120,0.03), 0 8px 20px rgba(14,42,120,0.04)',
          cursor: 'pointer', position: 'relative',
          transition: 'all 120ms cubic-bezier(.2,.7,.2,1)',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 8px rgba(14,42,120,0.05), 0 16px 32px rgba(14,42,120,0.08)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 4px rgba(14,42,120,0.03), 0 8px 20px rgba(14,42,120,0.04)' }}
      >
        {shift.is_urgent && (
          <div style={{
            position: 'absolute', top: 14, right: 14,
            display: 'inline-flex', alignItems: 'center', gap: 4,
            background: C.orange, color: '#fff',
            padding: '4px 9px', borderRadius: 999,
            fontFamily: '"DM Sans", system-ui', fontSize: 10.5, fontWeight: 700,
            letterSpacing: 0.4, textTransform: 'uppercase',
            boxShadow: '0 4px 10px rgba(255,107,53,0.35)',
          }}>
            <svg width="9" height="11" viewBox="0 0 24 24" fill="#fff"><path d="M13 3L4 14h7l-1 7 9-11h-7l1-7Z"/></svg>
            Urgente
          </div>
        )}

        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 13, background: letterColor, color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: '"Bricolage Grotesque", system-ui', fontWeight: 700, fontSize: 20,
            flexShrink: 0,
          }}>
            {shift.business.trade_name[0]}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: '"DM Sans", system-ui', fontSize: 12.5, fontWeight: 600,
              color: C.textMute, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              paddingRight: shift.is_urgent ? 80 : 0,
            }}>
              {shift.business.trade_name}
            </div>
            <div style={{
              fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 19, fontWeight: 700,
              color: C.text, letterSpacing: -0.5, marginTop: 1, lineHeight: 1.15,
            }}>
              {specialtyLabel(shift.specialty)}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
          <MetaPill icon="M3 9h18M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm3-2v4m8-4v4" text={formatDateTime(shift.starts_at)} />
          <MetaPill icon="M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" text={`${hours.toFixed(1)}h`} />
          <MetaPill icon="M12 21s7-7 7-12a7 7 0 0 0-14 0c0 5 7 12 7 12Zm0-9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" text={`${shift.business.address.neighborhood} · ${shift.business.address.city}`} />
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginTop: 14, paddingTop: 12, borderTop: `1px dashed ${C.line}`,
        }}>
          <div>
            <div style={{
              fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 24, fontWeight: 800,
              color: C.jadeDeep, letterSpacing: -0.8, lineHeight: 1,
            }}>
              {formatCurrency(shift.total_value)}
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 4,
              fontFamily: '"DM Sans", system-ui', fontSize: 11, color: C.textSoft, marginTop: 4,
            }}>
              <svg width="10" height="11" viewBox="0 0 24 24" fill="none">
                <path d="M6 10V8a6 6 0 1 1 12 0v2M5 10h14v10H5z" stroke={C.jadeDeep} strokeWidth="2" />
              </svg>
              Reservado em escrow · {hours.toFixed(1)}h
            </div>
          </div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            background: C.jade, color: C.jadeInk,
            padding: '11px 14px', borderRadius: 12,
            fontFamily: '"DM Sans", system-ui', fontSize: 13.5, fontWeight: 700,
            boxShadow: '0 6px 14px rgba(0,196,140,0.25)',
          }}>
            Ver vaga
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M9 6l6 6-6 6" stroke={C.jadeInk} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function WorkerShiftsPage() {
  const [filter, setFilter] = useState('Todas')
  const { data: shifts, isLoading } = useQuery({
    queryKey: ['worker-shifts'],
    queryFn: () => api.get<{ data: Shift[]; meta: { total: number } }>('/shifts?limit=50'),
  })
  const { data: profile } = useQuery({
    queryKey: ['worker-profile'],
    queryFn: () => api.get<any>('/workers/me'),
  })

  const chips = ['Todas', 'Garçom', 'Bartender', 'Aux. Cozinha', 'Promotor', 'R$ 150+']
  const urgent = shifts?.data?.filter(s => s.is_urgent).length ?? 0
  const firstName = (profile?.data?.user?.full_name ?? 'Olá')

  const levelMap: Record<string, { label: string; fg: string; bg: string; icon: string }> = {
    BEGINNER: { label: 'Iniciante', fg: '#fff', bg: 'rgba(255,255,255,0.14)', icon: '◐' },
    VERIFIED: { label: 'Verificado', fg: '#7FE6C5', bg: 'rgba(0,196,140,0.16)', icon: '✓' },
    TOP_PRO:  { label: 'Top Pro', fg: '#FFB89A', bg: 'rgba(255,107,53,0.16)', icon: '★' },
  }
  const level = levelMap[profile?.data?.level ?? 'BEGINNER']

  return (
    <div style={{ background: C.surface2, minHeight: '100vh' }}>
      {/* navy header */}
      <div style={{
        background: C.navy, color: '#fff',
        padding: '40px 32px 64px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -140, right: -100, width: 320, height: 320,
          borderRadius: '50%',
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
            <div>
              <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.6)', letterSpacing: 0.1 }}>
                Olá,
              </div>
              <div style={{ fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 26, fontWeight: 700, letterSpacing: -0.6, marginTop: 2 }}>
                {firstName}
              </div>
            </div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              background: level.bg, color: level.fg,
              padding: '6px 12px', borderRadius: 999,
              fontFamily: '"DM Sans", system-ui', fontSize: 13, fontWeight: 600,
            }}>
              <span>{level.icon}</span>{level.label}
            </div>
          </div>

          {/* score glass card */}
          <div style={{
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.10)',
            borderRadius: 18, padding: 16,
            backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          }}>
            <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.55)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 14 }}>
              Seu score
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: '"Bricolage Grotesque", system-ui', fontWeight: 700, fontSize: 22, color: '#fff', letterSpacing: -0.7, lineHeight: 1 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill={C.jade}><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.2L12 17l-5.4 3 1-6.2L3.2 9.5l6.1-.9L12 3Z"/></svg>
                  {Number(profile?.data?.score ?? 0).toFixed(1)}
                </div>
                <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 11.5, color: 'rgba(255,255,255,0.55)', marginTop: 5 }}>nota</div>
              </div>
              <div>
                <div style={{ fontFamily: '"Bricolage Grotesque", system-ui', fontWeight: 700, fontSize: 22, color: '#fff', letterSpacing: -0.7, lineHeight: 1 }}>
                  {profile?.data?.total_shifts ?? 0}
                </div>
                <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 11.5, color: 'rgba(255,255,255,0.55)', marginTop: 5 }}>turnos</div>
              </div>
              <div>
                <div style={{ fontFamily: '"Bricolage Grotesque", system-ui', fontWeight: 700, fontSize: 18, color: '#fff', letterSpacing: -0.7, lineHeight: 1 }}>
                  {formatCurrency(profile?.data?.earnings_month ?? 0)}
                </div>
                <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 11.5, color: 'rgba(255,255,255,0.55)', marginTop: 5 }}>este mês</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* content pulling up */}
      <div style={{
        marginTop: -32,
        background: C.surface2,
        borderTopLeftRadius: 28, borderTopRightRadius: 28,
        paddingTop: 24, position: 'relative', zIndex: 2,
        minHeight: 'calc(100vh - 240px)',
        padding: '24px 32px 40px',
      }}>
        {/* section header */}
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <div style={{ fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 22, fontWeight: 700, color: C.text, letterSpacing: -0.6 }}>
              Vagas para você
            </div>
            <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 12.5, color: C.textSoft, marginTop: 2 }}>
              {urgent > 0 && <span style={{ color: C.orange, fontWeight: 700 }}>{urgent} urgente{urgent > 1 ? 's' : ''} · </span>}
              {shifts?.meta?.total ?? 0} disponíveis
            </div>
          </div>
        </div>

        {/* filter chips */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {chips.map(c => {
            const isActive = c === filter
            return (
              <button
                key={c}
                onClick={() => setFilter(c)}
                style={{
                  appearance: 'none', cursor: 'pointer',
                  background: isActive ? C.navy : '#fff',
                  color: isActive ? '#fff' : C.text,
                  border: `1px solid ${isActive ? C.navy : C.line}`,
                  borderRadius: 999, padding: '8px 14px',
                  fontFamily: '"DM Sans", system-ui', fontSize: 13.5, fontWeight: 600,
                  transition: 'all 120ms',
                }}
              >
                {c}
              </button>
            )
          })}
        </div>

        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              border: `3px solid ${C.jade}`, borderTopColor: 'transparent',
              animation: 'spin 0.8s linear infinite',
            }} />
          </div>
        ) : !shifts?.data?.length ? (
          <div style={{
            background: '#fff', borderRadius: 20, padding: '48px 24px',
            textAlign: 'center', border: `1px solid ${C.line}`,
          }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
            <div style={{ fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 18, fontWeight: 700, color: C.text }}>Nenhuma vaga disponível</div>
            <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 14, color: C.textMute, marginTop: 6 }}>Novas vagas aparecem aqui assim que forem publicadas</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))' }}>
            {shifts.data.map(shift => <VagaCard key={shift.id} shift={shift} />)}
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
