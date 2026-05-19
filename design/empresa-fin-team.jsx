// Empresa: Financeiro + Equipe Favorita — Laboro Tela 13

const { C, font } = window.LAB;

function Icon({ d, size = 18, stroke = 'currentColor', sw = 1.8, fill = 'none' }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}><path d={d} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
const ICONS = {
  back:   'M15 6l-6 6 6 6',
  chev:   'M9 6l6 6-6 6',
  chevD:  'M6 9l6 6 6-6',
  filter: 'M4 5h16M7 12h10M10 19h4',
  doc:    'M6 3h9l4 4v14H6V3Zm9 0v4h4',
  heart:  'M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10Z',
  star:   'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.2L12 17l-5.4 3 1-6.2L3.2 9.5l6.1-.9L12 3Z',
  check:  'M5 12l4 4L19 7',
  lock:   'M6 10V8a6 6 0 1 1 12 0v2M5 10h14v10H5z',
  send:   'M3 11l18-8-8 18-2-8-8-2Z',
  plus:   'M12 5v14M5 12h14',
  x:      'M6 6l12 12M6 18L18 6',
  arrow:  'M5 12h14m-4-4l4 4-4 4',
  download:'M12 4v12m0 0l-4-4m4 4l4-4M5 20h14',
  home:   'M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-4v-7h-6v7H5a1 1 0 0 1-1-1v-9Z',
  briefcase:'M4 8h16v12H4zM8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 14h18',
  users:  'M9 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm9 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-15 9a6 6 0 0 1 12 0M16 14a5 5 0 0 1 5 6',
  wallet: 'M3 7a2 2 0 0 1 2-2h13l3 4v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Zm14 5a1.5 1.5 0 1 0 0 3h4v-3h-4z',
};

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

// ─── Tab bar ───────────────────────────────────────────────────────────────
const EMPRESA_NAV = {
  home:  '05 Empresa Home + Postar Vaga.html',
  vagas: '12 Empresa Operações.html',
  team:  '13 Empresa Financeiro + Equipe.html?view=team',
  pay:   '13 Empresa Financeiro + Equipe.html?view=fin',
};
function EmpresaTabBar({ active = 'pay', onLocal }) {
  const tabs = [
    { id: 'home',   label: 'Início',     icon: ICONS.home },
    { id: 'vagas',  label: 'Vagas',      icon: ICONS.briefcase },
    { id: 'team',   label: 'Equipe',     icon: ICONS.users },
    { id: 'pay',    label: 'Financeiro', icon: ICONS.wallet },
  ];
  const go = (id) => {
    if (onLocal && onLocal(id)) return;
    if (id === active) return;
    window.location.href = encodeURI(EMPRESA_NAV[id]);
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
            }}>{t.label}</div>
          </button>
        );
      })}
    </div>
  );
}

// ─── Status pill for charges ───────────────────────────────────────────────
function ChargeStatus({ s }) {
  const map = {
    retida:   { bg: '#FFF1E9', fg: C.orange,    icon: ICONS.lock,  label: 'Retida' },
    liberada: { bg: C.jadeSoft, fg: C.jadeDeep, icon: ICONS.check, label: 'Cobrada' },
    estornada:{ bg: C.surface3, fg: C.textMute, icon: ICONS.x,     label: 'Estornada' },
  };
  const m = map[s];
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

// ─── VIEW 1: Financeiro ────────────────────────────────────────────────────
const CHARGES = [
  { id: 1, role: 'Garçom', date: 'hoje', n: 4, gross: '720,00', commission: '118,80', total: '838,80', status: 'retida', month: 'maio' },
  { id: 2, role: 'Bartender', date: '20 mai', n: 3, gross: '780,00', commission: '128,70', total: '908,70', status: 'liberada', month: 'maio' },
  { id: 3, role: 'Aux. de Cozinha', date: '15 mai', n: 2, gross: '420,00', commission: '69,30', total: '489,30', status: 'liberada', month: 'maio' },
  { id: 4, role: 'Recepcionista', date: '12 mai', n: 2, gross: '390,00', commission: '64,35', total: '454,35', status: 'liberada', month: 'maio' },
  { id: 5, role: 'Garçom', date: '5 mai', n: 1, gross: '180,00', commission: '29,70', total: '209,70', status: 'estornada', month: 'maio' },
];

function FinanceHeader() {
  return (
    <div style={{
      background: C.navy, color: '#fff',
      padding: '56px 20px 56px',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: -100, right: -60, width: 280, height: 280,
        borderRadius: '50%',
        background: 'radial-gradient(closest-side, rgba(0,196,140,0.20), transparent 70%)',
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
        maskImage: 'linear-gradient(180deg, transparent, #000 30%, #000 100%)',
        WebkitMaskImage: 'linear-gradient(180deg, transparent, #000 30%, #000 100%)',
      }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{
          fontFamily: font.body, fontSize: 11.5, fontWeight: 700,
          color: 'rgba(255,255,255,0.55)', letterSpacing: 0.6, textTransform: 'uppercase',
        }}>Gasto em maio · 2026</div>
        <div style={{
          fontFamily: font.display, fontSize: 38, fontWeight: 800,
          letterSpacing: -1.3, marginTop: 4, lineHeight: 1,
        }}>R$ 2.901,00</div>

        <div style={{
          marginTop: 18, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
          gap: 10,
        }}>
          <FinKPI label="Turnos" value="12" />
          <FinKPI label="Em escrow" value="R$ 838,80" tint="#FFB89A" />
          <FinKPI label="Comissão" value="R$ 410,85" tint="rgba(255,255,255,0.85)" small />
        </div>
      </div>
    </div>
  );
}

function FinKPI({ label, value, tint = '#fff', small }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.10)',
      borderRadius: 12, padding: 12,
    }}>
      <div style={{
        fontFamily: font.body, fontSize: 10.5, fontWeight: 600,
        color: 'rgba(255,255,255,0.55)', letterSpacing: 0.3, textTransform: 'uppercase',
      }}>{label}</div>
      <div style={{
        fontFamily: font.display, fontSize: small ? 14 : 16, fontWeight: 800,
        color: tint, letterSpacing: -0.3, marginTop: 5,
      }}>{value}</div>
    </div>
  );
}

function ChargeRow({ c }) {
  return (
    <div style={{
      padding: 14, background: '#fff',
      borderBottom: `1px solid ${C.lineSoft}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{
            fontFamily: font.body, fontSize: 11, fontWeight: 600,
            color: C.textMute, letterSpacing: 0.2,
          }}>{c.date} · {c.n} trabalhador{c.n > 1 ? 'es' : ''}</div>
          <div style={{
            fontFamily: font.display, fontSize: 15, fontWeight: 700,
            color: C.text, letterSpacing: -0.3, marginTop: 1,
          }}>{c.role}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <ChargeStatus s={c.status} />
          <div style={{
            fontFamily: font.display, fontSize: 16, fontWeight: 800,
            color: c.status === 'estornada' ? C.textSoft : C.text,
            letterSpacing: -0.3, marginTop: 5,
            textDecoration: c.status === 'estornada' ? 'line-through' : 'none',
          }}>R$ {c.total}</div>
        </div>
      </div>
      {/* breakdown */}
      <div style={{
        marginTop: 8, padding: '8px 10px',
        background: C.surface2, borderRadius: 9,
        display: 'flex', justifyContent: 'space-between',
        fontFamily: font.body, fontSize: 11.5, color: C.textMute,
      }}>
        <span>Diárias: R$ {c.gross}</span>
        <span>+ Laboro 16,5%: R$ {c.commission}</span>
      </div>
    </div>
  );
}

function ViewFinanceiro() {
  return (
    <div style={{
      height: '100%', overflow: 'auto', background: C.surface2, paddingBottom: 100,
    }}>
      <FinanceHeader />

      <div style={{
        marginTop: -28, background: C.surface2,
        borderTopLeftRadius: 28, borderTopRightRadius: 28,
        paddingTop: 18, position: 'relative', zIndex: 2,
      }}>
        {/* actions */}
        <div style={{
          padding: '0 20px',
          display: 'flex', gap: 8,
        }}>
          <ActionPill icon={ICONS.filter} label="Filtros" />
          <ActionPill icon={ICONS.doc} label="NFs" />
          <ActionPill icon={ICONS.download} label="Exportar" />
        </div>

        {/* mês maio */}
        <SectionLabel total="R$ 2.901,00">Maio · 2026</SectionLabel>
        <div style={{
          margin: '0 20px', background: '#fff',
          borderRadius: 16, border: `1px solid ${C.line}`,
          overflow: 'hidden',
        }}>
          {CHARGES.map((c, i) => (
            <React.Fragment key={c.id}>
              <ChargeRow c={c} />
              {i === CHARGES.length - 1 && (
                <div style={{
                  padding: '12px 14px',
                  background: C.surface2,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                  fontFamily: font.body, fontSize: 12,
                  borderTop: 'none',
                }}>
                  <span style={{ color: C.textMute, fontWeight: 600 }}>Total no mês</span>
                  <span style={{
                    fontFamily: font.display, fontSize: 17, fontWeight: 800,
                    color: C.text, letterSpacing: -0.3,
                  }}>R$ 2.901,00</span>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        <SectionLabel total="R$ 1.842,30">Abril · 2026</SectionLabel>
        <div style={{
          margin: '0 20px 0',
          background: '#fff', borderRadius: 16, padding: 14,
          border: `1px solid ${C.line}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          cursor: 'pointer',
        }}>
          <div>
            <div style={{
              fontFamily: font.body, fontSize: 13.5, fontWeight: 700, color: C.text,
            }}>9 turnos · 14 trabalhadores</div>
            <div style={{
              fontFamily: font.body, fontSize: 12, color: C.textMute, marginTop: 2,
            }}>Comissão Laboro: R$ 261,02</div>
          </div>
          <Icon d={ICONS.chev} size={16} stroke={C.textSoft} sw={2} />
        </div>
      </div>
    </div>
  );
}

function ActionPill({ icon, label }) {
  return (
    <button style={{
      appearance: 'none', cursor: 'pointer', border: `1px solid ${C.line}`,
      background: '#fff', color: C.text, borderRadius: 999,
      padding: '7px 12px',
      display: 'flex', alignItems: 'center', gap: 5,
      fontFamily: font.body, fontSize: 12.5, fontWeight: 700,
    }}>
      <Icon d={icon} size={13} stroke={C.navy} sw={2.2} />
      {label}
    </button>
  );
}

function SectionLabel({ children, total }) {
  return (
    <div style={{
      padding: '20px 24px 10px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
      fontFamily: font.body,
    }}>
      <span style={{
        fontSize: 11, fontWeight: 700, color: C.textSoft,
        letterSpacing: 0.5, textTransform: 'uppercase',
      }}>{children}</span>
      {total && (
        <span style={{
          fontSize: 12, fontWeight: 700, color: C.text,
          fontFamily: font.display, letterSpacing: -0.2,
        }}>{total}</span>
      )}
    </div>
  );
}

// ─── VIEW 2: Equipe Favorita ───────────────────────────────────────────────
const FAVORITES = [
  { id: 1, name: 'Júlio Santos', level: 'Verificado', rating: 4.9, totalTurns: 23, withYou: 4, specs: ['Garçom', 'Bartender'], lastDate: '17 mai', invited: false },
  { id: 2, name: 'Carla Mendes', level: 'Top Pro', rating: 5.0, totalTurns: 41, withYou: 6, specs: ['Garçom', 'Recepção'], lastDate: '15 mai', invited: true },
  { id: 3, name: 'Letícia Alves', level: 'Verificado', rating: 4.8, totalTurns: 18, withYou: 3, specs: ['Garçom', 'Aux. cozinha'], lastDate: '12 mai', invited: false },
  { id: 4, name: 'Marcos Lima', level: 'Top Pro', rating: 4.9, totalTurns: 56, withYou: 2, specs: ['Bartender'], lastDate: '2 mai', invited: false },
];

function FavCard({ f }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 16, padding: 14,
      border: `1px solid ${C.line}`,
    }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <Avatar name={f.name} size={48} ring={f.level === 'Top Pro' ? C.orange : C.jade} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <div style={{
              fontFamily: font.display, fontSize: 16, fontWeight: 700,
              color: C.text, letterSpacing: -0.3,
            }}>{f.name}</div>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 3,
              background: f.level === 'Top Pro' ? '#FFF1E9' : C.jadeSoft,
              color: f.level === 'Top Pro' ? C.orange : C.jadeDeep,
              padding: '2px 7px', borderRadius: 999,
              fontFamily: font.body, fontSize: 10, fontWeight: 700,
              letterSpacing: 0.4, textTransform: 'uppercase',
            }}>
              <Icon d={ICONS.check} size={9} stroke={f.level === 'Top Pro' ? C.orange : C.jadeDeep} sw={3} />
              {f.level}
            </span>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, marginTop: 5,
            fontFamily: font.body, fontSize: 12, color: C.textMute, flexWrap: 'wrap',
          }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="#F5B400"><path d={ICONS.star}/></svg>
              <b style={{ color: C.text }}>{f.rating.toFixed(1).replace('.', ',')}</b>
            </span>
            <span>·</span>
            <span><b style={{ color: C.text }}>{f.totalTurns}</b> turnos</span>
            <span>·</span>
            <span style={{ color: C.navy, fontWeight: 700 }}>
              {f.withYou}× aqui
            </span>
          </div>
          <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {f.specs.map(s => (
              <span key={s} style={{
                background: C.surface3, color: C.textMute,
                padding: '2px 7px', borderRadius: 6,
                fontFamily: font.body, fontSize: 10.5, fontWeight: 600,
              }}>{s}</span>
            ))}
          </div>
        </div>
        <button style={{
          appearance: 'none', cursor: 'pointer', border: 0, background: 'transparent',
          padding: 4,
        }}>
          <Icon d={ICONS.heart} size={20} stroke={C.orange} fill={C.orange} sw={2} />
        </button>
      </div>

      <div style={{
        marginTop: 12, paddingTop: 10, borderTop: `1px solid ${C.lineSoft}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
      }}>
        <div style={{
          fontFamily: font.body, fontSize: 11.5, color: C.textMute,
        }}>Último turno: <b style={{ color: C.text }}>{f.lastDate}</b></div>
        {f.invited ? (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            background: C.jadeSoft, color: C.jadeDeep,
            padding: '6px 10px', borderRadius: 9,
            fontFamily: font.body, fontSize: 12, fontWeight: 700,
          }}>
            <Icon d={ICONS.check} size={12} stroke={C.jadeDeep} sw={2.6} />
            Convidado
          </div>
        ) : (
          <button style={{
            appearance: 'none', cursor: 'pointer', border: 0,
            background: C.navy, color: '#fff', borderRadius: 9,
            padding: '6px 12px',
            display: 'inline-flex', alignItems: 'center', gap: 4,
            fontFamily: font.body, fontSize: 12, fontWeight: 700,
          }}>
            <Icon d={ICONS.send} size={12} stroke="#fff" sw={2} fill="#fff" />
            Convidar
          </button>
        )}
      </div>
    </div>
  );
}

function ViewEquipeFav() {
  return (
    <div style={{
      height: '100%', overflow: 'auto', background: C.surface2,
      paddingBottom: 100,
    }}>
      <div style={{
        paddingTop: 56, padding: '56px 20px 16px',
        background: '#fff', borderBottom: `1px solid ${C.lineSoft}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{
            fontFamily: font.body, fontSize: 11.5, fontWeight: 700,
            color: C.textSoft, letterSpacing: 0.6, textTransform: 'uppercase',
          }}>Equipe favorita</div>
          <div style={{
            fontFamily: font.display, fontSize: 22, fontWeight: 800,
            color: C.text, letterSpacing: -0.6, marginTop: 2,
          }}>{FAVORITES.length} trabalhadores</div>
        </div>
        <button style={{
          appearance: 'none', cursor: 'pointer', border: 0,
          background: C.navy, color: '#fff', borderRadius: 12,
          padding: '9px 12px',
          display: 'flex', alignItems: 'center', gap: 5,
          fontFamily: font.body, fontSize: 12.5, fontWeight: 700,
        }}>
          <Icon d={ICONS.plus} size={14} stroke="#fff" sw={2.4} />
          Adicionar
        </button>
      </div>

      {/* tip card */}
      <div style={{
        margin: '14px 20px 0',
        background: 'linear-gradient(180deg, #FFF1E9, #FFFBF7)',
        border: `1px solid ${C.orange}33`,
        borderRadius: 14, padding: 12,
        display: 'flex', gap: 10, alignItems: 'center',
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: '#fff', border: `1px solid ${C.orange}33`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon d={ICONS.heart} size={16} stroke={C.orange} fill={C.orange} sw={2} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{
            fontFamily: font.body, fontSize: 13, fontWeight: 700, color: C.text,
          }}>Convide direto sem postar vaga aberta</div>
          <div style={{
            fontFamily: font.body, fontSize: 11.5, color: C.textMute, marginTop: 1, lineHeight: 1.35,
          }}>Favoritos têm prioridade ao receber sua proposta.</div>
        </div>
      </div>

      {/* filter chips */}
      <div style={{
        padding: '14px 20px 0', display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none',
      }}>
        {['Todos', 'Garçom', 'Bartender', 'Top Pro', 'Recentes'].map((t, i) => (
          <button key={i} style={{
            appearance: 'none', cursor: 'pointer',
            background: i === 0 ? C.navy : '#fff',
            color: i === 0 ? '#fff' : C.text,
            border: `1px solid ${i === 0 ? C.navy : C.line}`,
            borderRadius: 999, padding: '6px 12px',
            fontFamily: font.body, fontSize: 12, fontWeight: 600, flexShrink: 0,
          }}>{t}</button>
        ))}
      </div>

      <div style={{
        marginTop: 16, padding: '0 20px',
        display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        {FAVORITES.map(f => <FavCard key={f.id} f={f} />)}
      </div>
    </div>
  );
}

// ─── View switcher + Tab bar ───────────────────────────────────────────────
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
      {[['fin', 'Financeiro'], ['team', 'Equipe favorita']].map(([id, label]) => (
        <button key={id} onClick={() => setView(id)} style={{
          appearance: 'none', cursor: 'pointer', border: 0,
          background: view === id ? C.navy : 'transparent',
          color: view === id ? '#fff' : C.textMute,
          borderRadius: 999, padding: '5px 12px',
          fontFamily: font.body, fontSize: 11, fontWeight: 700,
        }}>{label}</button>
      ))}
    </div>
  );
}

function App() {
  const initial = (new URLSearchParams(window.location.search).get('view') === 'team') ? 'team' : 'fin';
  const [view, setView] = React.useState(initial);
  const handleLocal = (id) => {
    if (id === 'team') { setView('team'); return true; }
    if (id === 'pay')  { setView('fin');  return true; }
    return false;
  };
  return (
    <div style={{
      minHeight: '100vh', width: '100%',
      background: 'radial-gradient(1200px 800px at 50% 0%, #1a1a2e 0%, #0a0a14 60%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 0',
    }} data-screen-label="13 Empresa Financeiro + Equipe">
      <IOSDevice width={402} height={874} dark={false}>
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          <ViewSwitcher view={view} setView={setView} />
          {view === 'fin' && <ViewFinanceiro />}
          {view === 'team' && <ViewEquipeFav />}
          <EmpresaTabBar active={view === 'team' ? 'team' : 'pay'} onLocal={handleLocal} />
        </div>
      </IOSDevice>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
