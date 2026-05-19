// Worker Home — Laboro
// Mobile, 390-402px width inside iOS frame

const { C, font } = window.LAB;

// ─── tiny atoms ────────────────────────────────────────────────────────────
function Icon({ d, size = 18, stroke = 'currentColor', sw = 1.8, fill = 'none' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}>
      <path d={d} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const ICONS = {
  bell:   'M6 8a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6Zm4 10a2 2 0 0 0 4 0',
  star:   'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.2L12 17l-5.4 3 1-6.2L3.2 9.5l6.1-.9L12 3Z',
  pin:    'M12 21s7-7 7-12a7 7 0 0 0-14 0c0 5 7 12 7 12Zm0-9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  clock:  'M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  bolt:   'M13 3L4 14h7l-1 7 9-11h-7l1-7Z',
  lock:   'M6 10V8a6 6 0 1 1 12 0v2M5 10h14v10H5z',
  check:  'M5 12l4 4L19 7',
  chevR:  'M9 6l6 6-6 6',
  filter: 'M4 5h16M7 12h10M10 19h4',
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Zm9 16-3-3',
  home:   'M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-4v-7h-6v7H5a1 1 0 0 1-1-1v-9Z',
  calendar:'M3 9h18M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm3-2v4m8-4v4',
  wallet: 'M3 7a2 2 0 0 1 2-2h13l3 4v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Zm14 5a1.5 1.5 0 1 0 0 3h4v-3h-4Z',
  user:   'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 9a7 7 0 0 1 14 0',
  fire:   'M12 3s4 3 4 8a4 4 0 0 1-8 0c0-2 1-3 1-3s-1-2 0-4c0 0 1 2 3 -1Z',
};

// ─── avatar (initials + colored ring) ──────────────────────────────────────
function Avatar({ name, size = 40, ring = false }) {
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  // pastel-ish but deep, derived from name
  const hue = [...name].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `linear-gradient(135deg, oklch(0.65 0.15 ${hue}), oklch(0.45 0.18 ${(hue+30)%360}))`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontFamily: font.body, fontWeight: 700, fontSize: size * 0.36,
      letterSpacing: -0.3,
      boxShadow: ring ? `0 0 0 2px ${C.jade}, 0 0 0 4px rgba(255,255,255,0.2)` : 'none',
      flexShrink: 0,
    }}>{initials}</div>
  );
}

// ─── score badge: Iniciante / Verificado / Top Pro ─────────────────────────
function LevelBadge({ level = 'Verificado', size = 'sm' }) {
  const map = {
    'Iniciante':   { bg: 'rgba(255,255,255,0.14)', fg: '#fff',     icon: '◐' },
    'Verificado':  { bg: 'rgba(0,196,140,0.16)',   fg: '#7FE6C5',  icon: '✓' },
    'Top Pro':     { bg: 'rgba(255,107,53,0.16)',  fg: '#FFB89A',  icon: '★' },
  };
  const m = map[level];
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: m.bg, color: m.fg,
      padding: size === 'sm' ? '4px 9px' : '6px 12px',
      borderRadius: 999,
      fontFamily: font.body, fontSize: size === 'sm' ? 11.5 : 13,
      fontWeight: 600, letterSpacing: 0.2,
    }}>
      <span style={{ fontSize: size === 'sm' ? 11 : 12, lineHeight: 1 }}>{m.icon}</span>
      {level}
    </div>
  );
}

// ─── Header (navy) ─────────────────────────────────────────────────────────
function Header({ name }) {
  return (
    <div style={{
      background: C.navy,
      color: '#fff',
      padding: '60px 20px 64px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* subtle glow */}
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
        {/* top row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar name={name} size={44} ring />
            <div>
              <div style={{
                fontFamily: font.body, fontSize: 13, fontWeight: 500,
                color: 'rgba(255,255,255,0.6)', letterSpacing: 0.1,
              }}>Boa noite,</div>
              <div style={{
                fontFamily: font.display, fontSize: 20, fontWeight: 700,
                letterSpacing: -0.5, marginTop: 1,
              }}>{name.split(' ')[0]}</div>
            </div>
          </div>
          <button style={{
            appearance: 'none', border: 0, cursor: 'pointer',
            width: 42, height: 42, borderRadius: 14,
            background: 'rgba(255,255,255,0.10)',
            border: '1px solid rgba(255,255,255,0.10)',
            color: '#fff', position: 'relative',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon d={ICONS.bell} size={20} />
            <span style={{
              position: 'absolute', top: 8, right: 9,
              width: 9, height: 9, borderRadius: '50%',
              background: C.orange,
              border: `2px solid ${C.navy}`,
            }} />
          </button>
        </div>

        {/* score card sitting on header */}
        <div style={{
          marginTop: 22,
          background: 'rgba(255,255,255,0.07)',
          border: '1px solid rgba(255,255,255,0.10)',
          borderRadius: 18,
          padding: 16,
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{
              fontFamily: font.body, fontSize: 12, fontWeight: 600,
              color: 'rgba(255,255,255,0.55)', letterSpacing: 1, textTransform: 'uppercase',
            }}>Seu score</div>
            <LevelBadge level="Verificado" />
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
            marginTop: 14, gap: 12,
          }}>
            <Stat value="4,9" label="nota" icon={
              <svg width="13" height="13" viewBox="0 0 24 24" fill={C.jade}>
                <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.2L12 17l-5.4 3 1-6.2L3.2 9.5l6.1-.9L12 3Z"/>
              </svg>
            } />
            <Stat value="23" label="turnos" />
            <Stat value="R$ 2.340" label="este mês" small />
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ value, label, icon, small }) {
  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 4,
        fontFamily: font.display, fontWeight: 700,
        fontSize: small ? 18 : 22, color: '#fff',
        letterSpacing: -0.7, lineHeight: 1,
      }}>
        {icon}{value}
      </div>
      <div style={{
        fontFamily: font.body, fontSize: 11.5, fontWeight: 500,
        color: 'rgba(255,255,255,0.55)', marginTop: 5, letterSpacing: 0.1,
      }}>{label}</div>
    </div>
  );
}

// ─── Filter chips (horizontal scroll) ──────────────────────────────────────
function FilterChips() {
  const [active, setActive] = React.useState('Todas');
  const chips = [
    { id: 'Todas', label: 'Todas' },
    { id: 'Hoje', label: 'Hoje', icon: ICONS.bolt },
    { id: 'Garçom', label: 'Garçom' },
    { id: 'Bartender', label: 'Bartender' },
    { id: 'Cozinha', label: 'Aux. cozinha' },
    { id: 'R$150', label: 'R$ 150+' },
  ];
  return (
    <div style={{
      display: 'flex', gap: 8, padding: '0 20px',
      overflowX: 'auto', scrollbarWidth: 'none',
    }}>
      <button onClick={() => {}} style={{
        appearance: 'none', cursor: 'pointer',
        background: C.ink, color: '#fff',
        border: 0, borderRadius: 999,
        padding: '10px 13px',
        display: 'flex', alignItems: 'center', gap: 6,
        fontFamily: font.body, fontSize: 13.5, fontWeight: 600,
        flexShrink: 0,
      }}>
        <Icon d={ICONS.filter} size={15} stroke="#fff" sw={2.2} />
        Filtros
      </button>
      {chips.map(c => {
        const isActive = c.id === active;
        return (
          <button
            key={c.id}
            onClick={() => setActive(c.id)}
            style={{
              appearance: 'none', cursor: 'pointer',
              background: isActive ? C.navy : '#fff',
              color: isActive ? '#fff' : C.text,
              border: `1px solid ${isActive ? C.navy : C.line}`,
              borderRadius: 999, padding: '10px 14px',
              fontFamily: font.body, fontSize: 13.5, fontWeight: 600,
              letterSpacing: -0.1,
              display: 'flex', alignItems: 'center', gap: 6,
              flexShrink: 0,
              transition: 'all 120ms',
            }}
          >
            {c.icon && <Icon d={c.icon} size={14} stroke={isActive ? '#fff' : C.navy} sw={2.2} />}
            {c.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Vaga (Job) Card ───────────────────────────────────────────────────────
function CompanyMark({ name, color }) {
  const letter = name[0];
  return (
    <div style={{
      width: 44, height: 44, borderRadius: 13,
      background: color, color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: font.display, fontWeight: 700, fontSize: 20,
      letterSpacing: -0.5,
      flexShrink: 0,
    }}>{letter}</div>
  );
}

function VagaCard({ vaga }) {
  const [pressed, setPressed] = React.useState(false);
  return (
    <div
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      style={{
        background: '#fff',
        borderRadius: 18,
        padding: 14,
        border: `1px solid ${C.line}`,
        boxShadow: pressed
          ? '0 1px 2px rgba(14,42,120,0.04)'
          : '0 2px 4px rgba(14,42,120,0.03), 0 8px 20px rgba(14,42,120,0.04)',
        cursor: 'pointer',
        transform: pressed ? 'scale(0.99)' : 'scale(1)',
        transition: 'all 120ms cubic-bezier(.2,.7,.2,1)',
        position: 'relative',
      }}
    >
      {vaga.urgent && (
        <div style={{
          position: 'absolute', top: 14, right: 14,
          display: 'inline-flex', alignItems: 'center', gap: 4,
          background: C.orange, color: '#fff',
          padding: '4px 9px', borderRadius: 999,
          fontFamily: font.body, fontSize: 10.5, fontWeight: 700,
          letterSpacing: 0.4, textTransform: 'uppercase',
          boxShadow: '0 4px 10px rgba(255,107,53,0.35)',
        }}>
          <svg width="9" height="11" viewBox="0 0 24 24" fill="#fff"><path d="M13 3L4 14h7l-1 7 9-11h-7l1-7Z"/></svg>
          Urgente
        </div>
      )}

      <div style={{ display: 'flex', gap: 12 }}>
        <CompanyMark name={vaga.company} color={vaga.color} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: font.body, fontSize: 12.5, fontWeight: 600,
            color: C.textMute, letterSpacing: 0.1,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            paddingRight: vaga.urgent ? 80 : 0,
          }}>
            {vaga.company}
          </div>
          <div style={{
            fontFamily: font.display, fontSize: 19, fontWeight: 700,
            color: C.text, letterSpacing: -0.5, marginTop: 1, lineHeight: 1.15,
          }}>
            {vaga.role}
          </div>
        </div>
      </div>

      {/* meta row */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 8,
        marginTop: 12,
      }}>
        <MetaPill icon={ICONS.calendar} text={vaga.date} />
        <MetaPill icon={ICONS.clock} text={vaga.time} />
        <MetaPill icon={ICONS.pin} text={vaga.distance} />
      </div>

      {/* footer: value + cta */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginTop: 14, paddingTop: 12,
        borderTop: `1px dashed ${C.line}`,
      }}>
        <div>
          <div style={{
            fontFamily: font.display, fontSize: 24, fontWeight: 800,
            color: C.jadeDeep, letterSpacing: -0.8, lineHeight: 1,
          }}>
            R$ {vaga.value}
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            fontFamily: font.body, fontSize: 11, fontWeight: 500,
            color: C.textSoft, marginTop: 4,
          }}>
            <svg width="10" height="11" viewBox="0 0 24 24" fill="none">
              <path d={ICONS.lock} stroke={C.jadeDeep} strokeWidth="2" />
            </svg>
            Reservado em escrow · {vaga.hours}h
          </div>
        </div>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          background: C.jade, color: C.jadeInk,
          padding: '11px 14px', borderRadius: 12,
          fontFamily: font.body, fontSize: 13.5, fontWeight: 700,
          letterSpacing: -0.1,
          boxShadow: '0 6px 14px rgba(0,196,140,0.25)',
        }}>
          Ver vaga
          <Icon d={ICONS.chevR} size={14} stroke={C.jadeInk} sw={2.6} />
        </div>
      </div>
    </div>
  );
}

function MetaPill({ icon, text }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: C.surface3, color: C.textMute,
      padding: '5px 9px', borderRadius: 8,
      fontFamily: font.body, fontSize: 12, fontWeight: 500,
    }}>
      <Icon d={icon} size={12} stroke={C.navy} sw={2} />
      {text}
    </div>
  );
}

// ─── Bottom tab bar ────────────────────────────────────────────────────────
const WORKER_NAV = {
  home:   '02 Home Trabalhador.html',
  shifts: '09 Meus Turnos.html',
  pay:    '10 Carteira.html',
  me:     '06 Perfil do Trabalhador.html',
};
function TabBar({ active = 'home' }) {
  const tabs = [
    { id: 'home',   label: 'Vagas',    icon: ICONS.home },
    { id: 'shifts', label: 'Turnos',   icon: ICONS.calendar, badge: 1 },
    { id: 'pay',    label: 'Carteira', icon: ICONS.wallet },
    { id: 'me',     label: 'Perfil',   icon: ICONS.user },
  ];
  const go = (id) => {
    if (id === active) return;
    window.location.href = encodeURI(WORKER_NAV[id]);
  };
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      paddingBottom: 28, paddingTop: 8,
      background: '#fff',
      borderTop: `1px solid ${C.lineSoft}`,
      display: 'flex', justifyContent: 'space-around', alignItems: 'center',
      zIndex: 5,
    }}>
      {tabs.map(t => {
        const isActive = t.id === active;
        return (
          <button key={t.id} onClick={() => go(t.id)} style={{
            appearance: 'none', border: 0, background: 'transparent',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            padding: '6px 12px', cursor: 'pointer',
            position: 'relative',
          }}>
            <div style={{ position: 'relative' }}>
              <Icon d={t.icon} size={22} stroke={isActive ? C.navy : C.textSoft} sw={isActive ? 2.2 : 1.8} />
              {t.badge && (
                <span style={{
                  position: 'absolute', top: -3, right: -7,
                  minWidth: 16, height: 16, borderRadius: 999,
                  background: C.orange, color: '#fff',
                  fontFamily: font.body, fontSize: 10, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '0 4px', border: '2px solid #fff',
                }}>{t.badge}</span>
              )}
            </div>
            <div style={{
              fontFamily: font.body, fontSize: 10.5,
              fontWeight: isActive ? 700 : 500,
              color: isActive ? C.navy : C.textSoft,
              letterSpacing: 0.1,
            }}>{t.label}</div>
          </button>
        );
      })}
    </div>
  );
}

// ─── Data ──────────────────────────────────────────────────────────────────
const VAGAS = [
  {
    id: 1, company: 'Bar do Pedrão', role: 'Garçom',
    date: 'sex, 24 mai', time: '18:00–23:00', hours: 5,
    distance: '1,2 km', value: '180,00', urgent: true,
    color: '#1B3FA0',
  },
  {
    id: 2, company: 'Quintal Eventos', role: 'Bartender',
    date: 'sáb, 25 mai', time: '20:00–02:00', hours: 6,
    distance: '3,8 km', value: '260,00', urgent: false,
    color: '#FF6B35',
  },
  {
    id: 3, company: 'Vovó Tereza', role: 'Aux. de Cozinha',
    date: 'dom, 26 mai', time: '11:00–17:00', hours: 6,
    distance: '0,8 km', value: '210,00', urgent: false,
    color: '#00A372',
  },
  {
    id: 4, company: 'Brasa Hamburgueria', role: 'Atendente de balcão',
    date: 'seg, 27 mai', time: '17:30–22:30', hours: 5,
    distance: '2,1 km', value: '165,00', urgent: false,
    color: '#7C2D12',
  },
];

// ─── Screen ────────────────────────────────────────────────────────────────
function WorkerHome() {
  return (
    <div style={{
      height: '100%', width: '100%', overflow: 'auto',
      background: C.surface2,
      fontFamily: font.body,
      paddingBottom: 100,
    }}>
      <Header name="Júlio Santos" />

      {/* Floating section pulling up from header */}
      <div style={{
        marginTop: -32,
        background: C.surface2,
        borderTopLeftRadius: 28, borderTopRightRadius: 28,
        paddingTop: 22, position: 'relative', zIndex: 2,
      }}>
        {/* section header */}
        <div style={{
          display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
          padding: '0 20px', marginBottom: 14,
        }}>
          <div>
            <div style={{
              fontFamily: font.display, fontSize: 22, fontWeight: 700,
              color: C.text, letterSpacing: -0.6,
            }}>Vagas para você</div>
            <div style={{
              fontFamily: font.body, fontSize: 12.5, fontWeight: 500,
              color: C.textSoft, marginTop: 2,
            }}>
              <span style={{ color: C.orange, fontWeight: 700 }}>1 urgente</span> · 12 disponíveis hoje
            </div>
          </div>
          <button style={{
            appearance: 'none', border: 0, background: 'transparent', cursor: 'pointer',
            fontFamily: font.body, fontSize: 13, fontWeight: 600,
            color: C.navy,
          }}>Ver mapa</button>
        </div>

        <FilterChips />

        {/* job list */}
        <div style={{
          display: 'flex', flexDirection: 'column', gap: 12,
          padding: '16px 20px 0',
        }}>
          {VAGAS.map(v => <VagaCard key={v.id} vaga={v} />)}
        </div>
      </div>

      <TabBar active="home" />
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
    }} data-screen-label="02 Home Trabalhador">
      <IOSDevice width={402} height={874} dark={false}>
        <div style={{ position: 'relative', height: '100%', width: '100%' }}>
          <WorkerHome />
        </div>
      </IOSDevice>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
