'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'

type Step = 'pick' | 'phone' | 'otp'
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

export default function LoginPage() {
  const router = useRouter()
  const { sendOtp, verifyOtp } = useAuthStore()
  const [step, setStep] = useState<Step>('pick')
  const [userType, setUserType] = useState<UserType>('worker')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function formatPhone(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 11)
    if (digits.length <= 2) return digits
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  }

  function pickType(t: UserType) {
    setUserType(t)
    setStep('phone')
  }

  async function handleSendOtp() {
    const digits = phone.replace(/\D/g, '')
    if (digits.length < 10) { setError('Número inválido'); return }
    setError(''); setLoading(true)
    try {
      await sendOtp(`+55${digits}`, userType)
      setStep('otp')
    } catch (e: any) {
      setError(e.message)
    } finally { setLoading(false) }
  }

  async function handleVerify() {
    if (code.length !== 6) { setError('Código deve ter 6 dígitos'); return }
    setError(''); setLoading(true)
    try {
      const digits = phone.replace(/\D/g, '')
      const { isNew } = await verifyOtp(`+55${digits}`, code, userType)
      if (isNew && userType === 'worker') { router.replace('/worker/profile?setup=1'); return }
      if (isNew && userType === 'business') { router.replace('/business/profile?setup=1'); return }
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
      {/* background glows */}
      <div style={{
        position: 'absolute', top: -140, right: -120, width: 420, height: 420,
        borderRadius: '50%',
        background: 'radial-gradient(closest-side, rgba(0,196,140,0.32), rgba(0,196,140,0) 70%)',
        filter: 'blur(2px)', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: -200, left: -160, width: 500, height: 500,
        borderRadius: '50%',
        background: 'radial-gradient(closest-side, rgba(27,63,160,0.85), rgba(8,28,87,0) 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)',
        backgroundSize: '18px 18px',
        maskImage: 'linear-gradient(180deg, transparent, #000 30%, #000 70%, transparent)',
        WebkitMaskImage: 'linear-gradient(180deg, transparent, #000 30%, #000 70%, transparent)',
        pointerEvents: 'none',
      }} />

      {/* brand */}
      <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: 14, marginBottom: 40 }}>
        <LaboroMark size={52} />
        <span style={{
          fontFamily: '"Bricolage Grotesque", system-ui', fontWeight: 800, fontSize: 44,
          letterSpacing: -2, lineHeight: 1, color: '#fff',
        }}>
          laboro<span style={{ color: C.jade }}>.</span>
        </span>
      </div>

      {/* card area */}
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

            {/* worker card */}
            <button
              onClick={() => pickType('worker')}
              style={{
                width: '100%', appearance: 'none', border: 0, textAlign: 'left', cursor: 'pointer',
                background: C.jade, borderRadius: 22, padding: '18px 20px',
                display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12,
                boxShadow: '0 8px 22px rgba(0,196,140,0.28), inset 0 1px 0 rgba(255,255,255,0.3)',
                transition: 'all 180ms cubic-bezier(.2,.7,.2,1)',
                fontFamily: '"DM Sans", system-ui',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 14px 30px rgba(0,196,140,0.45), inset 0 1px 0 rgba(255,255,255,0.3)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 22px rgba(0,196,140,0.28), inset 0 1px 0 rgba(255,255,255,0.3)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: 'rgba(255,255,255,0.18)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                  <path d="M3 18h18v2H3v-2Zm2-2c0-4 3-7 7-7s7 3 7 7H5Z" stroke="#0A2A1E" strokeWidth="1.8" strokeLinejoin="round"/>
                  <path d="M10 9V6h4v3" stroke="#0A2A1E" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#0A2A1E', letterSpacing: -0.3, lineHeight: 1.15 }}>Sou trabalhador</div>
                <div style={{ fontSize: 13.5, color: 'rgba(10,42,30,0.72)', marginTop: 2 }}>Encontre turnos perto de você</div>
              </div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M9 6l6 6-6 6" stroke="#0A2A1E" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {/* business card */}
            <button
              onClick={() => pickType('business')}
              style={{
                width: '100%', appearance: 'none', textAlign: 'left', cursor: 'pointer',
                border: '1px solid rgba(255,255,255,0.18)',
                background: 'rgba(255,255,255,0.06)',
                backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
                borderRadius: 22, padding: '18px 20px',
                display: 'flex', alignItems: 'center', gap: 14,
                transition: 'all 180ms cubic-bezier(.2,.7,.2,1)',
                fontFamily: '"DM Sans", system-ui',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.10)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.10)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                  <path d="M4 9l1-4h14l1 4v1a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0V9Z" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round"/>
                  <path d="M5 12v8h14v-8" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round"/>
                  <path d="M10 20v-4h4v4" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round"/>
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 18, fontWeight: 600, color: '#fff', letterSpacing: -0.3, lineHeight: 1.15 }}>Sou empresa</div>
                <div style={{ fontSize: 13.5, color: 'rgba(248,249,252,0.62)', marginTop: 2 }}>Contrate turno por diária ou hora</div>
              </div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M9 6l6 6-6 6" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {/* trust pill */}
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

        {step === 'phone' && (
          <div style={{
            background: '#fff', borderRadius: 24, padding: '28px 28px 32px',
            boxShadow: '0 20px 60px rgba(8,28,87,0.3)',
          }}>
            <button
              onClick={() => { setStep('pick'); setError('') }}
              style={{
                appearance: 'none', border: 0, background: 'transparent', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
                fontFamily: '"DM Sans", system-ui', fontSize: 13, fontWeight: 600,
                color: C.textMute, marginBottom: 20, padding: 0,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Voltar
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: userType === 'worker' ? '#E6FAF3' : '#EFF1F7',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {userType === 'worker'
                  ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 18h18v2H3v-2Zm2-2c0-4 3-7 7-7s7 3 7 7H5Z" stroke={C.jadeDeep} strokeWidth="1.8" strokeLinejoin="round"/></svg>
                  : <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 9l1-4h14l1 4v1a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0V9Z" stroke={C.navy} strokeWidth="1.8" strokeLinejoin="round"/></svg>
                }
              </div>
              <div>
                <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 11.5, fontWeight: 600, color: C.textSoft, letterSpacing: 0.4, textTransform: 'uppercase' }}>
                  {userType === 'worker' ? 'Trabalhador' : 'Empresa'}
                </div>
                <div style={{ fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 18, fontWeight: 700, color: C.text, letterSpacing: -0.4 }}>
                  Entrar ou criar conta
                </div>
              </div>
            </div>

            <div style={{ height: 1, background: C.line, margin: '16px 0' }} />

            <label style={{ fontFamily: '"DM Sans", system-ui', fontSize: 12, fontWeight: 700, color: C.textSoft, letterSpacing: 0.5, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
              Número de celular
            </label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(formatPhone(e.target.value))}
              placeholder="(00) 00000-0000"
              onKeyDown={e => e.key === 'Enter' && handleSendOtp()}
              style={{
                width: '100%', appearance: 'none', outline: 0,
                border: `1.5px solid ${C.line}`, borderRadius: 14,
                padding: '14px 16px', marginBottom: 16,
                fontFamily: '"DM Sans", system-ui', fontSize: 16, fontWeight: 500, color: C.text,
                background: '#fff', transition: 'border-color 120ms',
              }}
              onFocus={e => (e.target.style.borderColor = C.navy)}
              onBlur={e => (e.target.style.borderColor = C.line)}
            />
            {error && <p style={{ fontFamily: '"DM Sans", system-ui', fontSize: 13, color: '#C2511A', marginBottom: 12, marginTop: -8 }}>{error}</p>}
            <button
              onClick={handleSendOtp}
              disabled={loading}
              style={{
                width: '100%', appearance: 'none', border: 0, cursor: loading ? 'not-allowed' : 'pointer',
                background: C.jade, color: C.jadeInk, borderRadius: 14, padding: '15px 20px',
                fontFamily: '"DM Sans", system-ui', fontSize: 15, fontWeight: 700,
                boxShadow: '0 8px 20px rgba(0,196,140,0.30)',
                opacity: loading ? 0.7 : 1,
                transition: 'all 140ms',
              }}
            >
              {loading ? 'Enviando...' : 'Enviar código SMS'}
            </button>
          </div>
        )}

        {step === 'otp' && (
          <div style={{
            background: '#fff', borderRadius: 24, padding: '28px 28px 32px',
            boxShadow: '0 20px 60px rgba(8,28,87,0.3)',
          }}>
            <button
              onClick={() => { setStep('phone'); setCode(''); setError('') }}
              style={{
                appearance: 'none', border: 0, background: 'transparent', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
                fontFamily: '"DM Sans", system-ui', fontSize: 13, fontWeight: 600,
                color: C.textMute, marginBottom: 20, padding: 0,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Voltar
            </button>

            <div style={{ fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 22, fontWeight: 700, color: C.text, letterSpacing: -0.5, marginBottom: 6 }}>
              Confirme seu número
            </div>
            <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 14, color: C.textMute, marginBottom: 20 }}>
              Código enviado para <strong style={{ color: C.text }}>{phone}</strong>
            </div>

            <label style={{ fontFamily: '"DM Sans", system-ui', fontSize: 12, fontWeight: 700, color: C.textSoft, letterSpacing: 0.5, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
              Código de 6 dígitos
            </label>
            <input
              type="number"
              value={code}
              onChange={e => setCode(e.target.value.slice(0, 6))}
              placeholder="000000"
              onKeyDown={e => e.key === 'Enter' && handleVerify()}
              style={{
                width: '100%', appearance: 'none', outline: 0,
                border: `1.5px solid ${C.line}`, borderRadius: 14,
                padding: '14px 16px', marginBottom: 16,
                fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 28, fontWeight: 800,
                color: C.text, letterSpacing: 8, textAlign: 'center',
                background: '#fff', transition: 'border-color 120ms',
              }}
              onFocus={e => (e.target.style.borderColor = C.navy)}
              onBlur={e => (e.target.style.borderColor = C.line)}
            />
            {error && <p style={{ fontFamily: '"DM Sans", system-ui', fontSize: 13, color: '#C2511A', marginBottom: 12, marginTop: -8 }}>{error}</p>}
            <button
              onClick={handleVerify}
              disabled={loading}
              style={{
                width: '100%', appearance: 'none', border: 0, cursor: loading ? 'not-allowed' : 'pointer',
                background: C.jade, color: C.jadeInk, borderRadius: 14, padding: '15px 20px',
                fontFamily: '"DM Sans", system-ui', fontSize: 15, fontWeight: 700,
                boxShadow: '0 8px 20px rgba(0,196,140,0.30)',
                opacity: loading ? 0.7 : 1,
                transition: 'all 140ms',
              }}
            >
              {loading ? 'Verificando...' : 'Entrar'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
