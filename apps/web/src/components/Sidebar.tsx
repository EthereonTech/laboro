'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'

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
      <path
        d={d}
        stroke={active ? '#0E2A78' : '#8A8FA6'}
        strokeWidth={active ? 2.2 : 1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function Sidebar({ type }: { type: 'worker' | 'business' }) {
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useAuthStore()
  const nav = type === 'worker' ? workerNav : businessNav

  async function handleLogout() {
    await logout()
    router.replace('/login')
  }

  return (
    <aside style={{
      display: 'flex', flexDirection: 'column',
      width: 240, height: '100vh', flexShrink: 0,
      background: '#fff', borderRight: '1px solid #EFF1F7',
    }}>
      {/* Logo */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '20px 20px 18px',
        borderBottom: '1px solid #EFF1F7',
      }}>
        <svg width={26} height={26} viewBox="0 0 64 64" fill="none">
          <rect x="8" y="6" width="12" height="40" rx="3" fill="#0E2A78" opacity="0.9" />
          <rect x="8" y="42" width="44" height="13" rx="3" fill="#0E2A78" opacity="0.15" />
          <rect x="8" y="42" width="31" height="13" rx="3" fill="#0E2A78" opacity="0.6" />
          <circle cx="48" cy="48.5" r="6.5" fill="#00C48C" />
        </svg>
        <span style={{
          fontFamily: '"Bricolage Grotesque", system-ui',
          fontWeight: 800, fontSize: 21, letterSpacing: -1, color: '#0E2A78',
          lineHeight: 1,
        }}>
          laboro<span style={{ color: '#00C48C' }}>.</span>
        </span>
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
                transition: 'background 100ms',
                position: 'relative',
              }}
              onMouseEnter={e => {
                if (!isActive) (e.currentTarget as HTMLElement).style.background = '#F8F9FC'
              }}
              onMouseLeave={e => {
                if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent'
              }}
            >
              {isActive && (
                <span style={{
                  position: 'absolute', left: 0, top: '20%', bottom: '20%',
                  width: 3, borderRadius: '0 2px 2px 0', background: '#0E2A78',
                }} />
              )}
              <NavIcon d={item.icon} active={isActive} />
              <span style={{
                fontFamily: '"DM Sans", system-ui',
                fontSize: 14, fontWeight: isActive ? 700 : 500,
                color: isActive ? '#0E2A78' : '#5C6079',
                letterSpacing: -0.1,
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
                background: '#00C48C', color: '#0A2A1E',
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
                el.style.background = '#00C48C'
              }}
            >
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14M5 12h14" stroke="#0A2A1E" strokeWidth={2.4} strokeLinecap="round" />
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
          onMouseEnter={e => {
            e.currentTarget.style.background = '#FFF1E9'
            e.currentTarget.style.color = '#C2511A'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = '#8A8FA6'
          }}
        >
          <svg width={17} height={17} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
            <path
              d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"
              stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
            />
          </svg>
          Sair da conta
        </button>
      </div>
    </aside>
  )
}
