// Carteira / Pagamentos (trabalhador) — Laboro Tela 10

const { C, font } = window.LAB;

function Icon({ d, size = 18, stroke = 'currentColor', sw = 1.8, fill = 'none' }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}><path d={d} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
const ICONS = {
  eye:    'M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  eyeOff: 'M3 3l18 18M10.6 6.2a9.7 9.7 0 0 1 1.4-.2c6 0 10 7 10 7a18 18 0 0 1-3.5 4.2M6 7a18 18 0 0 0-4 5s4 7 10 7c1.6 0 3-.4 4.4-1M9.9 9.9a3 3 0 1 0 4.2 4.2',
  cal:    'M3 9h18M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm3-2v4m8-4v4',
  arrow:  'M5 12h14m-4-4l4 4-4 4',
  arrowDown:'M12 5v14m4-4l-4 4-4-4',
  arrowUp:'M12 19V5m4 4l-4-4-4 4',
  lock:   'M6 10V8a6 6 0 1 1 12 0v2M5 10h14v10H5z',
  check:  'M5 12l4 4L19 7',
  pix:    'M5 12l7-7 7 7-7 7-7-7Zm5 0l2-2 2 2-2 2-2-2Z',
  spin:   'M21 12a9 9 0 1 1-3-6.7',
  chev:   'M9 6l6 6-6 6',
  filter: 'M4 5h16M7 12h10M10 19h4',
  home:   'M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-4v-7h-6v7H5a1 1 0 0 1-1-1v-9Z',
  wallet: 'M3 7a2 2 0 0 1 2-2h13l3 4v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Zm14 5a1.5 1.5 0 1 0 0 3h4v-3h-4z',
  user:   'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 9a7 7 0 0 1 14 0',
  info:   'M12 8h.01M11 12h1v5h1M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  doc:    'M6 3h9l4 4v14H6V3Zm9 0v4h4',
};

function CompanyMark({ letter, color, size = 38, r = 11 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: r,
      background: color, color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: font.display, fontWeight: 700, fontSize: size * 0.46,
      flexShrink: 0,
    }}>{letter}</div>
  );
}

// ─── Balance header ────────────────────────────────────────────────────────
function BalanceHeader({ hidden, setHidden }) {
  return (
    <div style={{
      background: C.navy, color: '#fff',
      padding: '56px 20px 70px',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: -120, right: -80, width: 320, height: 320,
        borderRadius: '50%',
        background: 'radial-gradient(closest-side, rgba(0,196,140,0.22), transparent 70%)',
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
        maskImage: 'linear-gradient(180deg, transparent, #000 30%, #000 100%)',
        WebkitMaskImage: 'linear-gradient(180deg, transparent, #000 30%, #000 100%)',
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{
              fontFamily: font.body, fontSize: 11.5, fontWeight: 700,
              color: 'rgba(255,255,255,0.55)', letterSpacing: 0.6, textTransform: 'uppercase',
            }}>Saldo disponível</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
              <span style={{
                fontFamily: font.display, fontSize: 42, fontWeight: 800,
                color: '#fff', letterSpacing: -1.4, lineHeight: 1,
                fontVariantNumeric: 'tabular-nums',
              }}>R$ {hidden ? '••••' : '1.240,00'}</span>
              <button onClick={() => setHidden(!hidden)} style={{
                appearance: 'none', cursor: 'pointer', border: 0,
                background: 'transparent', color: 'rgba(255,255,255,0.6)',
                marginLeft: 2,
              }}>
                <Icon d={hidden ? ICONS.eyeOff : ICONS.eye} size={20} stroke="rgba(255,255,255,0.6)" sw={1.8} />
              </button>
            </div>
          </div>
        </div>

        {/* mini stats */}
        <div style={{
          marginTop: 18, display: 'flex', gap: 16,
        }}>
          <MiniStat label="Este mês" value="R$ 2.340,00" />
          <div style={{ width: 1, background: 'rgba(255,255,255,0.15)' }} />
          <MiniStat label="Em escrow" value="R$ 440,00" icon={ICONS.lock} />
        </div>

        {/* action buttons */}
        <div style={{
          marginTop: 22, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
        }}>
          <button style={{
            appearance: 'none', cursor: 'pointer', border: 0,
            background: C.jade, color: C.jadeInk,
            borderRadius: 14, padding: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            fontFamily: font.body, fontSize: 14, fontWeight: 700,
            boxShadow: '0 10px 24px rgba(0,196,140,0.4)',
          }}>
            <Icon d={ICONS.pix} size={16} stroke={C.jadeInk} sw={2} />
            Sacar via Pix
          </button>
          <button style={{
            appearance: 'none', cursor: 'pointer', border: 0,
            background: 'rgba(255,255,255,0.10)',
            border: '1px solid rgba(255,255,255,0.14)',
            color: '#fff',
            borderRadius: 14, padding: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            fontFamily: font.body, fontSize: 14, fontWeight: 700,
          }}>
            <Icon d={ICONS.doc} size={16} stroke="#fff" sw={2} />
            Extrato
          </button>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value, icon }) {
  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 4,
        fontFamily: font.body, fontSize: 11, fontWeight: 600,
        color: 'rgba(255,255,255,0.55)', letterSpacing: 0.3, textTransform: 'uppercase',
      }}>
        {icon && <Icon d={icon} size={11} stroke="rgba(255,255,255,0.55)" sw={2} />}
        {label}
      </div>
      <div style={{
        fontFamily: font.display, fontSize: 17, fontWeight: 700,
        color: '#fff', letterSpacing: -0.4, marginTop: 4,
      }}>{value}</div>
    </div>
  );
}

// ─── Status pill ───────────────────────────────────────────────────────────
function StatusPill({ status }) {
  const map = {
    'retido':   { bg: '#FFF1E9', fg: '#C2511A', icon: ICONS.lock, label: 'Em escrow' },
    'processando': { bg: '#FFFBE6', fg: '#7C5C00', icon: ICONS.spin, label: 'Processando' },
    'liberado': { bg: C.jadeSoft, fg: C.jadeDeep, icon: ICONS.check, label: 'Liberado' },
  };
  const m = map[status];
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: m.bg, color: m.fg,
      padding: '3px 8px', borderRadius: 999,
      fontFamily: font.body, fontSize: 10.5, fontWeight: 700,
      letterSpacing: 0.4, textTransform: 'uppercase',
    }}>
      <Icon d={m.icon} size={10} stroke={m.fg} sw={2.4} />
      {m.label}
    </div>
  );
}

// ─── Payment row ───────────────────────────────────────────────────────────
function PaymentRow({ p }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
      borderBottom: `1px solid ${C.lineSoft}`,
    }}>
      <CompanyMark letter={p.company[0]} color={p.color} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: font.body, fontSize: 14, fontWeight: 700,
          color: C.text, letterSpacing: -0.2,
        }}>{p.company}</div>
        <div style={{
          fontFamily: font.body, fontSize: 12, color: C.textMute, marginTop: 1,
        }}>{p.role} · {p.date}</div>
        <div style={{ marginTop: 5 }}>
          <StatusPill status={p.status} />
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{
          fontFamily: font.display, fontSize: 17, fontWeight: 800,
          color: p.status === 'liberado' ? C.jadeDeep : C.text,
          letterSpacing: -0.4,
        }}>+R$ {p.value}</div>
        {p.eta && (
          <div style={{
            fontFamily: font.body, fontSize: 10.5, color: C.textSoft, marginTop: 2,
          }}>{p.eta}</div>
        )}
      </div>
    </div>
  );
}

// ─── Tab bar ───────────────────────────────────────────────────────────────
const WORKER_NAV = {
  home:   '02 Home Trabalhador.html',
  shifts: '09 Meus Turnos.html',
  pay:    '10 Carteira.html',
  me:     '06 Perfil do Trabalhador.html',
};
function TabBar() {
  const active = 'pay';
  const tabs = [
    { id: 'home',   label: 'Vagas',    icon: ICONS.home },
    { id: 'shifts', label: 'Turnos',   icon: ICONS.cal },
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
      background: '#fff', borderTop: `1px solid ${C.lineSoft}`,
      display: 'flex', justifyContent: 'space-around', alignItems: 'center', zIndex: 5,
    }}>
      {tabs.map(t => {
        const isActive = t.id === active;
        return (
          <button key={t.id} onClick={() => go(t.id)} style={{
            appearance: 'none', border: 0, background: 'transparent',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            padding: '6px 12px', cursor: 'pointer',
          }}>
            <Icon d={t.icon} size={22} stroke={isActive ? C.navy : C.textSoft} sw={isActive ? 2.2 : 1.8} />
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
const PAYMENTS = [
  // Pending / em escrow
  { id: 1, company: 'Bar do Pedrão', color: '#1B3FA0', role: 'Garçom', date: 'hoje 18h–23h', value: '180,00', status: 'retido', eta: 'libera 24 mai · 23h', section: 'pending' },
  { id: 2, company: 'Quintal Eventos', color: '#FF6B35', role: 'Bartender', date: 'sáb 25 mai', value: '260,00', status: 'retido', eta: 'libera 26 mai · 03h', section: 'pending' },

  // Processing
  { id: 3, company: 'Brasa Hamburgueria', color: '#7C2D12', role: 'Atendente', date: 'qui 9 mai', value: '165,00', status: 'processando', eta: 'em até 1h', section: 'history' },

  // Released
  { id: 4, company: 'Quintal Eventos', color: '#FF6B35', role: 'Bartender', date: 'sáb 18 mai · 22h', value: '260,00', status: 'liberado', section: 'history' },
  { id: 5, company: 'Bar do Pedrão', color: '#1B3FA0', role: 'Garçom', date: 'sex 17 mai · 23h', value: '180,00', status: 'liberado', section: 'history' },
  { id: 6, company: 'Vovó Tereza', color: '#00A372', role: 'Aux. de Cozinha', date: 'dom 12 mai · 17h', value: '210,00', status: 'liberado', section: 'history' },
  { id: 7, company: 'Brasa Hamburgueria', color: '#7C2D12', role: 'Atendente', date: 'qui 2 mai · 22h', value: '165,00', status: 'liberado', section: 'history' },
];

// ─── Pix info card ─────────────────────────────────────────────────────────
function PixInfo() {
  return (
    <div style={{
      margin: '0 20px', background: '#fff', borderRadius: 16, padding: 14,
      border: `1px solid ${C.line}`,
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <div style={{
        width: 38, height: 38, borderRadius: 11,
        background: C.jadeSoft,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon d={ICONS.pix} size={18} stroke={C.jadeDeep} sw={2} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{
          fontFamily: font.body, fontSize: 11, fontWeight: 700,
          color: C.textSoft, letterSpacing: 0.4, textTransform: 'uppercase',
        }}>Chave Pix configurada</div>
        <div style={{
          fontFamily: font.body, fontSize: 14, fontWeight: 600,
          color: C.text, marginTop: 2,
        }}>CPF · ***.521.789-**</div>
      </div>
      <button style={{
        appearance: 'none', cursor: 'pointer', border: 0,
        background: 'transparent', color: C.navy,
        fontFamily: font.body, fontSize: 12.5, fontWeight: 700,
        padding: 4,
      }}>Trocar</button>
    </div>
  );
}

function Carteira() {
  const [hidden, setHidden] = React.useState(false);
  const pending = PAYMENTS.filter(p => p.section === 'pending');
  const history = PAYMENTS.filter(p => p.section === 'history');

  return (
    <div style={{
      height: '100%', width: '100%', overflow: 'auto',
      background: C.surface2, fontFamily: font.body, paddingBottom: 100,
    }}>
      <BalanceHeader hidden={hidden} setHidden={setHidden} />

      <div style={{
        marginTop: -36,
        background: C.surface2,
        borderTopLeftRadius: 28, borderTopRightRadius: 28,
        paddingTop: 18, position: 'relative', zIndex: 2,
      }}>
        <PixInfo />

        {/* Próximos recebimentos */}
        <div style={{ marginTop: 22 }}>
          <div style={{
            padding: '0 20px', marginBottom: 10,
            display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
          }}>
            <div style={{
              fontFamily: font.display, fontSize: 17, fontWeight: 700,
              color: C.text, letterSpacing: -0.4,
            }}>Próximos recebimentos</div>
            <div style={{
              fontFamily: font.body, fontSize: 12.5, fontWeight: 700,
              color: C.orange,
            }}>R$ 440,00</div>
          </div>
          <div style={{
            margin: '0 20px', background: '#fff',
            borderRadius: 16, border: `1px solid ${C.line}`,
            overflow: 'hidden',
          }}>
            {pending.map(p => <PaymentRow key={p.id} p={p} />)}
          </div>
          <div style={{
            margin: '10px 20px 0', padding: '10px 12px',
            background: '#FFF1E9', borderRadius: 10,
            display: 'flex', gap: 8, alignItems: 'flex-start',
          }}>
            <Icon d={ICONS.info} size={14} stroke={C.orange} sw={2} />
            <div style={{
              fontFamily: font.body, fontSize: 11.5, color: '#7C3A1A', lineHeight: 1.4,
            }}>
              Valores em escrow são liberados automaticamente em até 1h após o seu check-out e a empresa avaliar o turno.
            </div>
          </div>
        </div>

        {/* Histórico */}
        <div style={{ marginTop: 24 }}>
          <div style={{
            padding: '0 20px', marginBottom: 10,
            display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
          }}>
            <div style={{
              fontFamily: font.display, fontSize: 17, fontWeight: 700,
              color: C.text, letterSpacing: -0.4,
            }}>Histórico</div>
            <button style={{
              appearance: 'none', cursor: 'pointer', border: 0, background: 'transparent',
              display: 'flex', alignItems: 'center', gap: 4,
              fontFamily: font.body, fontSize: 12.5, fontWeight: 600, color: C.navy,
            }}>
              <Icon d={ICONS.filter} size={13} stroke={C.navy} sw={2.2} />
              Filtros
            </button>
          </div>
          <SectionHeader label="Maio 2026" total="R$ 815,00" />
          <div style={{
            margin: '0 20px', background: '#fff',
            borderRadius: 16, border: `1px solid ${C.line}`,
            overflow: 'hidden',
          }}>
            {history.map(p => <PaymentRow key={p.id} p={p} />)}
          </div>
        </div>
      </div>

      <TabBar />
    </div>
  );
}

function SectionHeader({ label, total }) {
  return (
    <div style={{
      padding: '0 24px 8px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
      fontFamily: font.body,
    }}>
      <span style={{
        fontSize: 11, fontWeight: 700, color: C.textSoft,
        letterSpacing: 0.5, textTransform: 'uppercase',
      }}>{label}</span>
      <span style={{
        fontSize: 12, fontWeight: 700, color: C.jadeDeep,
        fontFamily: font.display, letterSpacing: -0.2,
      }}>{total}</span>
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
    }} data-screen-label="10 Carteira">
      <IOSDevice width={402} height={874} dark={false}>
        <Carteira />
      </IOSDevice>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
