// Empresa: Home + Postar Vaga — Laboro Tela 5

const { C, font } = window.LAB;

function Icon({ d, size = 18, stroke = 'currentColor', sw = 1.8, fill = 'none' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}>
      <path d={d} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
const ICONS = {
  bell:   'M6 8a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6Zm4 10a2 2 0 0 0 4 0',
  menu:   'M4 6h16M4 12h16M4 18h16',
  plus:   'M12 5v14M5 12h14',
  bolt:   'M13 3L4 14h7l-1 7 9-11h-7l1-7Z',
  pin:    'M12 21s7-7 7-12a7 7 0 0 0-14 0c0 5 7 12 7 12Zm0-9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  clock:  'M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  calendar:'M3 9h18M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm3-2v4m8-4v4',
  user:   'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 9a7 7 0 0 1 14 0',
  users:  'M9 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm9 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-15 9a6 6 0 0 1 12 0M16 14a5 5 0 0 1 5 6',
  briefcase:'M4 8h16v12H4zM8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 14h18',
  chev:   'M9 6l6 6-6 6',
  chevD:  'M6 9l6 6 6-6',
  chevU:  'M6 15l6-6 6 6',
  x:      'M6 6l12 12M6 18L18 6',
  check:  'M5 12l4 4L19 7',
  star:   'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.2L12 17l-5.4 3 1-6.2L3.2 9.5l6.1-.9L12 3Z',
  warn:   'M12 3l10 18H2L12 3Zm0 6v6m0 3v.5',
  lock:   'M6 10V8a6 6 0 1 1 12 0v2M5 10h14v10H5z',
  home:   'M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-4v-7h-6v7H5a1 1 0 0 1-1-1v-9Z',
  wallet: 'M3 7a2 2 0 0 1 2-2h13l3 4v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Zm14 5a1.5 1.5 0 1 0 0 3h4v-3h-4z',
  build:  'M4 21V7l8-4 8 4v14M9 21v-6h6v6M9 11h.01M15 11h.01M12 11h.01M9 14h.01M15 14h.01M12 14h.01',
  text:   'M5 5h14M5 12h14M5 19h9',
  money:  'M12 6v12M9 9h4a2 2 0 1 1 0 4h-2a2 2 0 1 0 0 4h4',
  shield: 'M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6l8-3Z',
};

// ─── Status badge ──────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    'aberta':       { bg: '#FFF1E9', fg: '#C2511A', dot: C.orange, label: 'Aberta' },
    'preenchida':   { bg: '#E8F3FF', fg: '#1B3FA0', dot: C.navy,   label: 'Preenchida' },
    'andamento':    { bg: '#E8F8F1', fg: '#00805B', dot: C.jade,   label: 'Em andamento' },
    'concluida':    { bg: '#EFF1F7', fg: '#5C6079', dot: '#9AA0B7',label: 'Concluída' },
  };
  const m = map[status];
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: m.bg, color: m.fg,
      padding: '4px 10px', borderRadius: 999,
      fontFamily: font.body, fontSize: 11, fontWeight: 700,
      letterSpacing: 0.4, textTransform: 'uppercase',
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%', background: m.dot,
      }} />
      {m.label}
    </div>
  );
}

// ─── Worker chip avatar (in employer cards) ────────────────────────────────
function WorkerAvatars({ people, total }) {
  const filled = people.length;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ display: 'flex' }}>
        {people.slice(0, 3).map((p, i) => (
          <div key={i} style={{
            width: 26, height: 26, borderRadius: '50%',
            background: `linear-gradient(135deg, oklch(0.65 0.15 ${p}), oklch(0.45 0.18 ${(p+30)%360}))`,
            border: '2px solid #fff',
            marginLeft: i === 0 ? 0 : -8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontFamily: font.body, fontSize: 9.5, fontWeight: 700,
          }}>{String.fromCharCode(65 + p % 26)}</div>
        ))}
        {total - filled > 0 && (
          <div style={{
            width: 26, height: 26, borderRadius: '50%',
            background: '#F1F3F9', border: '2px solid #fff',
            marginLeft: -8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: C.textMute, fontFamily: font.body, fontSize: 11, fontWeight: 700,
          }}>+{total - filled}</div>
        )}
      </div>
      <span style={{
        fontFamily: font.body, fontSize: 12.5, color: C.textMute, fontWeight: 600,
      }}><b style={{ color: C.text }}>{filled}</b> de {total} confirmados</span>
    </div>
  );
}

// ─── Empresa Header ────────────────────────────────────────────────────────
function CompanyHeader() {
  return (
    <div style={{
      background: C.navy, color: '#fff',
      padding: '60px 20px 60px',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: -100, right: -60, width: 280, height: 280,
        borderRadius: '50%',
        background: 'radial-gradient(closest-side, rgba(0,196,140,0.2), transparent 70%)',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: '#FF6B35', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: font.display, fontWeight: 700, fontSize: 18,
              boxShadow: '0 4px 14px rgba(255,107,53,0.4)',
            }}>B</div>
            <div>
              <div style={{
                fontFamily: font.body, fontSize: 11.5, fontWeight: 600,
                color: 'rgba(255,255,255,0.55)', letterSpacing: 0.5, textTransform: 'uppercase',
              }}>Painel da empresa</div>
              <div style={{
                fontFamily: font.display, fontSize: 17, fontWeight: 700,
                letterSpacing: -0.4, marginTop: 1,
              }}>Bar do Pedrão</div>
            </div>
          </div>
          <button style={{
            appearance: 'none', cursor: 'pointer', border: 0,
            width: 40, height: 40, borderRadius: 12,
            background: 'rgba(255,255,255,0.10)',
            border: '1px solid rgba(255,255,255,0.10)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative',
          }}>
            <Icon d={ICONS.bell} size={18} stroke="#fff" sw={2} />
          </button>
        </div>

        {/* KPI row */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
          gap: 10, marginTop: 22,
        }}>
          <KPI value="3" label="vagas abertas" tint="orange" />
          <KPI value="7" label="hoje" sublabel="confirmados" tint="jade" />
          <KPI value="18h" label="próximo turno" sublabel="em 2h" tint="white" />
        </div>
      </div>
    </div>
  );
}

function KPI({ value, label, sublabel, tint }) {
  const tintMap = {
    orange: '#FFB89A',
    jade:   '#7FE6C5',
    white:  '#fff',
  };
  return (
    <div style={{
      background: 'rgba(255,255,255,0.07)',
      border: '1px solid rgba(255,255,255,0.10)',
      borderRadius: 14, padding: 12,
    }}>
      <div style={{
        fontFamily: font.display, fontSize: 26, fontWeight: 800,
        color: tintMap[tint], letterSpacing: -0.8, lineHeight: 1,
      }}>{value}</div>
      <div style={{
        fontFamily: font.body, fontSize: 11.5, fontWeight: 600,
        color: 'rgba(255,255,255,0.7)', marginTop: 6,
      }}>{label}</div>
      {sublabel && (
        <div style={{
          fontFamily: font.body, fontSize: 10.5, fontWeight: 500,
          color: 'rgba(255,255,255,0.5)', marginTop: 1,
        }}>{sublabel}</div>
      )}
    </div>
  );
}

// ─── Urgent banner ─────────────────────────────────────────────────────────
function UrgentBanner() {
  return (
    <div style={{
      background: '#fff',
      border: `1px solid ${C.orange}33`,
      borderLeft: `4px solid ${C.orange}`,
      borderRadius: 14, padding: 14,
      display: 'flex', alignItems: 'center', gap: 12,
      boxShadow: '0 6px 18px rgba(255,107,53,0.10)',
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: '#FFF1E9',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon d={ICONS.warn} size={18} stroke={C.orange} sw={2} fill={C.orange} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{
          fontFamily: font.body, fontSize: 13.5, fontWeight: 700,
          color: C.text, letterSpacing: -0.1,
        }}>1 vaga começa em 3h sem candidatos</div>
        <div style={{
          fontFamily: font.body, fontSize: 12, color: C.textMute, marginTop: 1,
        }}>Aumente o valor ou adicione mais detalhes</div>
      </div>
      <Icon d={ICONS.chev} size={16} stroke={C.textMute} sw={2} />
    </div>
  );
}

// ─── Employer Vaga card ────────────────────────────────────────────────────
function EmployerVagaCard({ vaga }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 18, padding: 16,
      border: `1px solid ${C.line}`,
      boxShadow: '0 2px 4px rgba(14,42,120,0.03), 0 8px 20px rgba(14,42,120,0.04)',
      cursor: 'pointer',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: font.display, fontSize: 19, fontWeight: 700,
            color: C.text, letterSpacing: -0.5, lineHeight: 1.15,
          }}>{vaga.role}</div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12, marginTop: 6,
            fontFamily: font.body, fontSize: 12.5, color: C.textMute, fontWeight: 500,
          }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Icon d={ICONS.calendar} size={13} stroke={C.textMute} sw={2} />
              {vaga.date}
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Icon d={ICONS.clock} size={13} stroke={C.textMute} sw={2} />
              {vaga.time}
            </span>
          </div>
        </div>
        <StatusBadge status={vaga.status} />
      </div>

      {/* candidates progress */}
      <div style={{
        marginTop: 14, paddingTop: 14,
        borderTop: `1px dashed ${C.line}`,
      }}>
        <WorkerAvatars people={vaga.peopleSeeds} total={vaga.total} />
        {/* progress bar */}
        <div style={{
          marginTop: 10, height: 5, borderRadius: 3,
          background: C.surface3, overflow: 'hidden',
        }}>
          <div style={{
            width: `${(vaga.peopleSeeds.length / vaga.total) * 100}%`, height: '100%',
            background: vaga.status === 'andamento' ? C.jade
                       : vaga.peopleSeeds.length === vaga.total ? C.navy
                       : C.orange,
            transition: 'width 200ms',
          }} />
        </div>
      </div>

      {/* footer: value + chev */}
      <div style={{
        marginTop: 14, paddingTop: 12,
        borderTop: `1px solid ${C.lineSoft}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{
            fontFamily: font.body, fontSize: 10.5, fontWeight: 700,
            color: C.textSoft, letterSpacing: 0.6, textTransform: 'uppercase',
          }}>Reservado em escrow</div>
          <div style={{
            display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 2,
          }}>
            <span style={{
              fontFamily: font.display, fontSize: 18, fontWeight: 800,
              color: C.text, letterSpacing: -0.5,
            }}>R$ {vaga.totalEscrow}</span>
            <span style={{
              fontFamily: font.body, fontSize: 11, color: C.textMute,
            }}>· {vaga.total}×R$ {vaga.value}</span>
          </div>
        </div>
        {vaga.urgent ? (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            background: C.orange, color: '#fff',
            padding: '5px 10px', borderRadius: 999,
            fontFamily: font.body, fontSize: 11, fontWeight: 700,
            letterSpacing: 0.3, textTransform: 'uppercase',
          }}>
            <Icon d={ICONS.bolt} size={11} stroke="#fff" sw={2.4} fill="#fff" />
            começa em 3h
          </div>
        ) : (
          <Icon d={ICONS.chev} size={18} stroke={C.textMute} sw={2.2} />
        )}
      </div>
    </div>
  );
}

// ─── Vagas list ────────────────────────────────────────────────────────────
function VagasList() {
  const VAGAS = [
    {
      id: 1, role: 'Bartender', date: 'hoje', time: '18:00–02:00',
      status: 'aberta', value: '260,00', totalEscrow: '780,00',
      total: 3, peopleSeeds: [12], urgent: true,
    },
    {
      id: 2, role: 'Garçom', date: 'hoje', time: '18:00–23:00',
      status: 'preenchida', value: '180,00', totalEscrow: '720,00',
      total: 4, peopleSeeds: [10, 80, 150, 220],
    },
    {
      id: 3, role: 'Aux. de Cozinha', date: 'agora', time: '15:00–22:00',
      status: 'andamento', value: '210,00', totalEscrow: '420,00',
      total: 2, peopleSeeds: [40, 280],
    },
    {
      id: 4, role: 'Recepcionista', date: 'sáb 25 mai', time: '19:00–01:00',
      status: 'aberta', value: '195,00', totalEscrow: '390,00',
      total: 2, peopleSeeds: [180],
    },
  ];

  const [tab, setTab] = React.useState('todas');
  const tabs = [
    { id: 'todas', label: 'Todas', count: VAGAS.length },
    { id: 'aberta', label: 'Abertas', count: VAGAS.filter(v => v.status === 'aberta').length },
    { id: 'andamento', label: 'Em andamento', count: VAGAS.filter(v => v.status === 'andamento').length },
    { id: 'preenchida', label: 'Preenchidas', count: VAGAS.filter(v => v.status === 'preenchida').length },
  ];
  const filtered = tab === 'todas' ? VAGAS : VAGAS.filter(v => v.status === tab);

  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        padding: '0 20px', marginBottom: 14,
      }}>
        <div style={{
          fontFamily: font.display, fontSize: 20, fontWeight: 700,
          color: C.text, letterSpacing: -0.5,
        }}>Vagas ativas</div>
        <button style={{
          appearance: 'none', cursor: 'pointer', border: 0, background: 'transparent',
          fontFamily: font.body, fontSize: 12.5, fontWeight: 600, color: C.navy,
        }}>Histórico</button>
      </div>

      {/* tabs */}
      <div style={{
        display: 'flex', gap: 6, padding: '0 20px', marginBottom: 14,
        overflowX: 'auto', scrollbarWidth: 'none',
      }}>
        {tabs.map(t => {
          const active = t.id === tab;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              appearance: 'none', cursor: 'pointer',
              background: active ? C.navy : '#fff',
              color: active ? '#fff' : C.text,
              border: `1px solid ${active ? C.navy : C.line}`,
              borderRadius: 999, padding: '8px 13px',
              fontFamily: font.body, fontSize: 12.5, fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 6,
              flexShrink: 0,
            }}>
              {t.label}
              <span style={{
                background: active ? 'rgba(255,255,255,0.2)' : C.surface3,
                color: active ? '#fff' : C.textMute,
                padding: '1px 6px', borderRadius: 999,
                fontSize: 11, fontWeight: 700,
              }}>{t.count}</span>
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '0 20px' }}>
        {filtered.map(v => <EmployerVagaCard key={v.id} vaga={v} />)}
      </div>
    </div>
  );
}

// ─── FAB ───────────────────────────────────────────────────────────────────
function FAB({ onClick }) {
  return (
    <button onClick={onClick} style={{
      position: 'absolute', bottom: 96, right: 20,
      appearance: 'none', cursor: 'pointer', border: 0,
      height: 56, paddingLeft: 18, paddingRight: 22,
      borderRadius: 28,
      background: C.jade, color: C.jadeInk,
      display: 'flex', alignItems: 'center', gap: 8,
      fontFamily: font.body, fontSize: 15, fontWeight: 700,
      letterSpacing: -0.2,
      boxShadow: '0 14px 30px rgba(0,196,140,0.45)',
      zIndex: 5,
    }}>
      <Icon d={ICONS.plus} size={20} stroke={C.jadeInk} sw={2.6} />
      Postar vaga
    </button>
  );
}

// ─── Bottom tab bar (empresa) ──────────────────────────────────────────────
const EMPRESA_NAV = {
  home:  '05 Empresa Home + Postar Vaga.html',
  vagas: '12 Empresa Operações.html',
  team:  '13 Empresa Financeiro + Equipe.html?view=team',
  pay:   '13 Empresa Financeiro + Equipe.html?view=fin',
};
function EmpresaTabBar({ active = 'home' }) {
  const tabs = [
    { id: 'home',   label: 'Início',    icon: ICONS.home },
    { id: 'vagas',  label: 'Vagas',     icon: ICONS.briefcase },
    { id: 'team',   label: 'Equipe',    icon: ICONS.users },
    { id: 'pay',    label: 'Financeiro',icon: ICONS.wallet },
  ];
  const go = (id) => {
    if (id === active) return;
    window.location.href = encodeURI(EMPRESA_NAV[id]);
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

// ─── Company Home ──────────────────────────────────────────────────────────
function CompanyHome({ onPost }) {
  return (
    <div style={{
      height: '100%', width: '100%', overflow: 'auto',
      background: C.surface2, fontFamily: font.body,
      paddingBottom: 100,
    }}>
      <CompanyHeader />

      <div style={{
        marginTop: -34,
        background: C.surface2,
        borderTopLeftRadius: 28, borderTopRightRadius: 28,
        paddingTop: 22, position: 'relative', zIndex: 2,
      }}>
        {/* urgent banner */}
        <div style={{ padding: '0 20px', marginBottom: 18 }}>
          <UrgentBanner />
        </div>

        <VagasList />
      </div>

      <FAB onClick={onPost} />
      <EmpresaTabBar active="home" />
    </div>
  );
}

// ─── POST VAGA: form components ────────────────────────────────────────────
function FormSection({ title, children, hint }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ marginBottom: 10, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div style={{
          fontFamily: font.display, fontSize: 14, fontWeight: 700,
          color: C.text, letterSpacing: 0.6, textTransform: 'uppercase',
        }}>{title}</div>
        {hint && (
          <div style={{
            fontFamily: font.body, fontSize: 11.5, color: C.textSoft,
          }}>{hint}</div>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {children}
      </div>
    </div>
  );
}

function FieldShell({ icon, label, value, sub, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: '#fff', borderRadius: 14, padding: '14px',
      border: `1px solid ${C.line}`, cursor: 'pointer',
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: C.surface3,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon d={icon} size={17} stroke={C.navy} sw={2} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: font.body, fontSize: 11.5, fontWeight: 600,
          color: C.textSoft, letterSpacing: 0.3, textTransform: 'uppercase',
        }}>{label}</div>
        <div style={{
          fontFamily: font.body, fontSize: 15, fontWeight: 600,
          color: value ? C.text : C.textSoft, marginTop: 2,
        }}>{value || 'Selecione'}</div>
        {sub && (
          <div style={{
            fontFamily: font.body, fontSize: 11.5, color: C.textMute, marginTop: 1,
          }}>{sub}</div>
        )}
      </div>
      <Icon d={ICONS.chev} size={14} stroke={C.textSoft} sw={2} />
    </div>
  );
}

// quantity stepper
function Stepper({ value, setValue, min = 1, max = 10 }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 14, padding: '12px 14px',
      border: `1px solid ${C.line}`,
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10, background: C.surface3,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon d={ICONS.users} size={17} stroke={C.navy} sw={2} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{
          fontFamily: font.body, fontSize: 11.5, fontWeight: 600,
          color: C.textSoft, letterSpacing: 0.3, textTransform: 'uppercase',
        }}>Número de vagas</div>
        <div style={{
          fontFamily: font.body, fontSize: 12.5, color: C.textMute, marginTop: 1,
        }}>Quantos trabalhadores você precisa</div>
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        background: C.surface2, borderRadius: 12, padding: 4,
      }}>
        <button onClick={() => setValue(Math.max(min, value - 1))} style={{
          appearance: 'none', cursor: 'pointer', border: 0,
          width: 30, height: 30, borderRadius: 8, background: '#fff',
          fontFamily: font.display, fontSize: 18, fontWeight: 700,
          color: C.navy, display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        }}>–</button>
        <div style={{
          minWidth: 24, textAlign: 'center',
          fontFamily: font.display, fontSize: 17, fontWeight: 800, color: C.text,
        }}>{value}</div>
        <button onClick={() => setValue(Math.min(max, value + 1))} style={{
          appearance: 'none', cursor: 'pointer', border: 0,
          width: 30, height: 30, borderRadius: 8, background: '#fff',
          fontFamily: font.display, fontSize: 18, fontWeight: 700,
          color: C.navy, display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        }}>+</button>
      </div>
    </div>
  );
}

// value input
function ValueInput({ value, setValue }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 14, padding: '12px 14px',
      border: `1px solid ${C.line}`,
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10, background: C.surface3,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon d={ICONS.money} size={17} stroke={C.navy} sw={2} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{
          fontFamily: font.body, fontSize: 11.5, fontWeight: 600,
          color: C.textSoft, letterSpacing: 0.3, textTransform: 'uppercase',
        }}>Valor da diária</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 2 }}>
          <span style={{ fontFamily: font.body, fontSize: 13, color: C.textMute }}>R$</span>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value.replace(/[^0-9,]/g, ''))}
            style={{
              flex: 1, appearance: 'none', border: 0, outline: 0, background: 'transparent',
              fontFamily: font.display, fontSize: 22, fontWeight: 800,
              color: C.text, letterSpacing: -0.5, padding: 0, minWidth: 0,
              width: '100%',
            }}
          />
        </div>
      </div>
      <button style={{
        appearance: 'none', cursor: 'pointer', border: 0,
        background: C.surface2, color: C.navy, borderRadius: 10,
        padding: '6px 10px',
        fontFamily: font.body, fontSize: 11, fontWeight: 700,
        letterSpacing: 0.3, textTransform: 'uppercase',
      }}>Sugerir</button>
    </div>
  );
}

// instructions textarea
function InstructionsField({ value, setValue }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 14, padding: 14,
      border: `1px solid ${C.line}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <div style={{
          width: 30, height: 30, borderRadius: 9, background: C.surface3,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon d={ICONS.text} size={15} stroke={C.navy} sw={2} />
        </div>
        <div style={{
          fontFamily: font.body, fontSize: 11.5, fontWeight: 600,
          color: C.textSoft, letterSpacing: 0.3, textTransform: 'uppercase',
        }}>Instruções para o trabalhador</div>
      </div>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Ex.: Camisa preta lisa, sapato fechado, RG com foto. Apresentar-se 15 min antes na entrada de funcionários."
        rows={4}
        style={{
          width: '100%', appearance: 'none', border: 0, outline: 0,
          fontFamily: font.body, fontSize: 14, color: C.text,
          background: 'transparent', resize: 'none', lineHeight: 1.45,
          padding: 0,
        }}
      />
    </div>
  );
}

// ─── POST VAGA Screen ──────────────────────────────────────────────────────
function PostVaga({ onClose }) {
  const [role, setRole] = React.useState('Garçom');
  const [date, setDate] = React.useState('sex, 24 mai');
  const [time, setTime] = React.useState('18:00 → 23:00');
  const [address, setAddress] = React.useState('R. Tocantins, 824 — Centro');
  const [value, setValue] = React.useState('180,00');
  const [instr, setInstr] = React.useState('Camisa preta lisa, sapato fechado, RG com foto. Apresentar-se 15 min antes na entrada de funcionários.');
  const [count, setCount] = React.useState(3);

  const v = parseFloat(value.replace(',', '.')) || 0;
  const subtotal = v * count;
  const commission = subtotal * 0.165;
  const total = subtotal + commission;
  const fmt = n => n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div style={{
      height: '100%', width: '100%', background: C.surface2,
      fontFamily: font.body, display: 'flex', flexDirection: 'column',
      animation: 'sheet-up 320ms cubic-bezier(.2,.8,.2,1)',
    }}>
      {/* header */}
      <div style={{
        paddingTop: 56, padding: '56px 20px 14px',
        background: '#fff', borderBottom: `1px solid ${C.line}`,
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <button onClick={onClose} style={{
          appearance: 'none', cursor: 'pointer', border: 0,
          width: 38, height: 38, borderRadius: 12, background: C.surface3,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon d={ICONS.x} size={16} stroke={C.text} sw={2.2} />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{
            fontFamily: font.body, fontSize: 11.5, fontWeight: 700,
            color: C.textSoft, letterSpacing: 0.6, textTransform: 'uppercase',
          }}>Nova vaga</div>
          <div style={{
            fontFamily: font.display, fontSize: 18, fontWeight: 700,
            color: C.text, letterSpacing: -0.4,
          }}>Postar turno</div>
        </div>
      </div>

      {/* scrollable form */}
      <div style={{ flex: 1, overflow: 'auto', padding: '20px 20px 220px' }}>
        <FormSection title="O turno">
          <FieldShell icon={ICONS.briefcase} label="Função" value={role} sub="Especialidade do trabalhador" />
          <FieldShell icon={ICONS.calendar} label="Data" value={date} />
          <FieldShell icon={ICONS.clock} label="Horário" value={time} sub="5h de turno" />
          <FieldShell icon={ICONS.pin} label="Endereço" value={address} sub="Pato Branco · PR" />
        </FormSection>

        <FormSection title="Detalhes">
          <InstructionsField value={instr} setValue={setInstr} />
          <Stepper value={count} setValue={setCount} />
        </FormSection>

        <FormSection title="Pagamento" hint="Comissão: 16,5%">
          <ValueInput value={value} setValue={setValue} />
          <div style={{
            background: '#fff', borderRadius: 14, padding: '14px 16px',
            border: `1px solid ${C.line}`,
          }}>
            <Row label="Diária × vagas" value={`${count} × R$ ${value} = R$ ${fmt(subtotal)}`} />
            <Row label="Comissão Laboro · 16,5%" value={`R$ ${fmt(commission)}`} muted />
            <div style={{ height: 1, background: C.lineSoft, margin: '10px 0' }} />
            <Row label="Total reservado" value={`R$ ${fmt(total)}`} bold />
          </div>

          {/* escrow explainer */}
          <div style={{
            background: 'linear-gradient(180deg, #F7FFFB, #F1FBF6)',
            border: `1px solid ${C.jade}33`,
            borderRadius: 14, padding: 14,
            display: 'flex', gap: 12, alignItems: 'flex-start',
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 9, background: '#fff',
              border: `1px solid ${C.jade}33`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Icon d={ICONS.shield} size={16} stroke={C.jadeDeep} sw={2} />
            </div>
            <div>
              <div style={{
                fontFamily: font.body, fontSize: 13.5, fontWeight: 700,
                color: C.jadeInk,
              }}>O valor fica protegido no escrow</div>
              <div style={{
                fontFamily: font.body, fontSize: 12, color: C.textMute, marginTop: 3,
                lineHeight: 1.4,
              }}>
                Reservamos R$ {fmt(total)} na sua forma de pagamento e só cobramos quando o turno é concluído. Cancele sem custo até 6h antes do início.
              </div>
            </div>
          </div>
        </FormSection>
      </div>

      {/* sticky CTA */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '14px 20px 30px',
        background: 'linear-gradient(180deg, rgba(248,249,252,0) 0%, #F8F9FC 30%)',
      }}>
        <button style={{
          width: '100%', appearance: 'none', cursor: 'pointer', border: 0,
          background: C.jade, color: C.jadeInk, borderRadius: 18,
          padding: '16px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          fontFamily: font.body, fontWeight: 700,
          boxShadow: '0 14px 30px rgba(0,196,140,0.4)',
        }}>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 16, letterSpacing: -0.3 }}>Publicar e reservar</div>
            <div style={{ fontSize: 11.5, fontWeight: 600, opacity: 0.7, marginTop: 1 }}>
              R$ {fmt(total)} em escrow
            </div>
          </div>
          <Icon d={ICONS.chev} size={18} stroke={C.jadeInk} sw={2.4} />
        </button>
      </div>
    </div>
  );
}

function Row({ label, value, muted, bold }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
      padding: '4px 0',
    }}>
      <span style={{
        fontFamily: font.body, fontSize: bold ? 13.5 : 13,
        fontWeight: bold ? 700 : 500,
        color: bold ? C.text : C.textMute,
      }}>{label}</span>
      <span style={{
        fontFamily: bold ? font.display : font.body,
        fontSize: bold ? 18 : 13,
        fontWeight: bold ? 800 : 600,
        color: bold ? C.jadeDeep : muted ? C.textMute : C.text,
        letterSpacing: bold ? -0.4 : 0,
      }}>{value}</span>
    </div>
  );
}

// ─── View switcher ─────────────────────────────────────────────────────────
function ViewSwitcher({ view, setView }) {
  return (
    <div style={{
      position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)',
      zIndex: 100,
      background: 'rgba(255,255,255,0.85)',
      backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
      border: `1px solid ${C.line}`,
      borderRadius: 999, padding: 4,
      display: 'flex', gap: 2,
      boxShadow: '0 4px 14px rgba(14,42,120,0.10)',
    }}>
      {[['home', 'Home'], ['post', 'Postar vaga']].map(([id, label]) => (
        <button key={id} onClick={() => setView(id)} style={{
          appearance: 'none', cursor: 'pointer', border: 0,
          background: view === id ? C.navy : 'transparent',
          color: view === id ? '#fff' : C.textMute,
          borderRadius: 999, padding: '5px 12px',
          fontFamily: font.body, fontSize: 11, fontWeight: 700,
          letterSpacing: 0.1,
        }}>{label}</button>
      ))}
    </div>
  );
}

function Empresa() {
  const [view, setView] = React.useState('home');
  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      <ViewSwitcher view={view} setView={setView} />
      {view === 'home' && <CompanyHome onPost={() => setView('post')} />}
      {view === 'post' && <PostVaga onClose={() => setView('home')} />}
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
    }} data-screen-label="05 Empresa Home + Postar">
      <IOSDevice width={402} height={874} dark={false}>
        <Empresa />
      </IOSDevice>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
