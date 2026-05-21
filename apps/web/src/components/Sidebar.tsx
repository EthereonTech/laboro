'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { specialtyLabel, formatDateTime } from '@/lib/format'
import { useState, useEffect, useRef } from 'react'

const C = {
  navy: '#0E2A78', jade: '#00C48C', jadeInk: '#0A2A1E',
  text: '#1A1A2E', textMute: '#5C6079', textSoft: '#8A8FA6',
  line: '#E6E8F0', lineSoft: '#EFF1F7', surface2: '#F8F9FC', surface3: '#F1F3F9',
}

type NavItem = { href: string; label: string; icon: string; exact?: boolean }

const workerNav: NavItem[] = [
  { href: '/worker',              label: 'Vagas',       icon: 'M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-4v-7h-6v7H5a1 1 0 0 1-1-1v-9Z', exact: true },
  { href: '/worker/applications', label: 'Meus turnos', icon: 'M3 9h18M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm3-2v4m8-4v4' },
  { href: '/worker/history',      label: 'Carteira',    icon: 'M3 7a2 2 0 0 1 2-2h13l3 4v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Zm14 5a1.5 1.5 0 1 0 0 3h4v-3h-4Z' },
  { href: '/worker/profile',      label: 'Perfil',      icon: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 9a7 7 0 0 1 14 0' },
]

const businessNav: NavItem[] = [
  { href: '/business',          label: 'Início',     icon: 'M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-4v-7h-6v7H5a1 1 0 0 1-1-1v-9Z', exact: true },
  { href: '/business/shifts',   label: 'Vagas',      icon: 'M4 8h16v12H4zM8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 14h18' },
  { href: '/business/history',  label: 'Financeiro', icon: 'M3 7a2 2 0 0 1 2-2h13l3 4v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Zm14 5a1.5 1.5 0 1 0 0 3h4v-3h-4Z' },
  { href: '/business/profile',  label: 'Empresa',    icon: 'M4 9l1-4h14l1 4v1a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0V9ZM5 12v8h14v-8M10 20v-4h4v4' },
]

function NavIcon({ d, active }: { d: string; active: boolean }) {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
      <path d={d} stroke={active ? C.navy : '#8A8FA6'} strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

type Notif = { id: string; title: string; body: string; href: string; time?: string; type: 'candidate' | 'confirmed' | 'payment' | 'info' }

function useNotifications(type: 'worker' | 'business') {
  const { data: dashboard } = useQuery({
    queryKey: ['business-dashboard'],
    queryFn: () => api.get<any>('/businesses/me/dashboard'),
    enabled: type === 'business',
    refetchInterval: 30000,
  })

  const { data: applications } = useQuery({
    queryKey: ['worker-applications'],
    queryFn: () => api.get<any[]>('/workers/me/applications'),
    enabled: type === 'worker',
    refetchInterval: 30000,
  })

  const notifications: Notif[] = []

  if (type === 'business' && dashboard) {
    const shifts: any[] = dashboard.active_shifts ?? []
    shifts.forEach((shift: any) => {
      const pending = (shift.applications ?? []).filter((a: any) => a.status === 'PENDING')
      pending.forEach((app: any) => {
        notifications.push({
          id: `app-${app.id}`,
          type: 'candidate',
          title: 'Novo candidato',
          body: `${app.worker?.user?.full_name ?? 'Trabalhador'} se candidatou à vaga de ${specialtyLabel(shift.specialty)}`,
          href: `/business/shifts/${shift.id}`,
          time: app.created_at,
        })
      })
    })
  }

  if (type === 'worker' && Array.isArray(applications)) {
    applications.forEach((app: any) => {
      if (app.status === 'CONFIRMED') {
        notifications.push({
          id: `app-${app.id}`,
          type: 'confirmed',
          title: 'Turno confirmado!',
          body: `${app.shift?.business_name ?? 'Empresa'} confirmou sua candidatura para ${specialtyLabel(app.shift?.specialty)}`,
          href: `/worker/shifts/${app.shift?.id}`,
          time: app.shift?.starts_at,
        })
      } else if (app.status === 'PENDING') {
        notifications.push({
          id: `app-${app.id}`,
          type: 'info',
          title: 'Candidatura enviada',
          body: `Aguardando confirmação da empresa para ${specialtyLabel(app.shift?.specialty)}`,
          href: `/worker/shifts/${app.shift?.id}`,
          time: app.created_at,
        })
      }
    })
  }

  return notifications
}

const NOTIF_COLORS: Record<Notif['type'], { bg: string; fg: string; dot: string }> = {
  candidate: { bg: '#E8F3FF', fg: C.navy,    dot: C.navy },
  confirmed: { bg: '#E6FAF3', fg: '#00805B', dot: C.jade },
  payment:   { bg: '#FFF7E6', fg: '#92400E', dot: '#F59E0B' },
  info:      { bg: C.surface3, fg: C.textMute, dot: '#9AA0B7' },
}

function timeAgo(iso?: string) {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'agora'
  if (m < 60) return `${m}min atrás`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h atrás`
  return `${Math.floor(h / 24)}d atrás`
}

function NotificationPanel({ type, onClose }: { type: 'worker' | 'business'; onClose: () => void }) {
  const notifications = useNotifications(type)
  const router = useRouter()

  return (
    <>
      {/* backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 49,
          background: 'rgba(10,15,31,0.25)',
          backdropFilter: 'blur(2px)',
        }}
      />

      {/* panel */}
      <div style={{
        position: 'fixed', left: 240, top: 0, bottom: 0, width: 360, zIndex: 50,
        background: '#fff', borderLeft: `1px solid ${C.line}`,
        boxShadow: '8px 0 32px rgba(14,42,120,0.10)',
        display: 'flex', flexDirection: 'column',
        animation: 'slideInLeft 180ms ease',
      }}>
        {/* header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 20px 16px',
          borderBottom: `1px solid ${C.lineSoft}`,
        }}>
          <div>
            <div style={{ fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 18, fontWeight: 800, color: C.text, letterSpacing: -0.4 }}>
              Notificações
            </div>
            <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 12, color: C.textSoft, marginTop: 2 }}>
              {notifications.length > 0 ? `${notifications.length} pendente${notifications.length !== 1 ? 's' : ''}` : 'Tudo em dia'}
            </div>
          </div>
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

        {/* list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 0' }}>
          {notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '52px 24px' }}>
              <svg width={48} height={48} viewBox="0 0 24 24" fill="none" style={{ margin: '0 auto 14px', display: 'block', opacity: 0.2 }}>
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" stroke={C.navy} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div style={{ fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 4 }}>
                Sem notificações
              </div>
              <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 13, color: C.textMute }}>
                Você está em dia com tudo!
              </div>
            </div>
          ) : (
            notifications.map((n, i) => {
              const col = NOTIF_COLORS[n.type]
              return (
                <div
                  key={n.id}
                  onClick={() => { router.push(n.href); onClose() }}
                  style={{
                    display: 'flex', gap: 12, padding: '12px 20px', cursor: 'pointer',
                    borderBottom: i < notifications.length - 1 ? `1px solid ${C.lineSoft}` : 'none',
                    transition: 'background 100ms',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = C.surface2)}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  {/* dot icon */}
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                    background: col.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginTop: 2,
                  }}>
                    {n.type === 'candidate' && (
                      <svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke={col.fg} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                    {n.type === 'confirmed' && (
                      <svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4 12 14.01l-3-3" stroke={col.fg} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                    {n.type === 'info' && (
                      <svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke={col.fg} strokeWidth={2} />
                        <path d="M12 16v-4M12 8h.01" stroke={col.fg} strokeWidth={2} strokeLinecap="round" />
                      </svg>
                    )}
                    {n.type === 'payment' && (
                      <svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke={col.fg} strokeWidth={2} strokeLinecap="round" />
                      </svg>
                    )}
                  </div>

                  {/* content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 2 }}>
                      {n.title}
                    </div>
                    <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 12.5, color: C.textMute, lineHeight: 1.45 }}>
                      {n.body}
                    </div>
                    {n.time && (
                      <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 11, color: C.textSoft, marginTop: 4 }}>
                        {timeAgo(n.time)}
                      </div>
                    )}
                  </div>

                  {/* unread dot */}
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: col.dot, flexShrink: 0, marginTop: 6 }} />
                </div>
              )
            })
          )}
        </div>

        {/* footer */}
        {notifications.length > 0 && (
          <div style={{ padding: '12px 20px', borderTop: `1px solid ${C.lineSoft}` }}>
            <Link
              href={type === 'business' ? '/business/shifts' : '/worker/applications'}
              onClick={onClose}
              style={{
                display: 'block', textAlign: 'center',
                fontFamily: '"DM Sans", system-ui', fontSize: 13, fontWeight: 600, color: C.navy,
                textDecoration: 'none', padding: '8px', borderRadius: 8,
                transition: 'background 100ms',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = C.surface2)}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              Ver tudo
            </Link>
          </div>
        )}
      </div>

      <style>{`@keyframes slideInLeft { from { transform: translateX(-20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
    </>
  )
}

function BellIcon({ size = 18, stroke = '#8A8FA6' }: { size?: number; stroke?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" stroke={stroke} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function Sidebar({ type }: { type: 'worker' | 'business' }) {
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useAuthStore()
  const nav = type === 'worker' ? workerNav : businessNav
  const [notifOpen, setNotifOpen] = useState(false)
  const notifications = useNotifications(type)
  const count = notifications.length

  async function handleLogout() {
    await logout()
    router.replace('/login')
  }

  return (
    <>
      <aside style={{
        display: 'flex', flexDirection: 'column',
        width: 240, height: '100vh', flexShrink: 0,
        background: '#fff', borderRight: '1px solid #EFF1F7',
        zIndex: notifOpen ? 51 : 1,
        position: 'relative',
      }}>
        {/* Logo + Bell */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 16px 18px',
          borderBottom: '1px solid #EFF1F7',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width={26} height={26} viewBox="0 0 64 64" fill="none">
              <rect x="8" y="6" width="12" height="40" rx="3" fill="#0E2A78" opacity="0.9" />
              <rect x="8" y="42" width="44" height="13" rx="3" fill="#0E2A78" opacity="0.15" />
              <rect x="8" y="42" width="31" height="13" rx="3" fill="#0E2A78" opacity="0.6" />
              <circle cx="48" cy="48.5" r="6.5" fill="#00C48C" />
            </svg>
            <span style={{
              fontFamily: '"Bricolage Grotesque", system-ui',
              fontWeight: 800, fontSize: 21, letterSpacing: -1, color: '#0E2A78', lineHeight: 1,
            }}>
              laboro<span style={{ color: '#00C48C' }}>.</span>
            </span>
          </div>

          {/* Bell button */}
          <button
            onClick={() => setNotifOpen(v => !v)}
            style={{
              position: 'relative', appearance: 'none', border: 0, cursor: 'pointer',
              width: 34, height: 34, borderRadius: 9, flexShrink: 0,
              background: notifOpen ? C.surface3 : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 100ms',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = C.surface3)}
            onMouseLeave={e => { if (!notifOpen) e.currentTarget.style.background = 'transparent' }}
            title="Notificações"
          >
            <BellIcon stroke={notifOpen ? C.navy : '#8A8FA6'} />
            {count > 0 && (
              <span style={{
                position: 'absolute', top: 3, right: 3,
                minWidth: 16, height: 16, borderRadius: 8,
                background: '#EF4444', color: '#fff',
                fontFamily: '"DM Sans", system-ui', fontSize: 9, fontWeight: 800,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '0 3px',
                boxShadow: '0 0 0 2px #fff',
              }}>
                {count > 9 ? '9+' : count}
              </span>
            )}
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {nav.map((item) => {
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex', alignItems: 'center', gap: 9,
                  padding: '9px 11px', borderRadius: 10, textDecoration: 'none',
                  background: isActive ? '#EFF1F7' : 'transparent',
                  transition: 'background 100ms', position: 'relative',
                }}
                onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = '#F8F9FC' }}
                onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
              >
                {isActive && (
                  <span style={{
                    position: 'absolute', left: 0, top: '20%', bottom: '20%',
                    width: 3, borderRadius: '0 2px 2px 0', background: C.navy,
                  }} />
                )}
                <NavIcon d={item.icon} active={isActive} />
                <span style={{
                  fontFamily: '"DM Sans", system-ui',
                  fontSize: 14, fontWeight: isActive ? 700 : 500,
                  color: isActive ? C.navy : '#5C6079', letterSpacing: -0.1,
                }}>
                  {item.label}
                </span>
              </Link>
            )
          })}

          {/* CTA — only for business */}
          {type === 'business' && (
            <div style={{ marginTop: 10 }}>
              <Link
                href="/business/shifts/create"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                  padding: '10px 16px', borderRadius: 12, textDecoration: 'none',
                  background: C.jade, color: C.jadeInk,
                  fontFamily: '"DM Sans", system-ui', fontWeight: 700, fontSize: 13.5,
                  boxShadow: '0 4px 12px rgba(0,196,140,0.22)',
                  transition: 'box-shadow 120ms, background 120ms',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.boxShadow = '0 6px 18px rgba(0,196,140,0.36)'
                  el.style.background = '#00b580'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.boxShadow = '0 4px 12px rgba(0,196,140,0.22)'
                  el.style.background = C.jade
                }}
              >
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                  <path d="M12 5v14M5 12h14" stroke={C.jadeInk} strokeWidth={2.4} strokeLinecap="round" />
                </svg>
                Postar vaga
              </Link>
            </div>
          )}
        </nav>

        {/* Logout */}
        <div style={{ padding: '12px 10px 20px', borderTop: '1px solid #EFF1F7' }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%', appearance: 'none', border: 0, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 9,
              padding: '9px 11px', borderRadius: 10, background: 'transparent',
              fontFamily: '"DM Sans", system-ui', fontSize: 14, fontWeight: 500,
              color: '#8A8FA6', transition: 'all 100ms', textAlign: 'left',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#FFF1E9'; e.currentTarget.style.color = '#C2511A' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#8A8FA6' }}
          >
            <svg width={17} height={17} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Sair da conta
          </button>
        </div>
      </aside>

      {notifOpen && (
        <NotificationPanel type={type} onClose={() => setNotifOpen(false)} />
      )}
    </>
  )
}
