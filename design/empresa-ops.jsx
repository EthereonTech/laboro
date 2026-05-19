// Empresa Operations: Vaga Detail + Turno Andamento + Avaliar — Tela 12

const { C, font } = window.LAB;

function Icon({ d, size = 18, stroke = 'currentColor', sw = 1.8, fill = 'none' }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}><path d={d} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
const ICONS = {
  back:   'M15 6l-6 6 6 6',
  chev:   'M9 6l6 6-6 6',
  heart:  'M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10Z',
  heartF: 'M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10Z',
  star:   'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.2L12 17l-5.4 3 1-6.2L3.2 9.5l6.1-.9L12 3Z',
  check:  'M5 12l4 4L19 7',
  x:      'M6 6l12 12M6 18L18 6',
  more:   'M5 12h.01M12 12h.01M19 12h.01',
  pin:    'M12 21s7-7 7-12a7 7 0 0 0-14 0c0 5 7 12 7 12Zm0-9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  clock:  'M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  cal:    'M3 9h18M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm3-2v4m8-4v4',
  warn:   'M12 3l10 18H2L12 3Zm0 6v6m0 3v.5',
  lock:   'M6 10V8a6 6 0 1 1 12 0v2M5 10h14v10H5z',
  phone:  'M5 4h3l2 5-2 1c.7 2 2.3 3.7 4.5 4.5l1-2 5 2v3a2 2 0 0 1-2 2C9.4 19 5 14.6 5 6a2 2 0 0 1 0-2Z',
  msg:    'M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-5 4V6Z',
  send:   'M3 11l18-8-8 18-2-8-8-2Z',
  briefcase:'M4 8h16v12H4zM8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 14h18',
};

// ─── Avatar ────────────────────────────────────────────────────────────────
function Avatar({ name, size = 44, ring }) {
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const hue = [...name].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `linear-gradient(135deg, oklch(0.65 0.15 ${hue}), oklch(0.45 0.18 ${(hue+30)%360}))`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontFamily: font.body, fontWeight: 700, fontSize: size * 0.36,
      boxShadow: ring ? `0 0 0 2px ${ring}, 0 0 0 4px rgba(255,255,255,0.4)` : 'none',
      flexShrink: 0,
    }}>{initials}</div>
  );
}

// ─── Compact vaga strip (shared) ───────────────────────────────────────────
function VagaStrip({ small }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 16, padding: 14,
      border: `1px solid ${C.line}`,
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: C.navy, color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: font.display, fontWeight: 700, fontSize: 20,
      }}>G</div>
      <div style={{ flex: 1 }}>
        <div style={{
          fontFamily: font.display, fontSize: 16, fontWeight: 700,
          color: C.text, letterSpacing: -0.3,
        }}>Garçom · 4 vagas</div>
        <div style={{
          fontFamily: font.body, fontSize: 12.5, color: C.textMute, marginTop: 2,
        }}>sex 24 mai · 18:00–23:00 · R$ 180/turno</div>
      </div>
    </div>
  );
}

// ─── TOP BAR ───────────────────────────────────────────────────────────────
function TopBar({ title, sub, action }) {
  return (
    <div style={{
      paddingTop: 56, padding: '56px 20px 14px',
      background: '#fff', borderBottom: `1px solid ${C.lineSoft}`,
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <button style={{
        appearance: 'none', cursor: 'pointer', border: 0,
        width: 40, height: 40, borderRadius: 12, background: C.surface3,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon d={ICONS.back} size={18} stroke={C.text} sw={2.2} />
      </button>
      <div style={{ flex: 1 }}>
        <div style={{
          fontFamily: font.body, fontSize: 11.5, fontWeight: 700,
          color: C.textSoft, letterSpacing: 0.6, textTransform: 'uppercase',
        }}>{sub}</div>
        <div style={{
          fontFamily: font.display, fontSize: 17, fontWeight: 700,
          color: C.text, letterSpacing: -0.4, marginTop: 1,
        }}>{title}</div>
      </div>
      {action}
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// VIEW 1: Vaga Detail (candidates list)
// ───────────────────────────────────────────────────────────────────────────
const CANDIDATES = [
  { id: 1, name: 'Júlio Santos', rating: 4.9, turnos: 23, returning: 4, specs: ['Garçom', 'Bartender'], level: 'Verificado', status: 'confirmado', favorite: true },
  { id: 2, name: 'Carla Mendes', rating: 5.0, turnos: 41, returning: 0, specs: ['Garçom', 'Recepção'], level: 'Top Pro', status: 'confirmado', favorite: false },
  { id: 3, name: 'Beto Cardoso', rating: 4.7, turnos: 12, returning: 0, specs: ['Garçom'], level: 'Verificado', status: 'pendente', favorite: false },
  { id: 4, name: 'Letícia Alves', rating: 4.8, turnos: 18, returning: 1, specs: ['Garçom', 'Aux. cozinha'], level: 'Verificado', status: 'pendente', favorite: false },
];

function LevelTag({ level }) {
  const map = {
    'Iniciante':  { bg: C.surface3, fg: C.textMute },
    'Verificado': { bg: C.jadeSoft, fg: C.jadeDeep },
    'Top Pro':    { bg: '#FFF1E9',  fg: C.orange },
  };
  const m = map[level];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      background: m.bg, color: m.fg,
      padding: '2px 7px', borderRadius: 999,
      fontFamily: font.body, fontSize: 10, fontWeight: 700,
      letterSpacing: 0.4, textTransform: 'uppercase',
    }}>
      <Icon d={ICONS.check} size={9} stroke={m.fg} sw={3} />
      {level}
    </span>
  );
}

function CandidateRow({ c, onConfirm, onFav }) {
  const statusMap = {
    confirmado: { color: C.jade, label: 'Confirmado', bg: C.jadeSoft, fg: C.jadeDeep },
    pendente:   { color: C.orange, label: 'Pendente', bg: '#FFF1E9', fg: C.orange },
    cancelado:  { color: C.textSoft, label: 'Cancelado', bg: C.surface3, fg: C.textMute },
  };
  const s = statusMap[c.status];
  return (
    <div style={{
      background: '#fff', borderRadius: 16, padding: 14,
      border: `1px solid ${C.line}`,
    }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <Avatar name={c.name} size={48} ring={s.color} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              fontFamily: font.display, fontSize: 16, fontWeight: 700,
              color: C.text, letterSpacing: -0.3,
            }}>{c.name}</div>
            <LevelTag level={c.level} />
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, marginTop: 4,
            fontFamily: font.body, fontSize: 12, color: C.textMute,
          }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="#F5B400"><path d={ICONS.star}/></svg>
              <b style={{ color: C.text }}>{c.rating.toFixed(1).replace('.', ',')}</b>
            </span>
            <span>·</span>
            <span><b style={{ color: C.text }}>{c.turnos}</b> turnos</span>
            {c.returning > 0 && (
              <>
                <span>·</span>
                <span style={{ color: C.jadeDeep, fontWeight: 700 }}>
                  {c.returning}× aqui
                </span>
              </>
            )}
          </div>
          <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {c.specs.map(s => (
              <span key={s} style={{
                background: C.surface3, color: C.textMute,
                padding: '2px 7px', borderRadius: 6,
                fontFamily: font.body, fontSize: 10.5, fontWeight: 600,
              }}>{s}</span>
            ))}
          </div>
        </div>
        <button onClick={() => onFav(c.id)} style={{
          appearance: 'none', cursor: 'pointer', border: 0, background: 'transparent',
          padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon d={ICONS.heart} size={20}
            stroke={c.favorite ? C.orange : C.textSoft}
            fill={c.favorite ? C.orange : 'none'}
            sw={2}
          />
        </button>
      </div>

      <div style={{
        marginTop: 12, paddingTop: 10, borderTop: `1px solid ${C.lineSoft}`,
        display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'space-between',
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          background: s.bg, color: s.fg,
          padding: '4px 10px', borderRadius: 999,
          fontFamily: font.body, fontSize: 11, fontWeight: 700,
          letterSpacing: 0.4, textTransform: 'uppercase',
        }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.fg }} />
          {s.label}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button style={{
            appearance: 'none', cursor: 'pointer', border: 0,
            background: C.surface3, color: C.text,
            borderRadius: 9, padding: '6px 10px',
            fontFamily: font.body, fontSize: 12, fontWeight: 700,
          }}>Perfil</button>
          {c.status === 'pendente' && (
            <button onClick={() => onConfirm(c.id)} style={{
              appearance: 'none', cursor: 'pointer', border: 0,
              background: C.navy, color: '#fff',
              borderRadius: 9, padding: '6px 12px',
              fontFamily: font.body, fontSize: 12, fontWeight: 700,
            }}>Confirmar</button>
          )}
        </div>
      </div>
    </div>
  );
}

function ViewVagaDetail() {
  const [list, setList] = React.useState(CANDIDATES);
  const confirmAll = () => setList(list.map(c => c.status === 'pendente' ? { ...c, status: 'confirmado' } : c));
  const onConfirm = (id) => setList(list.map(c => c.id === id ? { ...c, status: 'confirmado' } : c));
  const onFav = (id) => setList(list.map(c => c.id === id ? { ...c, favorite: !c.favorite } : c));
  const confirmedCount = list.filter(c => c.status === 'confirmado').length;
  const pendentes = list.filter(c => c.status === 'pendente').length;

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden',
      background: C.surface2,
    }}>
      <TopBar
        title="Garçom · 4 vagas"
        sub="Vaga em aberto"
        action={
          <button style={{
            appearance: 'none', cursor: 'pointer', border: 0,
            width: 40, height: 40, borderRadius: 12, background: C.surface3,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}><Icon d={ICONS.more} size={16} stroke={C.text} sw={3} /></button>
        }
      />

      <div style={{ flex: 1, overflow: 'auto', padding: '16px 20px 210px' }}>
        <VagaStrip />

        {/* progress */}
        <div style={{
          marginTop: 14, padding: 14,
          background: '#fff', borderRadius: 16, border: `1px solid ${C.line}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{
              fontFamily: font.body, fontSize: 12, fontWeight: 700,
              color: C.textSoft, letterSpacing: 0.4, textTransform: 'uppercase',
            }}>Preenchimento</div>
            <div style={{
              fontFamily: font.display, fontSize: 17, fontWeight: 800,
              color: C.text, letterSpacing: -0.3,
            }}>{confirmedCount} <span style={{ color: C.textSoft, fontWeight: 600 }}>/ 4</span></div>
          </div>
          <div style={{ height: 6, borderRadius: 3, background: C.surface3, overflow: 'hidden' }}>
            <div style={{
              width: `${(confirmedCount / 4) * 100}%`, height: '100%',
              background: confirmedCount === 4 ? C.jade : C.navy,
              transition: 'width 200ms',
            }} />
          </div>
        </div>

        {/* candidates */}
        <div style={{
          marginTop: 22, marginBottom: 10,
          display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        }}>
          <div style={{
            fontFamily: font.display, fontSize: 18, fontWeight: 700,
            color: C.text, letterSpacing: -0.4,
          }}>Candidatos ({list.length})</div>
          {pendentes > 0 && (
            <div style={{
              fontFamily: font.body, fontSize: 12, fontWeight: 700, color: C.orange,
            }}>{pendentes} pendentes</div>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {list.map(c => (
            <CandidateRow key={c.id} c={c} onConfirm={onConfirm} onFav={onFav} />
          ))}
        </div>

        {/* instructions */}
        <div style={{ marginTop: 22 }}>
          <div style={{
            fontFamily: font.display, fontSize: 18, fontWeight: 700,
            color: C.text, letterSpacing: -0.4, marginBottom: 10,
          }}>Instruções do turno</div>
          <div style={{
            background: '#fff', borderRadius: 16, padding: 14,
            border: `1px solid ${C.line}`,
            fontFamily: font.body, fontSize: 13.5, color: C.text, lineHeight: 1.5,
          }}>
            Camisa preta lisa, sapato fechado, RG com foto. Apresentar-se 15 min antes na entrada de funcionários. Casa de show com 12 mesas, fluxo médio-alto.
            <button style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              marginTop: 10, appearance: 'none', cursor: 'pointer', border: 0,
              background: 'transparent', color: C.navy,
              fontFamily: font.body, fontSize: 12.5, fontWeight: 700, padding: 0,
            }}>Editar instruções <Icon d={ICONS.chev} size={12} stroke={C.navy} sw={2.4} /></button>
          </div>
        </div>
      </div>

      {pendentes > 0 && (
        <div style={{
          position: 'absolute', bottom: 73, left: 0, right: 0,
          padding: '12px 20px 14px',
          background: 'linear-gradient(180deg, rgba(248,249,252,0) 0%, #F8F9FC 30%)',
        }}>
          <button onClick={confirmAll} style={{
            width: '100%', appearance: 'none', cursor: 'pointer', border: 0,
            background: C.navy, color: '#fff', borderRadius: 18, padding: '15px',
            fontFamily: font.body, fontSize: 15, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            boxShadow: '0 14px 26px rgba(27,63,160,0.35)',
          }}>
            Confirmar todos ({pendentes})
            <Icon d={ICONS.chev} size={16} stroke="#fff" sw={2.5} />
          </button>
        </div>
      )}
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// VIEW 2: Turno em Andamento (empresa)
// ───────────────────────────────────────────────────────────────────────────
const WORKERS_AT_SHIFT = [
  { id: 1, name: 'Júlio Santos', status: 'present', checkInTime: '18:02', rating: 4.9 },
  { id: 2, name: 'Carla Mendes', status: 'present', checkInTime: '17:58', rating: 5.0 },
  { id: 3, name: 'Beto Cardoso', status: 'waiting', checkInTime: null, rating: 4.7 },
  { id: 4, name: 'Letícia Alves', status: 'done', checkInTime: '17:55', checkOutTime: '22:48', rating: 4.8 },
];

function WorkerStatusRow({ w }) {
  const map = {
    waiting: { color: C.orange, bg: '#FFF1E9', label: 'Aguardando', sub: 'GPS a 280 m', dot: C.orange },
    present: { color: C.jade, bg: C.jadeSoft, label: 'Presente', sub: `check-in às ${w.checkInTime}`, dot: C.jade },
    done:    { color: C.navy, bg: '#E8F0FF', label: 'Check-out feito', sub: `saiu às ${w.checkOutTime}`, dot: C.navy },
  };
  const s = map[w.status];
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: 14,
      background: '#fff', borderRadius: 14,
      border: `1px solid ${C.line}`,
    }}>
      <Avatar name={w.name} size={42} ring={s.color} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{
            fontFamily: font.display, fontSize: 15, fontWeight: 700,
            color: C.text, letterSpacing: -0.3,
          }}>{w.name}</div>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 3,
            fontFamily: font.body, fontSize: 11, color: C.textMute,
          }}>
            <svg width="9" height="9" viewBox="0 0 24 24" fill="#F5B400"><path d={ICONS.star}/></svg>
            {w.rating.toFixed(1).replace('.', ',')}
          </span>
        </div>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          background: s.bg, color: s.color,
          padding: '2px 8px', borderRadius: 999, marginTop: 5,
          fontFamily: font.body, fontSize: 10.5, fontWeight: 700,
          letterSpacing: 0.4, textTransform: 'uppercase',
        }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.dot }} />
          {s.label}
        </div>
        <div style={{
          fontFamily: font.body, fontSize: 11.5, color: C.textSoft, marginTop: 4,
        }}>{s.sub}</div>
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        <button style={{
          appearance: 'none', cursor: 'pointer', border: 0,
          width: 34, height: 34, borderRadius: 10, background: C.surface3,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon d={ICONS.msg} size={15} stroke={C.navy} sw={2} />
        </button>
        <button style={{
          appearance: 'none', cursor: 'pointer', border: 0,
          width: 34, height: 34, borderRadius: 10, background: C.navy,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon d={ICONS.phone} size={15} stroke="#fff" sw={2} />
        </button>
      </div>
    </div>
  );
}

function ViewTurnoEmpresa() {
  const [elapsed, setElapsed] = React.useState(2 * 3600 + 14 * 60);
  React.useEffect(() => {
    const i = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(i);
  }, []);
  const hh = Math.floor(elapsed / 3600);
  const mm = Math.floor((elapsed % 3600) / 60);
  const ss = elapsed % 60;
  const pad = n => String(n).padStart(2, '0');

  const present = WORKERS_AT_SHIFT.filter(w => w.status === 'present').length;
  const waiting = WORKERS_AT_SHIFT.filter(w => w.status === 'waiting').length;
  const done = WORKERS_AT_SHIFT.filter(w => w.status === 'done').length;

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden',
      background: C.surface2,
    }}>
      <TopBar title="Garçom · em andamento" sub="Turno ao vivo" />

      <div style={{ flex: 1, overflow: 'auto', padding: '16px 20px 210px' }}>
        {/* live timer */}
        <div style={{
          background: C.navy, borderRadius: 20, padding: 18,
          color: '#fff', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: -80, right: -60, width: 220, height: 220,
            borderRadius: '50%',
            background: 'radial-gradient(closest-side, rgba(0,196,140,0.22), transparent 70%)',
          }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(0,196,140,0.18)', color: '#7FE6C5',
              padding: '4px 10px', borderRadius: 999,
              fontFamily: font.body, fontSize: 11, fontWeight: 700,
              letterSpacing: 0.6, textTransform: 'uppercase',
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%', background: C.jade,
                animation: 'live-pulse 1.4s ease-out infinite',
              }} />
              {present} no local · {waiting} pendente · {done} finalizado
            </div>
            <div style={{
              fontFamily: font.display, fontSize: 48, fontWeight: 800,
              letterSpacing: -1.8, marginTop: 12, lineHeight: 1,
              fontVariantNumeric: 'tabular-nums',
            }}>
              {pad(hh)}:{pad(mm)}<span style={{ color: 'rgba(255,255,255,0.4)' }}>:{pad(ss)}</span>
            </div>
            <div style={{
              fontFamily: font.body, fontSize: 12.5, color: 'rgba(255,255,255,0.6)', marginTop: 6,
            }}>
              Iniciado 18:00 · previsto até 23:00
            </div>
          </div>
        </div>

        {/* worker list */}
        <div style={{ marginTop: 22 }}>
          <div style={{
            fontFamily: font.display, fontSize: 18, fontWeight: 700,
            color: C.text, letterSpacing: -0.4, marginBottom: 10,
          }}>Equipe no turno</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {WORKERS_AT_SHIFT.map(w => <WorkerStatusRow key={w.id} w={w} />)}
          </div>
        </div>

        {/* mini map / locator card */}
        <div style={{
          marginTop: 18,
          background: '#fff', borderRadius: 16, padding: 14,
          border: `1px solid ${C.line}`,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{
            width: 56, height: 44, borderRadius: 10,
            background: '#F1F3F9', position: 'relative', overflow: 'hidden',
          }}>
            <svg viewBox="0 0 60 44" width="100%" height="100%">
              <path d="M0 30 L60 26" stroke="#fff" strokeWidth="6"/>
              <path d="M30 -4 L34 50" stroke="#fff" strokeWidth="4"/>
              <circle cx="32" cy="22" r="10" fill="#1B3FA0" opacity="0.2"/>
              <circle cx="32" cy="22" r="4" fill="#1B3FA0"/>
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{
              fontFamily: font.body, fontSize: 13.5, fontWeight: 700, color: C.text,
            }}>Ver localização da equipe</div>
            <div style={{
              fontFamily: font.body, fontSize: 11.5, color: C.textMute, marginTop: 1,
            }}>Mapa em tempo real dos trabalhadores</div>
          </div>
          <Icon d={ICONS.chev} size={16} stroke={C.textMute} sw={2} />
        </div>
      </div>

      <div style={{
        position: 'absolute', bottom: 73, left: 0, right: 0,
        padding: '12px 20px 14px',
        background: 'linear-gradient(180deg, rgba(248,249,252,0) 0%, #F8F9FC 30%)',
      }}>
        <button style={{
          width: '100%', appearance: 'none', cursor: 'pointer', border: 0,
          background: '#fff', color: C.orange,
          border: `1.5px solid ${C.orange}`,
          borderRadius: 18, padding: '14px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          fontFamily: font.body, fontSize: 14.5, fontWeight: 700,
        }}>
          <Icon d={ICONS.warn} size={16} stroke={C.orange} sw={2.2} />
          Reportar problema
        </button>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// VIEW 3: Avaliar Trabalhador
// ───────────────────────────────────────────────────────────────────────────
function ViewAvaliar() {
  const [rating, setRating] = React.useState(5);
  const [hover, setHover] = React.useState(0);
  const [tags, setTags] = React.useState(['pontual', 'voltaria']);
  const [comment, setComment] = React.useState('Atendeu super bem, chegou cedo e foi educado com os clientes. Recomendo!');

  const tagOpts = [
    { id: 'pontual', label: 'Pontual' },
    { id: 'apresentacao', label: 'Boa apresentação' },
    { id: 'trabalhou', label: 'Trabalhou bem' },
    { id: 'simpatico', label: 'Simpático com clientes' },
    { id: 'voltaria', label: 'Voltaria a contratar' },
  ];
  const toggleTag = (id) => setTags(tags.includes(id) ? tags.filter(t => t !== id) : [...tags, id]);

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden',
      background: C.surface2,
    }}>
      <TopBar title="Avaliar trabalhador" sub="Turno encerrado" />

      <div style={{ flex: 1, overflow: 'auto', padding: '24px 20px 210px' }}>
        {/* worker header */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
        }}>
          <Avatar name="Júlio Santos" size={88} ring={C.jade} />
          <div style={{
            fontFamily: font.display, fontSize: 22, fontWeight: 800,
            color: C.text, letterSpacing: -0.6, marginTop: 12,
          }}>Júlio Santos</div>
          <div style={{
            fontFamily: font.body, fontSize: 13, color: C.textMute, marginTop: 2,
          }}>Garçom · 24 mai · 18h–23h · 5h</div>
        </div>

        {/* stars */}
        <div style={{
          marginTop: 26,
          background: '#fff', borderRadius: 18, padding: 20,
          border: `1px solid ${C.line}`,
          textAlign: 'center',
        }}>
          <div style={{
            fontFamily: font.body, fontSize: 12, fontWeight: 700,
            color: C.textSoft, letterSpacing: 0.5, textTransform: 'uppercase',
          }}>Como foi o desempenho?</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 14 }}>
            {[1, 2, 3, 4, 5].map(n => {
              const active = (hover || rating) >= n;
              return (
                <button
                  key={n}
                  onMouseEnter={() => setHover(n)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => setRating(n)}
                  style={{
                    appearance: 'none', cursor: 'pointer', border: 0, background: 'transparent',
                    padding: 4,
                    transform: active ? 'scale(1)' : 'scale(0.92)',
                    transition: 'all 150ms',
                  }}
                >
                  <svg width="36" height="36" viewBox="0 0 24 24"
                       fill={active ? '#F5B400' : '#E1E5F0'}
                       stroke={active ? '#F5B400' : '#E1E5F0'}
                       strokeWidth="1" strokeLinejoin="round">
                    <path d={ICONS.star}/>
                  </svg>
                </button>
              );
            })}
          </div>
          <div style={{
            marginTop: 8,
            fontFamily: font.display, fontSize: 16, fontWeight: 800,
            color: C.text, letterSpacing: -0.3,
          }}>
            {['Selecione', 'Muito ruim', 'Ruim', 'Regular', 'Bom', 'Excelente'][hover || rating]}
          </div>
        </div>

        {/* tags */}
        <div style={{ marginTop: 22 }}>
          <div style={{
            fontFamily: font.body, fontSize: 12, fontWeight: 700,
            color: C.textSoft, letterSpacing: 0.5, textTransform: 'uppercase',
            marginBottom: 10,
          }}>O que destacar?</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {tagOpts.map(t => {
              const active = tags.includes(t.id);
              return (
                <button key={t.id} onClick={() => toggleTag(t.id)} style={{
                  appearance: 'none', cursor: 'pointer',
                  background: active ? C.navy : '#fff',
                  color: active ? '#fff' : C.text,
                  border: `1.5px solid ${active ? C.navy : C.line}`,
                  borderRadius: 999, padding: '8px 12px',
                  fontFamily: font.body, fontSize: 13, fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: 5,
                  transition: 'all 120ms',
                }}>
                  {active && <Icon d={ICONS.check} size={13} stroke="#fff" sw={3} />}
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* comment */}
        <div style={{ marginTop: 22 }}>
          <div style={{
            fontFamily: font.body, fontSize: 12, fontWeight: 700,
            color: C.textSoft, letterSpacing: 0.5, textTransform: 'uppercase',
            marginBottom: 10,
          }}>Comentário (opcional)</div>
          <div style={{
            background: '#fff', borderRadius: 14, padding: 14,
            border: `1px solid ${C.line}`,
          }}>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Conte um pouco sobre o turno…"
              rows={4}
              style={{
                width: '100%', appearance: 'none', border: 0, outline: 0,
                fontFamily: font.body, fontSize: 14, color: C.text,
                background: 'transparent', resize: 'none', lineHeight: 1.45,
              }}
            />
          </div>
        </div>

        {/* escrow info */}
        <div style={{
          marginTop: 18,
          background: 'linear-gradient(180deg, #F7FFFB, #F1FBF6)',
          border: `1px solid ${C.jade}33`,
          borderRadius: 14, padding: 14,
          display: 'flex', gap: 10, alignItems: 'center',
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9, background: '#fff',
            border: `1px solid ${C.jade}33`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon d={ICONS.lock} size={15} stroke={C.jadeDeep} sw={2} />
          </div>
          <div style={{
            flex: 1, fontFamily: font.body, fontSize: 12.5,
            color: C.textMute, lineHeight: 1.4,
          }}>
            <b style={{ color: C.jadeInk }}>R$ 180,00</b> em escrow serão liberados via Pix para Júlio assim que você enviar a avaliação.
          </div>
        </div>
      </div>

      <div style={{
        position: 'absolute', bottom: 73, left: 0, right: 0,
        padding: '12px 20px 14px',
        background: 'linear-gradient(180deg, rgba(248,249,252,0) 0%, #F8F9FC 30%)',
      }}>
        <button style={{
          width: '100%', appearance: 'none', cursor: 'pointer', border: 0,
          background: C.jade, color: C.jadeInk, borderRadius: 18, padding: '15px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          fontFamily: font.body, fontSize: 15, fontWeight: 700,
          boxShadow: '0 14px 26px rgba(0,196,140,0.4)',
        }}>
          <Icon d={ICONS.send} size={16} stroke={C.jadeInk} sw={2.2} fill={C.jadeInk} />
          Enviar avaliação e liberar pagamento
        </button>
      </div>
    </div>
  );
}

// ─── View switcher ─────────────────────────────────────────────────────────
function ViewSwitcher({ view, setView }) {
  return (
    <div style={{
      position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)',
      zIndex: 100,
      background: 'rgba(255,255,255,0.9)',
      backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
      border: `1px solid ${C.line}`,
      borderRadius: 999, padding: 4,
      display: 'flex', gap: 2,
      boxShadow: '0 4px 14px rgba(14,42,120,0.10)',
    }}>
      {[['vaga', 'Candidatos'], ['turno', 'Em andamento'], ['avaliar', 'Avaliar']].map(([id, label]) => (
        <button key={id} onClick={() => setView(id)} style={{
          appearance: 'none', cursor: 'pointer', border: 0,
          background: view === id ? C.navy : 'transparent',
          color: view === id ? '#fff' : C.textMute,
          borderRadius: 999, padding: '5px 11px',
          fontFamily: font.body, fontSize: 11, fontWeight: 700,
        }}>{label}</button>
      ))}
    </div>
  );
}

// ─── Empresa tab bar ───────────────────────────────────────────────────────
const EMPRESA_NAV = {
  home:  '05 Empresa Home + Postar Vaga.html',
  vagas: '12 Empresa Operações.html',
  team:  '13 Empresa Financeiro + Equipe.html?view=team',
  pay:   '13 Empresa Financeiro + Equipe.html?view=fin',
};
function EmpresaTabBar({ active = 'vagas' }) {
  const tabs = [
    { id: 'home',   label: 'Início',     icon: ICONS.back },
    { id: 'vagas',  label: 'Vagas',      icon: ICONS.briefcase },
    { id: 'team',   label: 'Equipe',     icon: ICONS.users },
    { id: 'pay',    label: 'Financeiro', icon: ICONS.wallet },
  ];
  // local icons that differ from existing ICONS
  const ICONS_TB = {
    home:  'M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-4v-7h-6v7H5a1 1 0 0 1-1-1v-9Z',
    briefcase: ICONS.briefcase,
    users: 'M9 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm9 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-15 9a6 6 0 0 1 12 0M16 14a5 5 0 0 1 5 6',
    wallet:'M3 7a2 2 0 0 1 2-2h13l3 4v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Zm14 5a1.5 1.5 0 1 0 0 3h4v-3h-4z',
  };
  const iconFor = (id) => ({ home: ICONS_TB.home, vagas: ICONS_TB.briefcase, team: ICONS_TB.users, pay: ICONS_TB.wallet }[id]);
  const go = (id) => {
    if (id === active) return;
    window.location.href = encodeURI(EMPRESA_NAV[id]);
  };
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      paddingBottom: 28, paddingTop: 8,
      background: '#fff', borderTop: `1px solid ${C.lineSoft}`,
      display: 'flex', justifyContent: 'space-around', alignItems: 'center', zIndex: 6,
    }}>
      {tabs.map(t => {
        const isActive = t.id === active;
        return (
          <button key={t.id} onClick={() => go(t.id)} style={{
            appearance: 'none', border: 0, background: 'transparent',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            padding: '6px 12px', cursor: 'pointer',
          }}>
            <Icon d={iconFor(t.id)} size={22} stroke={isActive ? C.navy : C.textSoft} sw={isActive ? 2.2 : 1.8} />
            <div style={{
              fontFamily: font.body, fontSize: 10.5,
              fontWeight: isActive ? 700 : 500,
              color: isActive ? C.navy : C.textSoft,
            }}>{t.label}</div>
          </button>
        );
      })}
    </div>
  );
}

function App() {
  const [view, setView] = React.useState('vaga');
  return (
    <div style={{
      minHeight: '100vh', width: '100%',
      background: 'radial-gradient(1200px 800px at 50% 0%, #1a1a2e 0%, #0a0a14 60%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 0',
    }} data-screen-label="12 Empresa Operações">
      <IOSDevice width={402} height={874} dark={false}>
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          <ViewSwitcher view={view} setView={setView} />
          {view === 'vaga' && <ViewVagaDetail />}
          {view === 'turno' && <ViewTurnoEmpresa />}
          {view === 'avaliar' && <ViewAvaliar />}
          <EmpresaTabBar active="vagas" />
        </div>
      </IOSDevice>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
