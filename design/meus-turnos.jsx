// Meus Turnos — 4 abas — Laboro Tela 9

const { C, font } = window.LAB;

function Icon({ d, size = 18, stroke = 'currentColor', sw = 1.8, fill = 'none' }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}><path d={d} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
const ICONS = {
  back:   'M15 6l-6 6 6 6',
  chev:   'M9 6l6 6-6 6',
  pin:    'M12 21s7-7 7-12a7 7 0 0 0-14 0c0 5 7 12 7 12Zm0-9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  clock:  'M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  cal:    'M3 9h18M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm3-2v4m8-4v4',
  star:   'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.2L12 17l-5.4 3 1-6.2L3.2 9.5l6.1-.9L12 3Z',
  check:  'M5 12l4 4L19 7',
  x:      'M6 6l12 12M6 18L18 6',
  lock:   'M6 10V8a6 6 0 1 1 12 0v2M5 10h14v10H5z',
  bolt:   'M13 3L4 14h7l-1 7 9-11h-7l1-7Z',
  filter: 'M4 5h16M7 12h10M10 19h4',
  home:   'M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-4v-7h-6v7H5a1 1 0 0 1-1-1v-9Z',
  wallet: 'M3 7a2 2 0 0 1 2-2h13l3 4v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Zm14 5a1.5 1.5 0 1 0 0 3h4v-3h-4z',
  user:   'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 9a7 7 0 0 1 14 0',
};

function CompanyMark({ letter, color, size = 44, r = 12 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: r,
      background: color, color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: font.display, fontWeight: 700, fontSize: size * 0.46,
      letterSpacing: -0.5, flexShrink: 0,
    }}>{letter}</div>
  );
}

// ─── Header ────────────────────────────────────────────────────────────────
function Header() {
  return (
    <div style={{
      paddingTop: 56, padding: '56px 20px 16px',
      background: '#fff', borderBottom: `1px solid ${C.lineSoft}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{
            fontFamily: font.body, fontSize: 11.5, fontWeight: 700,
            color: C.textSoft, letterSpacing: 0.6, textTransform: 'uppercase',
          }}>Meus turnos</div>
          <div style={{
            fontFamily: font.display, fontSize: 26, fontWeight: 800,
            color: C.text, letterSpacing: -0.8, marginTop: 2,
          }}>Agenda</div>
        </div>
        <button style={{
          appearance: 'none', cursor: 'pointer', border: 0,
          width: 40, height: 40, borderRadius: 12, background: C.surface3,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon d={ICONS.filter} size={18} stroke={C.text} sw={2.2} />
        </button>
      </div>
    </div>
  );
}

// ─── Tabs ──────────────────────────────────────────────────────────────────
function Tabs({ tab, setTab, counts }) {
  const tabs = [
    { id: 'prox',  label: 'Próximos',     count: counts.prox },
    { id: 'and',   label: 'Em andamento', count: counts.and },
    { id: 'conc',  label: 'Concluídos',   count: counts.conc },
    { id: 'canc',  label: 'Cancelados',   count: counts.canc },
  ];
  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 10,
      background: '#fff', borderBottom: `1px solid ${C.lineSoft}`,
      padding: '8px 16px 0',
      display: 'flex', gap: 4, overflowX: 'auto', scrollbarWidth: 'none',
    }}>
      {tabs.map(t => {
        const active = t.id === tab;
        return (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            appearance: 'none', cursor: 'pointer', border: 0, background: 'transparent',
            padding: '10px 12px 12px',
            display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
            borderBottom: active ? `3px solid ${C.navy}` : '3px solid transparent',
            marginBottom: -1,
          }}>
            <div style={{
              fontFamily: font.body, fontSize: 13.5,
              fontWeight: active ? 700 : 600,
              color: active ? C.text : C.textMute,
              letterSpacing: -0.1,
            }}>{t.label}</div>
            <span style={{
              background: active ? C.navy : C.surface3,
              color: active ? '#fff' : C.textMute,
              padding: '1px 7px', borderRadius: 999,
              fontSize: 11, fontWeight: 700,
            }}>{t.count}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Card: PRÓXIMO ─────────────────────────────────────────────────────────
function CardProximo({ t }) {
  const canCheckIn = t.distance <= 500;
  return (
    <div style={{
      background: '#fff', borderRadius: 18, padding: 16,
      border: `1px solid ${C.line}`,
      boxShadow: '0 2px 4px rgba(14,42,120,0.03), 0 8px 20px rgba(14,42,120,0.04)',
    }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <CompanyMark letter={t.company[0]} color={t.color} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: font.body, fontSize: 12, fontWeight: 600,
            color: C.textMute,
          }}>{t.company}</div>
          <div style={{
            fontFamily: font.display, fontSize: 18, fontWeight: 700,
            color: C.text, letterSpacing: -0.4, marginTop: 1,
          }}>{t.role}</div>
        </div>
        {t.startingSoon && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            background: C.orange, color: '#fff',
            padding: '4px 9px', borderRadius: 999,
            fontFamily: font.body, fontSize: 10, fontWeight: 700,
            letterSpacing: 0.4, textTransform: 'uppercase',
          }}>
            <Icon d={ICONS.bolt} size={10} stroke="#fff" sw={2.4} fill="#fff" />
            em {t.startingSoon}
          </div>
        )}
      </div>

      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12,
      }}>
        <Meta icon={ICONS.cal} text={t.date} />
        <Meta icon={ICONS.clock} text={t.time} />
        <Meta icon={ICONS.pin} text={`${t.distance < 1000 ? t.distance + ' m' : (t.distance/1000).toFixed(1) + ' km'} de você`} />
      </div>

      <div style={{
        marginTop: 14, paddingTop: 14, borderTop: `1px dashed ${C.line}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
      }}>
        <div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            fontFamily: font.body, fontSize: 11, fontWeight: 700,
            color: C.jadeDeep, letterSpacing: 0.4, textTransform: 'uppercase',
          }}>
            <Icon d={ICONS.lock} size={11} stroke={C.jadeDeep} sw={2.2} />
            R$ {t.value} em escrow
          </div>
        </div>
        <button style={{
          appearance: 'none', cursor: canCheckIn ? 'pointer' : 'not-allowed', border: 0,
          background: canCheckIn ? C.jade : '#C7CBD9',
          color: canCheckIn ? C.jadeInk : '#fff',
          borderRadius: 12, padding: '10px 16px',
          fontFamily: font.body, fontSize: 13.5, fontWeight: 700,
          display: 'flex', alignItems: 'center', gap: 4,
          boxShadow: canCheckIn ? '0 8px 18px rgba(0,196,140,0.3)' : 'none',
          letterSpacing: -0.1,
        }}>
          Check-in
          <Icon d={ICONS.chev} size={14} stroke={canCheckIn ? C.jadeInk : '#fff'} sw={2.4} />
        </button>
      </div>
      {!canCheckIn && (
        <div style={{
          marginTop: 8,
          fontFamily: font.body, fontSize: 11, color: C.textSoft, textAlign: 'right',
        }}>
          Disponível a menos de 500 m do local
        </div>
      )}
    </div>
  );
}

// ─── Card: EM ANDAMENTO (live) ─────────────────────────────────────────────
function CardAndamento({ t }) {
  const [elapsed, setElapsed] = React.useState(2 * 3600 + 14 * 60);
  React.useEffect(() => {
    const i = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(i);
  }, []);
  const hh = Math.floor(elapsed / 3600);
  const mm = Math.floor((elapsed % 3600) / 60);
  const ss = elapsed % 60;
  const pad = n => String(n).padStart(2, '0');
  const totalSec = t.hours * 3600;
  const progress = Math.min(1, elapsed / totalSec);
  const accumulated = (parseFloat(t.value.replace(',', '.')) * progress).toFixed(2).replace('.', ',');

  return (
    <div style={{
      background: C.navy, color: '#fff', borderRadius: 18, padding: 16,
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: -60, right: -40, width: 180, height: 180,
        borderRadius: '50%',
        background: 'radial-gradient(closest-side, rgba(0,196,140,0.22), transparent 70%)',
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <CompanyMark letter={t.company[0]} color={t.color} />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(0,196,140,0.18)', color: '#7FE6C5',
              padding: '4px 9px', borderRadius: 999,
              fontFamily: font.body, fontSize: 10, fontWeight: 700,
              letterSpacing: 0.6, textTransform: 'uppercase',
            }}>
              <span style={{
                width: 5, height: 5, borderRadius: '50%', background: C.jade,
                animation: 'live-pulse 1.4s ease-out infinite',
              }} />
              Em andamento
            </div>
            <div style={{
              fontFamily: font.body, fontSize: 12, fontWeight: 600,
              color: 'rgba(255,255,255,0.55)', marginTop: 8,
            }}>{t.company}</div>
            <div style={{
              fontFamily: font.display, fontSize: 18, fontWeight: 700,
              letterSpacing: -0.4, marginTop: 1,
            }}>{t.role}</div>
          </div>
        </div>

        <div style={{
          fontFamily: font.display, fontSize: 44, fontWeight: 800,
          letterSpacing: -1.8, marginTop: 16, lineHeight: 1,
          fontVariantNumeric: 'tabular-nums',
        }}>
          {pad(hh)}:{pad(mm)}<span style={{ color: 'rgba(255,255,255,0.4)' }}>:{pad(ss)}</span>
        </div>

        <div style={{ marginTop: 12, height: 5, borderRadius: 3,
          background: 'rgba(255,255,255,0.10)', overflow: 'hidden',
        }}>
          <div style={{
            width: `${progress * 100}%`, height: '100%',
            background: `linear-gradient(90deg, ${C.jade}, #7FE6C5)`,
          }} />
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginTop: 14, gap: 12,
        }}>
          <div>
            <div style={{
              fontFamily: font.body, fontSize: 10.5, fontWeight: 700,
              color: 'rgba(255,255,255,0.55)', letterSpacing: 0.6, textTransform: 'uppercase',
            }}>Acumulado</div>
            <div style={{
              fontFamily: font.display, fontSize: 20, fontWeight: 800,
              color: '#7FE6C5', letterSpacing: -0.6, marginTop: 1,
              fontVariantNumeric: 'tabular-nums',
            }}>R$ {accumulated}</div>
          </div>
          <button style={{
            appearance: 'none', cursor: 'pointer', border: 0,
            background: C.jade, color: C.jadeInk,
            borderRadius: 12, padding: '11px 16px',
            fontFamily: font.body, fontSize: 13.5, fontWeight: 700,
            display: 'flex', alignItems: 'center', gap: 4,
            boxShadow: '0 8px 18px rgba(0,196,140,0.35)',
          }}>
            Check-out
            <Icon d={ICONS.chev} size={14} stroke={C.jadeInk} sw={2.4} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Card: CONCLUÍDO ───────────────────────────────────────────────────────
function CardConcluido({ t }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 18, padding: 16,
      border: `1px solid ${C.line}`,
    }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <CompanyMark letter={t.company[0]} color={t.color} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: font.body, fontSize: 12, fontWeight: 600,
            color: C.textMute,
          }}>{t.company} · {t.date}</div>
          <div style={{
            fontFamily: font.display, fontSize: 17, fontWeight: 700,
            color: C.text, letterSpacing: -0.4, marginTop: 1,
          }}>{t.role}</div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, marginTop: 6,
          }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              background: '#FFFBE6', color: '#7C5C00',
              padding: '3px 7px', borderRadius: 7,
              fontFamily: font.body, fontSize: 11.5, fontWeight: 700,
            }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="#F5B400"><path d={ICONS.star}/></svg>
              {t.rating.toFixed(1).replace('.', ',')}
            </div>
            <span style={{
              fontFamily: font.body, fontSize: 11.5, color: C.textSoft,
            }}>nota recebida</span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            fontFamily: font.body, fontSize: 10, fontWeight: 700,
            color: C.jadeDeep, letterSpacing: 0.4, textTransform: 'uppercase',
          }}>
            <Icon d={ICONS.check} size={11} stroke={C.jadeDeep} sw={2.6} />
            Liberado
          </div>
          <div style={{
            fontFamily: font.display, fontSize: 18, fontWeight: 800,
            color: C.jadeDeep, letterSpacing: -0.4, marginTop: 3,
          }}>R$ {t.value}</div>
        </div>
      </div>

      <div style={{
        marginTop: 14, paddingTop: 12, borderTop: `1px solid ${C.lineSoft}`,
        display: 'flex', gap: 8,
      }}>
        {t.evaluated ? (
          <div style={{
            flex: 1, padding: '10px 12px',
            background: C.surface3, borderRadius: 11,
            display: 'flex', alignItems: 'center', gap: 8,
            fontFamily: font.body, fontSize: 12.5, color: C.textMute,
          }}>
            <Icon d={ICONS.check} size={14} stroke={C.jadeDeep} sw={2.4} />
            Empresa avaliada
          </div>
        ) : (
          <button style={{
            flex: 1, appearance: 'none', cursor: 'pointer', border: 0,
            background: C.navy, color: '#fff',
            borderRadius: 11, padding: '10px 14px',
            fontFamily: font.body, fontSize: 13, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            <Icon d={ICONS.star} size={14} stroke="#fff" sw={2} fill="#fff" />
            Avaliar empresa
          </button>
        )}
        <button style={{
          appearance: 'none', cursor: 'pointer', border: 0,
          background: C.surface3, color: C.text,
          borderRadius: 11, padding: '10px 14px',
          fontFamily: font.body, fontSize: 13, fontWeight: 600,
        }}>Recibo</button>
      </div>
    </div>
  );
}

// ─── Card: CANCELADO ───────────────────────────────────────────────────────
function CardCancelado({ t }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 18, padding: 16,
      border: `1px solid ${C.line}`, opacity: 0.85,
    }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: C.surface3, color: C.textMute,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: font.display, fontWeight: 700, fontSize: 20,
        }}>{t.company[0]}</div>
        <div style={{ flex: 1 }}>
          <div style={{
            fontFamily: font.body, fontSize: 12, fontWeight: 600,
            color: C.textMute,
          }}>{t.company} · {t.date}</div>
          <div style={{
            fontFamily: font.display, fontSize: 16, fontWeight: 700,
            color: C.text, letterSpacing: -0.3, marginTop: 1,
            textDecoration: 'line-through', textDecorationColor: C.textSoft,
          }}>{t.role}</div>
        </div>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          background: C.surface3, color: C.textMute,
          padding: '3px 8px', borderRadius: 999,
          fontFamily: font.body, fontSize: 10, fontWeight: 700,
          letterSpacing: 0.4, textTransform: 'uppercase',
        }}>
          <Icon d={ICONS.x} size={10} stroke={C.textMute} sw={2.4} />
          Cancelado
        </div>
      </div>

      <div style={{
        marginTop: 12, padding: '10px 12px',
        background: C.surface2, borderRadius: 11,
        fontFamily: font.body, fontSize: 12.5, color: C.textMute, lineHeight: 1.4,
      }}>
        <b style={{ color: C.text }}>Motivo:</b> {t.reason}
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
  const active = 'shifts';
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

// ─── Helpers ───────────────────────────────────────────────────────────────
function Meta({ icon, text }) {
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

function SectionLabel({ children }) {
  return (
    <div style={{
      fontFamily: font.body, fontSize: 11.5, fontWeight: 700,
      color: C.textSoft, letterSpacing: 0.6, textTransform: 'uppercase',
      padding: '0 20px', marginTop: 18, marginBottom: 8,
    }}>{children}</div>
  );
}

// ─── Data ──────────────────────────────────────────────────────────────────
const PROXIMOS = [
  { id: 1, company: 'Bar do Pedrão', color: '#1B3FA0', role: 'Garçom', date: 'hoje', time: '18:00–23:00', distance: 12, value: '180,00', hours: 5, startingSoon: '4h' },
  { id: 2, company: 'Quintal Eventos', color: '#FF6B35', role: 'Bartender', date: 'sáb 25 mai', time: '20:00–02:00', distance: 3800, value: '260,00', hours: 6 },
  { id: 3, company: 'Vovó Tereza', color: '#00A372', role: 'Aux. de Cozinha', date: 'dom 26 mai', time: '11:00–17:00', distance: 800, value: '210,00', hours: 6 },
];
const ANDAMENTO = [
  { id: 10, company: 'Brasa Hamburgueria', color: '#7C2D12', role: 'Atendente de balcão', hours: 5, value: '165,00' },
];
const CONCLUIDOS = [
  { id: 20, company: 'Quintal Eventos', color: '#FF6B35', role: 'Bartender', date: 'sáb 18 mai', value: '260,00', rating: 5.0, evaluated: false },
  { id: 21, company: 'Bar do Pedrão', color: '#1B3FA0', role: 'Garçom', date: 'sex 17 mai', value: '180,00', rating: 5.0, evaluated: true },
  { id: 22, company: 'Vovó Tereza', color: '#00A372', role: 'Aux. de Cozinha', date: 'dom 12 mai', value: '210,00', rating: 4.8, evaluated: true },
  { id: 23, company: 'Brasa Hamburgueria', color: '#7C2D12', role: 'Atendente', date: 'qui 9 mai', value: '165,00', rating: 5.0, evaluated: true },
];
const CANCELADOS = [
  { id: 30, company: 'Espaço Areia', color: '#A67C00', role: 'Promotor', date: 'qua 8 mai', reason: 'Empresa cancelou 5h antes do início. Crédito de prioridade lançado no seu perfil.' },
];

// ─── Screen ────────────────────────────────────────────────────────────────
function MeusTurnos() {
  const [tab, setTab] = React.useState('prox');
  const counts = { prox: PROXIMOS.length, and: ANDAMENTO.length, conc: CONCLUIDOS.length, canc: CANCELADOS.length };

  return (
    <div style={{
      height: '100%', width: '100%', overflow: 'hidden',
      background: C.surface2, fontFamily: font.body, position: 'relative',
      display: 'flex', flexDirection: 'column',
    }}>
      <Header />
      <Tabs tab={tab} setTab={setTab} counts={counts} />
      <div style={{ flex: 1, overflow: 'auto', paddingBottom: 100 }}>
        {tab === 'prox' && (
          <>
            <SectionLabel>Hoje</SectionLabel>
            <div style={{ padding: '0 20px' }}>
              {PROXIMOS.filter(t => t.date === 'hoje').map(t => (
                <div key={t.id} style={{ marginBottom: 12 }}><CardProximo t={t} /></div>
              ))}
            </div>
            <SectionLabel>Próximos dias</SectionLabel>
            <div style={{ padding: '0 20px' }}>
              {PROXIMOS.filter(t => t.date !== 'hoje').map(t => (
                <div key={t.id} style={{ marginBottom: 12 }}><CardProximo t={t} /></div>
              ))}
            </div>
          </>
        )}
        {tab === 'and' && (
          <div style={{ padding: '18px 20px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {ANDAMENTO.map(t => <CardAndamento key={t.id} t={t} />)}
            {ANDAMENTO.length === 0 && <EmptyState label="Nenhum turno em andamento" />}
          </div>
        )}
        {tab === 'conc' && (
          <div style={{ padding: '18px 20px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {CONCLUIDOS.map(t => <CardConcluido key={t.id} t={t} />)}
          </div>
        )}
        {tab === 'canc' && (
          <div style={{ padding: '18px 20px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {CANCELADOS.map(t => <CardCancelado key={t.id} t={t} />)}
          </div>
        )}
      </div>
      <TabBar />
    </div>
  );
}

function EmptyState({ label }) {
  return (
    <div style={{
      padding: '40px 20px', textAlign: 'center',
      fontFamily: font.body, fontSize: 14, color: C.textMute,
    }}>{label}</div>
  );
}

function App() {
  return (
    <div style={{
      minHeight: '100vh', width: '100%',
      background: 'radial-gradient(1200px 800px at 50% 0%, #1a1a2e 0%, #0a0a14 60%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 0',
    }} data-screen-label="09 Meus Turnos">
      <IOSDevice width={402} height={874} dark={false}>
        <MeusTurnos />
      </IOSDevice>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
