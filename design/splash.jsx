// Splash + escolha de perfil — Laboro

const C = {
  navy: '#0E2A78',
  navyDeep: '#081C57',
  navyLight: '#1B3FA0',
  jade: '#00C48C',
  jadeDeep: '#00A372',
  ink: '#0A0F1F',
  white: '#F8F9FC',
  orange: '#FF6B35',
  line: 'rgba(255,255,255,0.10)',
  textMute: 'rgba(248,249,252,0.62)',
};

// Brand mark: an "L" where the horizontal bar reads as a turn / progress bar
// with a jade head — combines "Laboro" with the idea of a shift in motion.
function LaboroMark({ size = 64 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <defs>
        <linearGradient id="lm-stem" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E6ECFF" />
        </linearGradient>
      </defs>
      {/* vertical stem */}
      <rect x="8" y="6" width="14" height="44" rx="3" fill="url(#lm-stem)" />
      {/* horizontal bar of L — a track */}
      <rect x="8" y="44" width="48" height="14" rx="3" fill="#FFFFFF" opacity="0.16" />
      {/* progress fill */}
      <rect x="8" y="44" width="34" height="14" rx="3" fill="#FFFFFF" />
      {/* jade head (the "now" marker) */}
      <circle cx="50" cy="51" r="7" fill={C.jade} />
      <circle cx="50" cy="51" r="7" stroke="#FFFFFF" strokeOpacity="0.25" strokeWidth="1.5" />
    </svg>
  );
}

function Wordmark() {
  return (
    <div style={{
      fontFamily: '"Bricolage Grotesque", system-ui',
      fontWeight: 800,
      fontSize: 56,
      letterSpacing: -2.5,
      lineHeight: 1,
      color: '#fff',
      display: 'flex',
      alignItems: 'baseline',
      gap: 2,
    }}>
      <span>laboro</span>
      <span style={{ color: C.jade, fontSize: 56, lineHeight: 1 }}>.</span>
    </div>
  );
}

// Background: deep navy with subtle dot grid + soft glow + bottom curve
function SplashBackground() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: C.navy }}>
      {/* radial top-right glow */}
      <div style={{
        position: 'absolute', top: -140, right: -120, width: 420, height: 420,
        borderRadius: '50%',
        background: 'radial-gradient(closest-side, rgba(0,196,140,0.32), rgba(0,196,140,0) 70%)',
        filter: 'blur(2px)',
      }} />
      {/* radial bottom-left glow */}
      <div style={{
        position: 'absolute', bottom: -200, left: -160, width: 500, height: 500,
        borderRadius: '50%',
        background: 'radial-gradient(closest-side, rgba(27,63,160,0.85), rgba(8,28,87,0) 70%)',
      }} />
      {/* dot grid */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)',
        backgroundSize: '18px 18px',
        backgroundPosition: '0 0',
        maskImage: 'linear-gradient(180deg, transparent, #000 30%, #000 70%, transparent)',
        WebkitMaskImage: 'linear-gradient(180deg, transparent, #000 30%, #000 70%, transparent)',
      }} />
      {/* grain */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.12, mixBlendMode: 'overlay',
        backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.55'/></svg>\")",
      }} />
    </div>
  );
}

function ProfilePicker({ onPick }) {
  const [hover, setHover] = React.useState(null);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* TRABALHADOR — primary card */}
      <button
        onClick={() => onPick && onPick('worker')}
        onMouseEnter={() => setHover('worker')}
        onMouseLeave={() => setHover(null)}
        style={{
          appearance: 'none', border: 0, textAlign: 'left', cursor: 'pointer',
          background: C.jade,
          borderRadius: 22, padding: '18px 18px 18px 20px',
          display: 'flex', alignItems: 'center', gap: 14,
          boxShadow: hover === 'worker'
            ? '0 14px 30px rgba(0,196,140,0.45), inset 0 1px 0 rgba(255,255,255,0.3)'
            : '0 8px 22px rgba(0,196,140,0.28), inset 0 1px 0 rgba(255,255,255,0.3)',
          transform: hover === 'worker' ? 'translateY(-1px)' : 'translateY(0)',
          transition: 'all 180ms cubic-bezier(.2,.7,.2,1)',
          fontFamily: '"DM Sans", system-ui',
        }}
      >
        <div style={{
          width: 48, height: 48, borderRadius: 14,
          background: 'rgba(255,255,255,0.18)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          {/* hard hat / worker icon */}
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path d="M3 18h18v2H3v-2Zm2-2c0-4 3-7 7-7s7 3 7 7H5Z" stroke="#0A2A1E" strokeWidth="1.8" strokeLinejoin="round"/>
            <path d="M10 9V6h4v3" stroke="#0A2A1E" strokeWidth="1.8" strokeLinecap="round"/>
            <path d="M9 13h6" stroke="#0A2A1E" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#0A2A1E', letterSpacing: -0.3, lineHeight: 1.15 }}>
            Sou trabalhador
          </div>
          <div style={{ fontSize: 13.5, color: 'rgba(10,42,30,0.72)', marginTop: 2, lineHeight: 1.3 }}>
            Encontre turnos perto de você
          </div>
        </div>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{
          transform: hover === 'worker' ? 'translateX(3px)' : 'translateX(0)',
          transition: 'transform 180ms',
        }}>
          <path d="M9 6l6 6-6 6" stroke="#0A2A1E" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* EMPRESA — secondary glass card */}
      <button
        onClick={() => onPick && onPick('company')}
        onMouseEnter={() => setHover('company')}
        onMouseLeave={() => setHover(null)}
        style={{
          appearance: 'none', textAlign: 'left', cursor: 'pointer',
          border: '1px solid rgba(255,255,255,0.18)',
          background: hover === 'company' ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.06)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderRadius: 22, padding: '18px 18px 18px 20px',
          display: 'flex', alignItems: 'center', gap: 14,
          transform: hover === 'company' ? 'translateY(-1px)' : 'translateY(0)',
          transition: 'all 180ms cubic-bezier(.2,.7,.2,1)',
          fontFamily: '"DM Sans", system-ui',
        }}
      >
        <div style={{
          width: 48, height: 48, borderRadius: 14,
          background: 'rgba(255,255,255,0.10)',
          border: '1px solid rgba(255,255,255,0.10)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          {/* storefront icon */}
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path d="M4 9l1-4h14l1 4v1a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0V9Z" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round"/>
            <path d="M5 12v8h14v-8" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round"/>
            <path d="M10 20v-4h4v4" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round"/>
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 18, fontWeight: 600, color: '#fff', letterSpacing: -0.3, lineHeight: 1.15 }}>
            Sou empresa
          </div>
          <div style={{ fontSize: 13.5, color: C.textMute, marginTop: 2, lineHeight: 1.3 }}>
            Contrate turno por diária ou hora
          </div>
        </div>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{
          transform: hover === 'company' ? 'translateX(3px)' : 'translateX(0)',
          transition: 'transform 180ms',
        }}>
          <path d="M9 6l6 6-6 6" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );
}

function EscrowTrust() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 14px',
      background: 'rgba(0,196,140,0.10)',
      border: '1px solid rgba(0,196,140,0.28)',
      borderRadius: 999,
      fontFamily: '"DM Sans", system-ui',
      width: 'fit-content',
      margin: '0 auto',
    }}>
      <svg width="14" height="16" viewBox="0 0 14 16" fill="none">
        <path d="M3 7V5a4 4 0 1 1 8 0v2" stroke={C.jade} strokeWidth="1.6" strokeLinecap="round"/>
        <rect x="1.5" y="7" width="11" height="8" rx="2" stroke={C.jade} strokeWidth="1.6"/>
        <circle cx="7" cy="11" r="1.2" fill={C.jade}/>
      </svg>
      <span style={{ color: '#7FE6C5', fontSize: 12.5, fontWeight: 600, letterSpacing: 0.1 }}>
        Pagamento garantido via Pix
      </span>
    </div>
  );
}

function Splash() {
  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative',
      color: '#fff',
      fontFamily: '"DM Sans", system-ui',
    }}>
      <SplashBackground />

      {/* content */}
      <div style={{
        position: 'relative', zIndex: 2, height: '100%',
        display: 'flex', flexDirection: 'column',
        padding: '76px 24px 40px',
        boxSizing: 'border-box',
      }}>
        {/* brand + tagline */}
        <div style={{ marginTop: 26 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 14,
            animation: 'lab-breathe 4s ease-in-out infinite',
          }}>
            <LaboroMark size={56} />
            <Wordmark />
          </div>

          <div style={{
            marginTop: 28,
            fontFamily: '"Bricolage Grotesque", system-ui',
            fontWeight: 700,
            fontSize: 36,
            lineHeight: 1.05,
            letterSpacing: -1.2,
            color: '#fff',
            textWrap: 'balance',
          }}>
            Seu próximo<br/>
            turno começa<br/>
            <span style={{ color: C.jade }}>agora.</span>
          </div>

          <div style={{
            marginTop: 14,
            fontSize: 15.5,
            lineHeight: 1.45,
            color: C.textMute,
            maxWidth: 300,
            textWrap: 'pretty',
          }}>
            Marketplace de trabalho por turno com pagamento retido em escrow — você trabalha, recebe na hora.
          </div>
        </div>

        {/* spacer */}
        <div style={{ flex: 1 }} />

        {/* trust pill */}
        <div style={{ marginBottom: 16 }}>
          <EscrowTrust />
        </div>

        {/* picker */}
        <ProfilePicker />

        {/* footer */}
        <div style={{
          marginTop: 18,
          textAlign: 'center',
          fontSize: 13.5,
          color: C.textMute,
        }}>
          Já tem conta?{' '}
          <span style={{ color: '#fff', fontWeight: 600, textDecoration: 'underline', textDecorationColor: 'rgba(255,255,255,0.4)', textUnderlineOffset: 3 }}>
            Entrar
          </span>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <div style={{
      minHeight: '100vh', width: '100%',
      background: 'radial-gradient(1200px 800px at 50% 0%, #1a1a2e 0%, #0a0a14 60%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 0',
    }} data-screen-label="01 Splash">
      <IOSDevice width={402} height={874} dark={true}>
        <div style={{ position: 'relative', height: '100%', width: '100%' }}>
          <Splash />
        </div>
      </IOSDevice>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
