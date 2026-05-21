'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'

type Step = 'pick' | 'form'
type Mode = 'login' | 'register'
type UserType = 'worker' | 'business'

const C = {
  navy: '#0E2A78', jade: '#00C48C', jadeDeep: '#00A372', jadeInk: '#0A2A1E',
  orange: '#FF6B35', text: '#1A1A2E', textMute: '#5C6079', textSoft: '#8A8FA6',
  line: '#E6E8F0', surface2: '#F8F9FC',
}

function LaboroMark({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <rect x="8" y="6" width="12" height="40" rx="3" fill="#fff" opacity="0.9" />
      <rect x="8" y="42" width="44" height="13" rx="3" fill="#fff" opacity="0.15" />
      <rect x="8" y="42" width="31" height="13" rx="3" fill="#fff" opacity="0.6" />
      <circle cx="48" cy="48.5" r="6.5" fill="#00C48C" />
    </svg>
  )
}

function InputField({ label, type, value, onChange, placeholder }: {
  label: string; type: string; value: string
  onChange: (v: string) => void; placeholder: string
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{
        fontFamily: '"DM Sans", system-ui', fontSize: 12, fontWeight: 700,
        color: C.textSoft, letterSpacing: 0.5, textTransform: 'uppercase',
        display: 'block', marginBottom: 6,
      }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%', appearance: 'none', outline: 0,
          border: `1.5px solid ${C.line}`, borderRadius: 14,
          padding: '13px 16px',
          fontFamily: '"DM Sans", system-ui', fontSize: 15, fontWeight: 500, color: C.text,
          background: '#fff', transition: 'border-color 120ms', boxSizing: 'border-box',
        }}
        onFocus={e => (e.target.style.borderColor = C.navy)}
        onBlur={e => (e.target.style.borderColor = C.line)}
      />
    </div>
  )
}

function PasswordField({ label, value, onChange, placeholder }: {
  label: string; value: string
  onChange: (v: string) => void; placeholder: string
}) {
  const [visible, setVisible] = useState(false)

  // eye-open / eye-closed paths
  const eyeOpen  = 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z'
  const eyeClosed = 'M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M1 1l22 22'

  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{
        fontFamily: '"DM Sans", system-ui', fontSize: 12, fontWeight: 700,
        color: C.textSoft, letterSpacing: 0.5, textTransform: 'uppercase',
        display: 'block', marginBottom: 6,
      }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: '100%', appearance: 'none', outline: 0,
            border: `1.5px solid ${C.line}`, borderRadius: 14,
            padding: '13px 48px 13px 16px',
            fontFamily: '"DM Sans", system-ui', fontSize: 15, fontWeight: 500, color: C.text,
            background: '#fff', transition: 'border-color 120ms', boxSizing: 'border-box',
          }}
          onFocus={e => (e.target.style.borderColor = C.navy)}
          onBlur={e => (e.target.style.borderColor = C.line)}
        />
        <button
          type="button"
          onClick={() => setVisible(v => !v)}
          tabIndex={-1}
          style={{
            position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
            appearance: 'none', border: 0, background: 'transparent', cursor: 'pointer',
            padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: visible ? C.navy : C.textSoft,
            transition: 'color 120ms',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = C.navy }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = visible ? C.navy : C.textSoft }}
          aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
        >
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <path d={visible ? eyeOpen : eyeClosed} stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const { login, register } = useAuthStore()
  const [step, setStep] = useState<Step>('pick')
  const [userType, setUserType] = useState<UserType>('worker')
  const [mode, setMode] = useState<Mode>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function pickType(t: UserType) {
    setUserType(t)
    setStep('form')
  }

  async function handleSubmit() {
    setError(''); setLoading(true)
    try {
      if (mode === 'register') {
        if (!name.trim()) { setError('Nome obrigatório'); setLoading(false); return }
        const { isNew } = await register(email, password, name.trim(), userType)
        if (isNew && userType === 'worker') { router.replace('/worker/profile?setup=1'); return }
        if (isNew && userType === 'business') { router.replace('/business/profile?setup=1'); return }
      } else {
        await login(email, password, userType)
      }
      router.replace(userType === 'business' ? '/business' : '/worker')
    } catch (e: any) {
      setError(e.message)
    } finally { setLoading(false) }
  }

  return (
    <div style={{
      minHeight: '100vh', width: '100%',
      background: C.navy,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: -140, right: -120, width: 420, height: 420,
        borderRadius: '50%',
        background: 'radial-gradient(closest-side, rgba(0,196,140,0.32), rgba(0,196,140,0) 70%)',
        filter: 'blur(2px)', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)',
        backgroundSize: '18px 18px',
        maskImage: 'linear-gradient(180deg, transparent, #000 30%, #000 70%, transparent)',
        WebkitMaskImage: 'linear-gradient(180deg, transparent, #000 30%, #000 70%, transparent)',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: 14, marginBottom: 40 }}>
        <LaboroMark size={52} />
        <span style={{
          fontFamily: '"Bricolage Grotesque", system-ui', fontWeight: 800, fontSize: 44,
          letterSpacing: -2, lineHeight: 1, color: '#fff',
        }}>
          laboro<span style={{ color: C.jade }}>.</span>
        </span>
      </div>

      <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 440 }}>

        {step === 'pick' && (
          <>
            <div style={{ marginBottom: 28, textAlign: 'center' }}>
              <div style={{
                fontFamily: '"Bricolage Grotesque", system-ui', fontWeight: 700, fontSize: 28,
                letterSpacing: -1, color: '#fff', lineHeight: 1.1,
              }}>
                Seu próximo turno<br/>começa <span style={{ color: C.jade }}>agora.</span>
              </div>
              <div style={{
                fontFamily: '"DM Sans", system-ui', fontSize: 15, color: 'rgba(255,255,255,0.62)',
                marginTop: 10, lineHeight: 1.45,
              }}>
                Marketplace de trabalho por turno com pagamento garantido em escrow.
              </div>
            </div>

            <button onClick={() => pickType('worker')} style={{
              width: '100%', appearance: 'none', border: 0, textAlign: 'left', cursor: 'pointer',
              background: C.jade, borderRadius: 22, padding: '18px 20px',
              display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12,
              boxShadow: '0 8px 22px rgba(0,196,140,0.28)', fontFamily: '"DM Sans", system-ui',
            }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                  <path d="M3 18h18v2H3v-2Zm2-2c0-4 3-7 7-7s7 3 7 7H5Z" stroke="#0A2A1E" strokeWidth="1.8" strokeLinejoin="round"/>
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#0A2A1E', letterSpacing: -0.3 }}>Sou trabalhador</div>
                <div style={{ fontSize: 13.5, color: 'rgba(10,42,30,0.72)', marginTop: 2 }}>Encontre turnos perto de você</div>
              </div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="#0A2A1E" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>

            <button onClick={() => pickType('business')} style={{
              width: '100%', appearance: 'none', textAlign: 'left', cursor: 'pointer',
              border: '1px solid rgba(255,255,255,0.18)', background: 'rgba(255,255,255,0.06)',
              backdropFilter: 'blur(10px)', borderRadius: 22, padding: '18px 20px',
              display: 'flex', alignItems: 'center', gap: 14, fontFamily: '"DM Sans", system-ui',
            }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(255,255,255,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                  <path d="M4 9l1-4h14l1 4v1a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0V9Z" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round"/>
                  <path d="M5 12v8h14v-8" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round"/>
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 18, fontWeight: 600, color: '#fff', letterSpacing: -0.3 }}>Sou empresa</div>
                <div style={{ fontSize: 13.5, color: 'rgba(248,249,252,0.62)', marginTop: 2 }}>Contrate turno por diária ou hora</div>
              </div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 14px', background: 'rgba(0,196,140,0.10)',
                border: '1px solid rgba(0,196,140,0.28)', borderRadius: 999,
              }}>
                <svg width="13" height="15" viewBox="0 0 14 16" fill="none">
                  <path d="M3 7V5a4 4 0 1 1 8 0v2" stroke={C.jade} strokeWidth="1.6" strokeLinecap="round"/>
                  <rect x="1.5" y="7" width="11" height="8" rx="2" stroke={C.jade} strokeWidth="1.6"/>
                  <circle cx="7" cy="11" r="1.2" fill={C.jade}/>
                </svg>
                <span style={{ color: '#7FE6C5', fontSize: 12.5, fontWeight: 600, fontFamily: '"DM Sans", system-ui' }}>
                  Pagamento garantido via Pix
                </span>
              </div>
            </div>
          </>
        )}

        {step === 'form' && (
          <div style={{
            background: '#fff', borderRadius: 24, padding: '28px 28px 32px',
            boxShadow: '0 20px 60px rgba(8,28,87,0.3)',
          }}>
            <button onClick={() => { setStep('pick'); setError('') }} style={{
              appearance: 'none', border: 0, background: 'transparent', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
              fontFamily: '"DM Sans", system-ui', fontSize: 13, fontWeight: 600,
              color: C.textMute, marginBottom: 20, padding: 0,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Voltar
            </button>

            <div style={{ fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 22, fontWeight: 700, color: C.text, letterSpacing: -0.5, marginBottom: 4 }}>
              {mode === 'login' ? 'Entrar' : 'Criar conta'}
            </div>
            <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 13.5, color: C.textMute, marginBottom: 22 }}>
              {userType === 'worker' ? 'Conta de trabalhador' : 'Conta de empresa'}
            </div>

            {mode === 'register' && (
              <InputField label="Nome completo" type="text" value={name} onChange={setName} placeholder="Seu nome" />
            )}
            <InputField label="E-mail" type="email" value={email} onChange={setEmail} placeholder="seu@email.com" />
            <PasswordField label="Senha" value={password} onChange={setPassword} placeholder="••••••••" />

            {error && (
              <p style={{ fontFamily: '"DM Sans", system-ui', fontSize: 13, color: '#C2511A', marginBottom: 12, marginTop: -4 }}>
                {error}
              </p>
            )}

            <button onClick={handleSubmit} disabled={loading} style={{
              width: '100%', appearance: 'none', border: 0, cursor: loading ? 'not-allowed' : 'pointer',
              background: C.jade, color: C.jadeInk, borderRadius: 14, padding: '15px 20px',
              fontFamily: '"DM Sans", system-ui', fontSize: 15, fontWeight: 700,
              boxShadow: '0 8px 20px rgba(0,196,140,0.30)',
              opacity: loading ? 0.7 : 1, marginBottom: 16,
            }}>
              {loading ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar conta'}
            </button>

            <div style={{ textAlign: 'center', fontFamily: '"DM Sans", system-ui', fontSize: 13.5, color: C.textMute }}>
              {mode === 'login' ? 'Não tem conta? ' : 'Já tem conta? '}
              <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }} style={{
                appearance: 'none', border: 0, background: 'transparent', cursor: 'pointer',
                color: C.navy, fontWeight: 700, fontSize: 13.5, fontFamily: '"DM Sans", system-ui', padding: 0,
              }}>
                {mode === 'login' ? 'Criar conta' : 'Entrar'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
