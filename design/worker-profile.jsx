// Worker Profile with Score — Laboro Tela 6

const { C, font } = window.LAB;

function Icon({ d, size = 18, stroke = 'currentColor', sw = 1.8, fill = 'none' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}>
      <path d={d} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
const ICONS = {
  edit:   'M4 20h4l10-10-4-4L4 16v4Zm10-12l4 4',
  share:  'M12 4v12m0-12l-4 4m4-4l4 4M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4',
  star:   'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.2L12 17l-5.4 3 1-6.2L3.2 9.5l6.1-.9L12 3Z',
  chev:   'M9 6l6 6-6 6',
  trophy: 'M8 4h8v3a4 4 0 0 1-8 0V4Zm-3 1h3v4a3 3 0 0 1-3-3V5Zm14 0h-3v4a3 3 0 0 0 3-3V5ZM10 14h4l-1 4h-2l-1-4Zm-2 5h8',
  rocket: 'M5 19c0-5 4-12 7-12 0 0 7 7 7 12 0 0-7 0-7 0s-7 0-7 0Zm0 0l-2 2m16-2l2 2M12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z',
  check:  'M5 12l4 4L19 7',
  clock:  'M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  flame:  'M12 3s4 4 4 9a4 4 0 0 1-8 0c0-2 1-3 1-3s-1-1.5 0-4c0 0 1 2 3-2Z',
  bolt:   'M13 3L4 14h7l-1 7 9-11h-7l1-7Z',
  lock:   'M6 10V8a6 6 0 1 1 12 0v2M5 10h14v10H5z',
  heart:  'M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10Z',
  home:   'M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-4v-7h-6v7H5a1 1 0 0 1-1-1v-9Z',
  calendar:'M3 9h18M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm3-2v4m8-4v4',
  wallet: 'M3 7a2 2 0 0 1 2-2h13l3 4v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Zm14 5a1.5 1.5 0 1 0 0 3h4v-3h-4z',
  user:   'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 9a7 7 0 0 1 14 0',
  qr:     'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14v2m4-2v6m-4-2h4m0-4h2',
  set:    'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm9 4-2-1V9l2-1V6l-2 1-1-2h-2L15 3h-2l-1 2-2-1-1 2-2-1-1 2 1 2-2 1V12l2 1-1 2 1 2 2-1 1 2h2l1 2h2l1-2 2 1 1-2-1-2 2-1Z',
};

// ─── Big avatar with level ring ────────────────────────────────────────────
function ProfileAvatar({ name, level }) {
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const ringMap = {
    'Top Pro':    `conic-gradient(${C.orange}, #FFD27A, ${C.orange})`,
    'Verificado': `conic-gradient(${C.jade}, #7FE6C5, ${C.jade})`,
    'Iniciante':  `conic-gradient(rgba(255,255,255,0.3), rgba(255,255,255,0.6), rgba(255,255,255,0.3))`,
  };
  return (
    <div style={{
      width: 110, height: 110, borderRadius: '50%',
      background: ringMap[level],
      padding: 4, position: 'relative',
      animation: 'avatar-rotate 12s linear infinite',
    }}>
      <div style={{
        width: '100%', height: '100%', borderRadius: '50%',
        background: 'linear-gradient(135deg, oklch(0.6 0.18 280), oklch(0.4 0.2 250))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontFamily: font.display, fontWeight: 700, fontSize: 38,
        letterSpacing: -1,
        boxShadow: 'inset 0 -8px 20px rgba(0,0,0,0.2)',
        animation: 'avatar-rotate-cancel 12s linear infinite',
      }}>{initials}</div>
      {/* corner verified check */}
      <div style={{
        position: 'absolute', bottom: 2, right: 2,
        width: 30, height: 30, borderRadius: '50%',
        background: level === 'Top Pro' ? C.orange : C.jade,
        border: `3px solid ${C.navy}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon d={ICONS.check} size={14} stroke="#fff" sw={3.2} />
      </div>
    </div>
  );
}

// ─── Specialty chip ────────────────────────────────────────────────────────
function SpecChip({ label, hours }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: 'rgba(255,255,255,0.08)',
      border: '1px solid rgba(255,255,255,0.12)',
      padding: '5px 10px', borderRadius: 999,
      fontFamily: font.body, fontSize: 12, fontWeight: 600,
      color: '#fff', letterSpacing: -0.1,
    }}>
      {label}
      <span style={{
        color: 'rgba(255,255,255,0.55)', fontWeight: 500, fontSize: 11,
      }}>{hours}h</span>
    </div>
  );
}

// ─── Profile header ────────────────────────────────────────────────────────
function ProfileHeader({ name, level, specialties }) {
  return (
    <div style={{
      background: C.navy, color: '#fff',
      padding: '56px 20px 56px',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: -120, right: -80, width: 320, height: 320,
        borderRadius: '50%',
        background: 'radial-gradient(closest-side, rgba(0,196,140,0.18), transparent 70%)',
      }} />
      <div style={{
        position: 'absolute', bottom: -200, left: -160, width: 420, height: 420,
        borderRadius: '50%',
        background: 'radial-gradient(closest-side, rgba(27,63,160,0.7), transparent 70%)',
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
        maskImage: 'linear-gradient(180deg, transparent, #000 30%, #000 100%)',
        WebkitMaskImage: 'linear-gradient(180deg, transparent, #000 30%, #000 100%)',
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* top action row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{
            fontFamily: font.body, fontSize: 11.5, fontWeight: 700,
            color: 'rgba(255,255,255,0.55)', letterSpacing: 0.6, textTransform: 'uppercase',
            alignSelf: 'center',
          }}>Meu perfil</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {[ICONS.qr, ICONS.set, ICONS.edit].map((d, i) => (
              <button key={i} style={{
                appearance: 'none', cursor: 'pointer', border: 0,
                width: 36, height: 36, borderRadius: 11,
                background: 'rgba(255,255,255,0.10)',
                border: '1px solid rgba(255,255,255,0.10)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon d={d} size={15} stroke="#fff" sw={2} />
              </button>
            ))}
          </div>
        </div>

        {/* identity column */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <ProfileAvatar name={name} level={level} />

          <div style={{
            fontFamily: font.display, fontSize: 26, fontWeight: 800,
            color: '#fff', letterSpacing: -0.8, marginTop: 16, textAlign: 'center',
          }}>{name}</div>

          {/* level badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: level === 'Top Pro'
              ? `linear-gradient(135deg, ${C.orange}, #FFB89A)`
              : 'rgba(0,196,140,0.22)',
            border: level === 'Top Pro' ? 0 : `1px solid ${C.jade}55`,
            padding: '5px 12px', borderRadius: 999,
            fontFamily: font.body, fontSize: 12, fontWeight: 700,
            color: level === 'Top Pro' ? '#fff' : '#7FE6C5',
            letterSpacing: 0.6, textTransform: 'uppercase',
            marginTop: 10,
            boxShadow: level === 'Top Pro' ? '0 6px 18px rgba(255,107,53,0.4)' : 'none',
          }}>
            <Icon d={ICONS.check} size={12} stroke={level === 'Top Pro' ? '#fff' : '#7FE6C5'} sw={3} />
            Trabalhador {level}
          </div>

          {/* specialty chips */}
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center',
            marginTop: 14, padding: '0 10px',
          }}>
            {specialties.map(s => <SpecChip key={s.label} {...s} />)}
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, marginTop: 14,
            fontFamily: font.body, fontSize: 12.5, color: 'rgba(255,255,255,0.6)',
          }}>
            <Icon d={ICONS.home} size={13} stroke="rgba(255,255,255,0.6)" sw={1.8} />
            Pato Branco · PR · membro desde mar/2025
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Stat cards row ────────────────────────────────────────────────────────
function StatCards() {
  const stats = [
    { value: '4,9', label: 'Nota média', icon: ICONS.star, color: '#F5B400', fill: true },
    { value: '23',  label: 'Turnos',     icon: ICONS.bolt, color: C.navy },
    { value: '98%', label: 'Pontualidade', icon: ICONS.clock, color: C.jadeDeep },
  ];
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10,
      padding: '0 20px',
    }}>
      {stats.map((s, i) => (
        <div key={i} style={{
          background: '#fff', borderRadius: 14, padding: 14,
          border: `1px solid ${C.line}`,
          boxShadow: '0 2px 4px rgba(14,42,120,0.03)',
        }}>
          <div style={{
            width: 30, height: 30, borderRadius: 9,
            background: `${s.color}1A`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon d={s.icon} size={15} stroke={s.color} sw={2} fill={s.fill ? s.color : 'none'} />
          </div>
          <div style={{
            fontFamily: font.display, fontSize: 24, fontWeight: 800,
            color: C.text, letterSpacing: -0.8, marginTop: 10, lineHeight: 1,
          }}>{s.value}</div>
          <div style={{
            fontFamily: font.body, fontSize: 11.5, fontWeight: 500,
            color: C.textMute, marginTop: 5,
          }}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Top Pro progress card ─────────────────────────────────────────────────
function TopProCard() {
  const current = 23;
  const milestones = [
    { at: 0,  label: 'Iniciante' },
    { at: 10, label: 'Verificado' },
    { at: 30, label: 'Top Pro' },
  ];
  const max = 30;
  const pct = (current / max) * 100;
  return (
    <div style={{
      margin: '0 20px',
      background: '#fff', borderRadius: 18, padding: 18,
      border: `1px solid ${C.line}`,
      boxShadow: '0 8px 24px rgba(14,42,120,0.06)',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: -40, right: -30, width: 160, height: 160,
        borderRadius: '50%',
        background: 'radial-gradient(closest-side, rgba(255,107,53,0.10), transparent 70%)',
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12,
            background: `linear-gradient(135deg, ${C.orange}, #FFB89A)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 18px rgba(255,107,53,0.3)',
          }}>
            <Icon d={ICONS.trophy} size={20} stroke="#fff" sw={2} fill="#fff" fillOpacity={0.2} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{
              fontFamily: font.body, fontSize: 11.5, fontWeight: 700,
              color: C.orange, letterSpacing: 0.6, textTransform: 'uppercase',
            }}>Próximo nível</div>
            <div style={{
              fontFamily: font.display, fontSize: 18, fontWeight: 700,
              color: C.text, letterSpacing: -0.4, marginTop: 1,
            }}>Top Pro em <span style={{ color: C.orange }}>7 turnos</span></div>
          </div>
        </div>

        {/* progress with milestones */}
        <div style={{ marginTop: 18, position: 'relative', padding: '0 4px' }}>
          {/* track */}
          <div style={{
            height: 8, borderRadius: 4, background: C.surface3,
            position: 'relative', overflow: 'visible',
          }}>
            <div style={{
              position: 'absolute', left: 0, top: 0, bottom: 0,
              width: `${pct}%`, borderRadius: 4,
              background: `linear-gradient(90deg, ${C.jade}, ${C.orange})`,
              boxShadow: '0 2px 6px rgba(255,107,53,0.3)',
            }} />
            {milestones.map((m, i) => {
              const mp = (m.at / max) * 100;
              const reached = current >= m.at;
              return (
                <div key={i} style={{
                  position: 'absolute', left: `${mp}%`, top: 4, transform: 'translate(-50%, -50%)',
                  width: reached ? 14 : 12, height: reached ? 14 : 12, borderRadius: '50%',
                  background: reached ? (m.at === 30 ? C.orange : m.at === 10 ? C.jade : '#fff') : '#fff',
                  border: reached ? `3px solid #fff` : `2px solid ${C.line}`,
                  boxShadow: reached ? '0 2px 6px rgba(0,0,0,0.18)' : 'none',
                }} />
              );
            })}
          </div>
          {/* labels */}
          <div style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between' }}>
            {milestones.map((m, i) => {
              const reached = current >= m.at;
              return (
                <div key={i} style={{
                  fontFamily: font.body, fontSize: 11, fontWeight: 700,
                  color: reached ? C.text : C.textSoft,
                  textAlign: i === 0 ? 'left' : i === milestones.length - 1 ? 'right' : 'center',
                }}>
                  <div>{m.label}</div>
                  <div style={{
                    color: C.textSoft, fontWeight: 500, marginTop: 1,
                  }}>{m.at} turnos</div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{
          marginTop: 14, padding: '10px 12px',
          background: C.surface2, borderRadius: 11,
          fontFamily: font.body, fontSize: 12, color: C.textMute, lineHeight: 1.4,
        }}>
          <strong style={{ color: C.text }}>Top Pro</strong> dá prioridade nas vagas, taxa reduzida e perfil em destaque.
        </div>
      </div>
    </div>
  );
}

// ─── Conquistas grid ───────────────────────────────────────────────────────
function BadgeIcon({ kind, locked }) {
  const map = {
    welcome: { color: '#7C5CFF', icon: <path d="M12 4l8 4-8 12-8-12 8-4Z M12 4v16" stroke="#fff" strokeWidth="1.8" fill="none" /> },
    ten:     { color: '#F5B400', icon: <text x="12" y="16" textAnchor="middle" fill="#fff" fontFamily="Bricolage Grotesque" fontWeight="800" fontSize="11">10</text> },
    punct:   { color: C.jadeDeep, icon: <g><path d="M12 7v5l3 2" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round"/><circle cx="12" cy="12" r="7" stroke="#fff" strokeWidth="1.6" fill="none"/></g> },
    star:    { color: '#FF6B35', icon: <path d="M12 5l1.8 3.7 4 .6-3 2.9.7 4.1L12 14.4l-3.5 1.9.7-4.1-3-2.9 4-.6L12 5Z" fill="#fff"/> },
    night:   { color: '#1B3FA0', icon: <path d="M14 6a6 6 0 1 0 4 9 5 5 0 0 1-4-9Z" fill="#fff"/> },
    loyal:   { color: '#C2511A', icon: <path d="M12 18s-6-3.5-6-8a3.5 3.5 0 0 1 6-2.3A3.5 3.5 0 0 1 18 10c0 4.5-6 8-6 8Z" fill="#fff"/> },
  };
  const m = map[kind];
  return (
    <div style={{
      width: 56, height: 56, borderRadius: 16,
      background: locked ? C.surface3 : m.color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative',
      boxShadow: locked ? 'none' : `0 8px 18px ${m.color}40, inset 0 -3px 6px rgba(0,0,0,0.15)`,
      opacity: locked ? 0.5 : 1,
    }}>
      <svg width="32" height="32" viewBox="0 0 24 24">{m.icon}</svg>
      {locked && (
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 16,
          background: 'rgba(248,249,252,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon d={ICONS.lock} size={18} stroke={C.textMute} sw={2.2} />
        </div>
      )}
    </div>
  );
}

function Conquistas() {
  const badges = [
    { kind: 'welcome', label: 'Bem-vindo', sub: '1º turno' },
    { kind: 'ten', label: 'Decadário', sub: '10 turnos' },
    { kind: 'punct', label: 'Pontual', sub: '95% pontualidade' },
    { kind: 'star', label: 'Estrela', sub: '15× 5,0' },
    { kind: 'night', label: 'Coruja', sub: '5 turnos noturnos', locked: true },
    { kind: 'loyal', label: 'Fiel', sub: '5× no mesmo lugar', locked: true },
  ];
  return (
    <div style={{ padding: '0 20px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{
          fontFamily: font.display, fontSize: 18, fontWeight: 700,
          color: C.text, letterSpacing: -0.4,
        }}>Conquistas</div>
        <div style={{
          fontFamily: font.body, fontSize: 12, color: C.textMute, fontWeight: 600,
        }}>4 de 12</div>
      </div>
      <div style={{
        background: '#fff', borderRadius: 18, padding: 16,
        border: `1px solid ${C.line}`,
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px 8px',
      }}>
        {badges.map((b, i) => (
          <div key={i} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
          }}>
            <BadgeIcon kind={b.kind} locked={b.locked} />
            <div style={{
              fontFamily: font.body, fontSize: 11.5, fontWeight: 700,
              color: b.locked ? C.textSoft : C.text, textAlign: 'center',
            }}>{b.label}</div>
            <div style={{
              fontFamily: font.body, fontSize: 10, color: C.textSoft, marginTop: -3,
              textAlign: 'center',
            }}>{b.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Timeline of shifts ────────────────────────────────────────────────────
function TimelineRow({ company, role, date, rating, value, color, last }) {
  return (
    <div style={{ display: 'flex', gap: 12, position: 'relative' }}>
      {/* line + dot */}
      <div style={{ width: 24, position: 'relative', flexShrink: 0 }}>
        <div style={{
          position: 'absolute', top: 28, bottom: last ? '50%' : -8, left: 11,
          width: 2, background: C.lineSoft,
        }} />
        <div style={{
          position: 'relative', zIndex: 1, marginTop: 14,
          width: 24, height: 24, borderRadius: '50%',
          background: '#fff', border: `2px solid ${C.line}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%', background: color,
          }} />
        </div>
      </div>

      {/* card */}
      <div style={{
        flex: 1, background: '#fff', borderRadius: 14, padding: 14,
        border: `1px solid ${C.line}`,
        marginBottom: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: font.body, fontSize: 11.5, fontWeight: 600,
              color: C.textMute,
            }}>{company}</div>
            <div style={{
              fontFamily: font.display, fontSize: 15, fontWeight: 700,
              color: C.text, letterSpacing: -0.3, marginTop: 1,
            }}>{role}</div>
            <div style={{
              fontFamily: font.body, fontSize: 11.5, color: C.textSoft, marginTop: 3,
            }}>{date}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 3,
              background: '#FFFBE6', color: '#7C5C00',
              padding: '3px 7px', borderRadius: 7,
              fontFamily: font.body, fontSize: 11.5, fontWeight: 700,
            }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="#F5B400">
                <path d={ICONS.star}/>
              </svg>
              {rating.toFixed(1).replace('.', ',')}
            </div>
            <div style={{
              fontFamily: font.display, fontSize: 15, fontWeight: 800,
              color: C.jadeDeep, letterSpacing: -0.3, marginTop: 4,
            }}>R$ {value}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Timeline() {
  const shifts = [
    { company: 'Quintal Eventos', role: 'Bartender',     date: 'sáb 18 mai · 20h–02h', rating: 5.0, value: '260,00', color: '#FF6B35' },
    { company: 'Bar do Pedrão',   role: 'Garçom',         date: 'sex 17 mai · 18h–23h', rating: 5.0, value: '180,00', color: '#1B3FA0' },
    { company: 'Vovó Tereza',     role: 'Aux. de Cozinha', date: 'dom 12 mai · 11h–17h', rating: 4.8, value: '210,00', color: '#00A372' },
    { company: 'Brasa Hamburgueria', role: 'Atendente', date: 'qui 9 mai · 17h–22h', rating: 5.0, value: '165,00', color: '#7C2D12' },
  ];
  return (
    <div style={{ padding: '0 20px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{
          fontFamily: font.display, fontSize: 18, fontWeight: 700,
          color: C.text, letterSpacing: -0.4,
        }}>Histórico</div>
        <button style={{
          appearance: 'none', cursor: 'pointer', border: 0, background: 'transparent',
          fontFamily: font.body, fontSize: 12.5, fontWeight: 600, color: C.navy,
        }}>Ver tudo (23)</button>
      </div>
      <div>
        {shifts.map((s, i) => (
          <TimelineRow key={i} {...s} last={i === shifts.length - 1} />
        ))}
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
function TabBar({ active = 'me' }) {
  const tabs = [
    { id: 'home',   label: 'Vagas',    icon: ICONS.home },
    { id: 'shifts', label: 'Turnos',   icon: ICONS.calendar },
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

// ─── Screen ────────────────────────────────────────────────────────────────
function Profile() {
  return (
    <div style={{
      height: '100%', width: '100%', overflow: 'auto',
      background: C.surface2,
      fontFamily: font.body,
      paddingBottom: 100,
    }}>
      <ProfileHeader
        name="Júlio Santos"
        level="Verificado"
        specialties={[
          { label: 'Garçom', hours: 86 },
          { label: 'Bartender', hours: 54 },
          { label: 'Aux. de Cozinha', hours: 28 },
        ]}
      />

      <div style={{
        marginTop: -28,
        background: C.surface2,
        borderTopLeftRadius: 28, borderTopRightRadius: 28,
        paddingTop: 22, position: 'relative', zIndex: 2,
        display: 'flex', flexDirection: 'column', gap: 22,
      }}>
        <StatCards />
        <TopProCard />
        <Conquistas />
        <Timeline />
      </div>

      <TabBar active="me" />
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
    }} data-screen-label="06 Perfil Trabalhador">
      <IOSDevice width={402} height={874} dark={false}>
        <Profile />
      </IOSDevice>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
