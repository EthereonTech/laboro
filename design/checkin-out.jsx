// Check-in / Check-out / Payment Released — Laboro Tela 4

const { C, font } = window.LAB;

function Icon({ d, size = 18, stroke = 'currentColor', sw = 1.8, fill = 'none' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}>
      <path d={d} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
const ICONS = {
  back:   'M15 6l-6 6 6 6',
  chev:   'M9 6l6 6-6 6',
  chevR2: 'M5 12h14m-4-4l4 4-4 4',
  pin:    'M12 21s7-7 7-12a7 7 0 0 0-14 0c0 5 7 12 7 12Zm0-9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  camera: 'M4 7h3l2-3h6l2 3h3a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1Zm8 11a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Z',
  check:  'M5 12l4 4L19 7',
  shield: 'M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6l8-3Z M9 12l2 2 4-4',
  bolt:   'M13 3L4 14h7l-1 7 9-11h-7l1-7Z',
  user:   'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 9a7 7 0 0 1 14 0',
  phone:  'M5 4h3l2 5-2 1c.7 2 2.3 3.7 4.5 4.5l1-2 5 2v3a2 2 0 0 1-2 2C9.4 19 5 14.6 5 6a2 2 0 0 1 0-2Z',
  msg:    'M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-5 4V6Z',
  star:   'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.2L12 17l-5.4 3 1-6.2L3.2 9.5l6.1-.9L12 3Z',
  lock:   'M6 10V8a6 6 0 1 1 12 0v2M5 10h14v10H5z',
  wallet: 'M3 7a2 2 0 0 1 2-2h13l3 4v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Zm14 5a1.5 1.5 0 1 0 0 3h4v-3h-4z',
  pix:    'M5 12l7-7 7 7-7 7-7-7Zm5 0l2-2 2 2-2 2-2-2Z',
};

// ─── Slide to confirm ──────────────────────────────────────────────────────
function SlideConfirm({ label, color = C.jade, onConfirm, icon }) {
  const [x, setX] = React.useState(0);
  const [dragging, setDragging] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const ref = React.useRef(null);
  const startRef = React.useRef(0);

  const TRACK_HEIGHT = 64;
  const KNOB = 56;

  const getMaxX = () => {
    if (!ref.current) return 280;
    return ref.current.clientWidth - KNOB - 8;
  };

  const onStart = (clientX) => {
    if (done) return;
    setDragging(true);
    startRef.current = clientX - x;
  };
  const onMove = (clientX) => {
    if (!dragging || done) return;
    const max = getMaxX();
    const nx = Math.max(0, Math.min(max, clientX - startRef.current));
    setX(nx);
    if (nx >= max - 2) {
      setDone(true);
      setDragging(false);
      setX(max);
      setTimeout(() => onConfirm && onConfirm(), 250);
    }
  };
  const onEnd = () => {
    if (!done) setX(0);
    setDragging(false);
  };

  React.useEffect(() => {
    const mm = (e) => onMove(e.clientX);
    const mu = () => onEnd();
    const tm = (e) => onMove(e.touches[0].clientX);
    const tu = () => onEnd();
    if (dragging) {
      window.addEventListener('mousemove', mm);
      window.addEventListener('mouseup', mu);
      window.addEventListener('touchmove', tm);
      window.addEventListener('touchend', tu);
    }
    return () => {
      window.removeEventListener('mousemove', mm);
      window.removeEventListener('mouseup', mu);
      window.removeEventListener('touchmove', tm);
      window.removeEventListener('touchend', tu);
    };
  }, [dragging, x]);

  const progress = ref.current ? x / getMaxX() : 0;

  return (
    <div
      ref={ref}
      style={{
        position: 'relative', width: '100%', height: TRACK_HEIGHT,
        borderRadius: TRACK_HEIGHT / 2,
        background: color,
        boxShadow: `0 14px 30px ${color === C.jade ? 'rgba(0,196,140,0.4)' : 'rgba(27,63,160,0.4)'}`,
        overflow: 'hidden', userSelect: 'none',
      }}
    >
      {/* progress overlay */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0,
        width: `${progress * 100}%`,
        background: 'rgba(255,255,255,0.18)',
        transition: dragging ? 'none' : 'width 200ms',
      }} />

      {/* label */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: font.body, fontSize: 16, fontWeight: 700,
        color: color === C.jade ? C.jadeInk : '#fff',
        letterSpacing: -0.2,
        paddingLeft: 60,
        opacity: dragging || done ? 0.5 : 1,
        transition: 'opacity 150ms',
      }}>
        <span style={{ marginRight: 10 }}>{label}</span>
        <Icon d={ICONS.chevR2} size={18} stroke={color === C.jade ? C.jadeInk : '#fff'} sw={2.4} />
      </div>

      {/* knob */}
      <div
        onMouseDown={(e) => onStart(e.clientX)}
        onTouchStart={(e) => onStart(e.touches[0].clientX)}
        style={{
          position: 'absolute', top: 4, left: 4 + x,
          width: KNOB, height: KNOB, borderRadius: '50%',
          background: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
          cursor: done ? 'default' : 'grab',
          transition: dragging ? 'none' : 'left 250ms cubic-bezier(.2,.7,.2,1)',
        }}
      >
        {done
          ? <Icon d={ICONS.check} size={24} stroke={color} sw={3} />
          : <Icon d={icon || ICONS.chevR2} size={22} stroke={color} sw={2.6} />
        }
      </div>
    </div>
  );
}

// ─── Mini map with live pin (phase 0) ──────────────────────────────────────
function GpsMap({ atVenue }) {
  return (
    <div style={{
      borderRadius: 22, overflow: 'hidden', position: 'relative',
      height: 230, border: `1px solid ${C.line}`,
      background: '#F1F3F9',
    }}>
      <svg viewBox="0 0 400 230" preserveAspectRatio="xMidYMid slice" width="100%" height="100%">
        <defs>
          <pattern id="grid2" width="22" height="22" patternUnits="userSpaceOnUse">
            <path d="M22 0H0v22" fill="none" stroke="#E1E5F0" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="400" height="230" fill="#F1F3F9"/>
        <rect width="400" height="230" fill="url(#grid2)"/>
        <path d="M0 150 L400 130" stroke="#fff" strokeWidth="22"/>
        <path d="M150 -20 L180 250" stroke="#fff" strokeWidth="14"/>
        <path d="M270 -10 L290 250" stroke="#fff" strokeWidth="10"/>
        <path d="M-10 50 L420 60" stroke="#fff" strokeWidth="8"/>
        <rect x="195" y="30" width="65" height="50" rx="6" fill="#DCEFE0"/>
        <path d="M-10 220 Q 100 200 200 215 T 420 205 L 420 250 L -10 250 Z" fill="#D7E2F2"/>

        {/* venue pin */}
        <g transform="translate(220, 90)">
          <circle r="26" fill="#1B3FA0" opacity="0.10"/>
          <circle r="18" fill="#1B3FA0" opacity="0.20"/>
          <path d="M0 -16 C 6 -16 10 -11 10 -7 C 10 -2 0 8 0 8 C 0 8 -10 -2 -10 -7 C -10 -11 -6 -16 0 -16 Z" fill="#1B3FA0"/>
          <circle cy="-9" r="3" fill="#fff"/>
        </g>

        {/* user pin — pulsing dot */}
        <g transform={atVenue ? "translate(210, 100)" : "translate(140, 160)"}>
          <circle r="22" fill="#00C48C" opacity="0.18">
            <animate attributeName="r" values="14;26;14" dur="2s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite"/>
          </circle>
          <circle r="10" fill="#fff" stroke="#fff" strokeWidth="2"/>
          <circle r="7" fill="#00C48C"/>
        </g>
      </svg>

      {/* distance badge */}
      <div style={{
        position: 'absolute', top: 12, left: 12,
        background: '#fff', borderRadius: 10,
        padding: '7px 10px',
        display: 'flex', alignItems: 'center', gap: 6,
        boxShadow: '0 6px 14px rgba(14,42,120,0.12)',
        fontFamily: font.body, fontSize: 12, fontWeight: 700,
        color: atVenue ? C.jadeDeep : C.orange,
      }}>
        <div style={{
          width: 8, height: 8, borderRadius: '50%',
          background: atVenue ? C.jade : C.orange,
        }} />
        {atVenue ? '12 m do local' : '380 m do local'}
      </div>

      {/* recenter button */}
      <button style={{
        position: 'absolute', bottom: 12, right: 12,
        width: 38, height: 38, borderRadius: 12,
        background: '#fff', border: 0, cursor: 'pointer',
        boxShadow: '0 6px 14px rgba(14,42,120,0.12)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="3" stroke={C.navy} strokeWidth="2"/>
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke={C.navy} strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  );
}

// ─── Top bar ───────────────────────────────────────────────────────────────
function TopBar({ title, sub }) {
  return (
    <div style={{
      paddingTop: 56, padding: '56px 20px 8px',
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <button style={{
        appearance: 'none', cursor: 'pointer', border: 0,
        width: 40, height: 40, borderRadius: 12,
        background: C.surface3,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon d={ICONS.back} size={18} stroke={C.text} sw={2.2} />
      </button>
      <div style={{ flex: 1 }}>
        <div style={{
          fontFamily: font.body, fontSize: 11.5, fontWeight: 700,
          color: C.textSoft, letterSpacing: 0.8, textTransform: 'uppercase',
        }}>{sub}</div>
        <div style={{
          fontFamily: font.display, fontSize: 18, fontWeight: 700,
          color: C.text, letterSpacing: -0.4, marginTop: 1,
        }}>{title}</div>
      </div>
    </div>
  );
}

function VagaStrip({ vaga, small }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      background: '#fff', borderRadius: 16, padding: '12px 14px',
      border: `1px solid ${C.line}`,
    }}>
      <div style={{
        width: small ? 38 : 44, height: small ? 38 : 44, borderRadius: 12,
        background: vaga.color, color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: font.display, fontWeight: 700, fontSize: small ? 18 : 20,
        flexShrink: 0,
      }}>{vaga.company[0]}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: font.body, fontSize: 11.5, fontWeight: 600,
          color: C.textMute, letterSpacing: 0.1,
        }}>{vaga.company}</div>
        <div style={{
          fontFamily: font.display, fontSize: small ? 14 : 15, fontWeight: 700,
          color: C.text, letterSpacing: -0.3, marginTop: 1,
        }}>{vaga.role} · R$ {vaga.value}</div>
      </div>
    </div>
  );
}

// ─── PHASE 0 — Awaiting check-in ───────────────────────────────────────────
function PhaseCheckIn({ vaga, atVenue, setAtVenue, onCheckIn }) {
  return (
    <div style={{ padding: '0 20px 30px', display: 'flex', flexDirection: 'column', gap: 18, flex: 1 }}>
      <VagaStrip vaga={vaga} />
      <GpsMap atVenue={atVenue} />

      {/* status row */}
      <div style={{
        background: '#fff', borderRadius: 16, padding: 16,
        border: `1px solid ${C.line}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: atVenue ? C.jadeSoft : '#FFF1E9',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon d={ICONS.pin} size={20} stroke={atVenue ? C.jadeDeep : C.orange} sw={2} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{
              fontFamily: font.display, fontSize: 15, fontWeight: 700,
              color: C.text, letterSpacing: -0.2,
            }}>{atVenue ? 'GPS validado' : 'Aproxime-se do local'}</div>
            <div style={{
              fontFamily: font.body, fontSize: 12.5, color: C.textMute, marginTop: 2,
            }}>
              {atVenue
                ? 'Você está a 12 m do Bar do Pedrão · pode fazer check-in'
                : 'Você precisa estar a menos de 100 m'}
            </div>
          </div>
        </div>

        {/* photo dropper */}
        <div style={{
          marginTop: 14, padding: '12px 14px',
          background: C.surface2, borderRadius: 12,
          display: 'flex', alignItems: 'center', gap: 10,
          border: `1px dashed ${C.line}`,
        }}>
          <Icon d={ICONS.camera} size={18} stroke={C.textMute} sw={2} />
          <div style={{ flex: 1 }}>
            <div style={{
              fontFamily: font.body, fontSize: 13, fontWeight: 600, color: C.text,
            }}>Adicionar selfie</div>
            <div style={{
              fontFamily: font.body, fontSize: 11.5, color: C.textSoft, marginTop: 1,
            }}>Opcional · ajuda a confirmar sua presença</div>
          </div>
          <Icon d={ICONS.chev} size={14} stroke={C.textSoft} sw={2} />
        </div>
      </div>

      <div style={{ flex: 1 }} />

      {/* demo toggle for GPS state */}
      <button onClick={() => setAtVenue(!atVenue)} style={{
        alignSelf: 'center',
        appearance: 'none', cursor: 'pointer', border: 0,
        background: 'transparent',
        fontFamily: font.body, fontSize: 11.5, fontWeight: 600,
        color: C.textSoft, padding: 4,
      }}>↻ alternar GPS (demo)</button>

      {/* slide to check-in */}
      <SlideConfirm
        label={atVenue ? 'Deslize para fazer check-in' : 'Aguardando GPS…'}
        color={atVenue ? C.jade : '#9AA0B7'}
        onConfirm={atVenue ? onCheckIn : null}
      />
    </div>
  );
}

// ─── PHASE 1 — Em andamento ────────────────────────────────────────────────
function PhaseInProgress({ vaga, onCheckOut }) {
  const [elapsed, setElapsed] = React.useState(2 * 3600 + 14 * 60 + 22); // 2h14
  React.useEffect(() => {
    const i = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(i);
  }, []);
  const hh = Math.floor(elapsed / 3600);
  const mm = Math.floor((elapsed % 3600) / 60);
  const ss = elapsed % 60;
  const pad = n => String(n).padStart(2, '0');

  const totalSec = vaga.hours * 3600;
  const progress = Math.min(1, elapsed / totalSec);
  const accumulated = (parseFloat(vaga.value.replace(',', '.')) * progress).toFixed(2).replace('.', ',');

  return (
    <div style={{ padding: '0 20px 30px', display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
      <VagaStrip vaga={vaga} />

      {/* live timer card */}
      <div style={{
        background: C.navy,
        borderRadius: 22,
        padding: '26px 22px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -80, right: -60, width: 220, height: 220,
          borderRadius: '50%',
          background: 'radial-gradient(closest-side, rgba(0,196,140,0.25), transparent 70%)',
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(0,196,140,0.18)', color: '#7FE6C5',
            padding: '5px 10px', borderRadius: 999,
            fontFamily: font.body, fontSize: 11, fontWeight: 700,
            letterSpacing: 0.6, textTransform: 'uppercase',
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%', background: C.jade,
              boxShadow: `0 0 0 0 ${C.jade}`,
              animation: 'live-pulse 1.4s ease-out infinite',
            }} />
            Turno em andamento
          </div>
          <div style={{
            fontFamily: font.display, fontSize: 64, fontWeight: 800,
            color: '#fff', letterSpacing: -2.5,
            marginTop: 12, lineHeight: 1,
            fontVariantNumeric: 'tabular-nums',
          }}>
            {pad(hh)}:{pad(mm)}<span style={{ color: 'rgba(255,255,255,0.4)' }}>:{pad(ss)}</span>
          </div>
          <div style={{
            fontFamily: font.body, fontSize: 13, fontWeight: 500,
            color: 'rgba(255,255,255,0.7)', marginTop: 6,
          }}>Check-in: 18:02 · Previsto até 23:00</div>

          {/* progress bar */}
          <div style={{
            marginTop: 18, height: 6, borderRadius: 3,
            background: 'rgba(255,255,255,0.10)', overflow: 'hidden',
          }}>
            <div style={{
              width: `${progress * 100}%`, height: '100%',
              background: `linear-gradient(90deg, ${C.jade}, #7FE6C5)`,
              transition: 'width 1s linear',
            }} />
          </div>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            marginTop: 8,
            fontFamily: font.body, fontSize: 11.5, color: 'rgba(255,255,255,0.6)',
          }}>
            <span>{Math.round(progress * 100)}% concluído</span>
            <span>resta {Math.floor((totalSec - elapsed) / 3600)}h{pad(Math.floor(((totalSec - elapsed) % 3600) / 60))}</span>
          </div>
        </div>
      </div>

      {/* accumulated value */}
      <div style={{
        background: '#fff', borderRadius: 16, padding: 16,
        border: `1px solid ${C.line}`,
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: C.jadeSoft,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon d={ICONS.lock} size={20} stroke={C.jadeDeep} sw={2} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{
            fontFamily: font.body, fontSize: 11.5, fontWeight: 700,
            color: C.textSoft, letterSpacing: 0.6, textTransform: 'uppercase',
          }}>Acumulado · escrow</div>
          <div style={{
            fontFamily: font.display, fontSize: 22, fontWeight: 800,
            color: C.jadeDeep, letterSpacing: -0.7, marginTop: 1,
            fontVariantNumeric: 'tabular-nums',
          }}>R$ {accumulated}</div>
        </div>
        <div style={{
          textAlign: 'right',
          fontFamily: font.body, fontSize: 11, color: C.textMute,
        }}>
          de<br/>
          <span style={{ color: C.text, fontWeight: 700, fontSize: 13 }}>R$ {vaga.value}</span>
        </div>
      </div>

      {/* contact strip */}
      <div style={{
        background: '#fff', borderRadius: 16, padding: 14,
        border: `1px solid ${C.line}`,
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'linear-gradient(135deg, oklch(0.65 0.15 30), oklch(0.45 0.18 60))',
          color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: font.body, fontWeight: 700, fontSize: 13,
        }}>PR</div>
        <div style={{ flex: 1 }}>
          <div style={{
            fontFamily: font.body, fontSize: 11, fontWeight: 600,
            color: C.textSoft, letterSpacing: 0.4, textTransform: 'uppercase',
          }}>Responsável no local</div>
          <div style={{
            fontFamily: font.body, fontSize: 14, fontWeight: 700, color: C.text,
          }}>Pedro Ribeiro · Gerente</div>
        </div>
        <button style={{
          appearance: 'none', cursor: 'pointer', border: 0,
          width: 38, height: 38, borderRadius: 12, background: C.surface3,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon d={ICONS.msg} size={17} stroke={C.navy} sw={2} />
        </button>
        <button style={{
          appearance: 'none', cursor: 'pointer', border: 0,
          width: 38, height: 38, borderRadius: 12, background: C.navy,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon d={ICONS.phone} size={17} stroke="#fff" sw={2} />
        </button>
      </div>

      <div style={{ flex: 1 }} />

      <button style={{
        alignSelf: 'center',
        appearance: 'none', cursor: 'pointer', border: 0,
        background: 'transparent',
        fontFamily: font.body, fontSize: 12.5, fontWeight: 600,
        color: C.orange, padding: 4,
      }}>Reportar problema</button>

      <SlideConfirm
        label="Deslize para fazer check-out"
        color={C.navy}
        onConfirm={onCheckOut}
      />
    </div>
  );
}

// ─── PHASE 2 — Pagamento liberado ──────────────────────────────────────────
function Confetti() {
  const pieces = React.useMemo(() => {
    const colors = [C.jade, C.navy, C.orange, '#7FE6C5', '#FFB89A'];
    return Array.from({ length: 36 }).map((_, i) => ({
      id: i,
      left: 50 + (Math.random() - 0.5) * 100,
      delay: Math.random() * 0.4,
      duration: 1.4 + Math.random() * 1,
      color: colors[i % colors.length],
      size: 6 + Math.random() * 6,
      rotate: Math.random() * 360,
      drift: (Math.random() - 0.5) * 240,
    }));
  }, []);
  return (
    <div style={{
      position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none',
    }}>
      {pieces.map(p => (
        <div key={p.id} style={{
          position: 'absolute', left: `${p.left}%`, top: '40%',
          width: p.size, height: p.size * 0.4,
          background: p.color, borderRadius: 2,
          transform: `rotate(${p.rotate}deg)`,
          animation: `confetti-fall ${p.duration}s ease-out ${p.delay}s forwards`,
          '--drift': `${p.drift}px`,
        }} />
      ))}
    </div>
  );
}

function PhasePaid({ vaga, onClose }) {
  const [phase, setPhase] = React.useState(0);
  React.useEffect(() => {
    const t = setTimeout(() => setPhase(1), 350);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{
      flex: 1, padding: '0 20px 30px',
      display: 'flex', flexDirection: 'column',
      position: 'relative',
    }}>
      <Confetti />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', position: 'relative',
        zIndex: 2,
      }}>
        {/* big jade burst */}
        <div style={{
          width: 140, height: 140, borderRadius: '50%',
          background: `radial-gradient(circle, ${C.jade} 0%, ${C.jadeDeep} 100%)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 20px 50px rgba(0,196,140,0.5)`,
          position: 'relative',
          animation: 'paid-pop 600ms cubic-bezier(.3,1.4,.4,1)',
        }}>
          {/* outer pulse rings */}
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              border: `2px solid ${C.jade}`,
              animation: `paid-ring 1.8s ease-out ${i * 0.4}s infinite`,
            }} />
          ))}
          <svg width="68" height="68" viewBox="0 0 24 24" fill="none">
            <path d={ICONS.check} stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"
              strokeDasharray="30" strokeDashoffset={phase >= 1 ? 0 : 30}
              style={{ transition: 'stroke-dashoffset 500ms ease-out 250ms' }}
            />
          </svg>
        </div>

        <div style={{
          fontFamily: font.display, fontSize: 30, fontWeight: 800,
          color: C.text, letterSpacing: -1, marginTop: 30, lineHeight: 1.1,
          textAlign: 'center',
        }}>
          Pagamento liberado!
        </div>
        <div style={{
          fontFamily: font.body, fontSize: 14.5, color: C.textMute, marginTop: 8,
          textAlign: 'center', maxWidth: 290, textWrap: 'pretty', lineHeight: 1.4,
        }}>
          O escrow foi liberado e o valor caiu na sua chave Pix em poucos segundos.
        </div>

        {/* value strip */}
        <div style={{
          marginTop: 26, width: '100%',
          background: '#fff', border: `1px solid ${C.jade}40`,
          borderRadius: 18, padding: 16,
          boxShadow: '0 14px 30px rgba(0,196,140,0.12)',
        }}>
          <div style={{
            fontFamily: font.body, fontSize: 11.5, fontWeight: 700,
            color: C.textSoft, letterSpacing: 0.6, textTransform: 'uppercase',
            textAlign: 'center',
          }}>Você recebeu</div>
          <div style={{
            fontFamily: font.display, fontSize: 42, fontWeight: 800,
            color: C.jadeDeep, letterSpacing: -1.6, marginTop: 4, lineHeight: 1,
            textAlign: 'center',
          }}>R$ {vaga.value}</div>
          <div style={{
            marginTop: 14, paddingTop: 12,
            borderTop: `1px dashed ${C.line}`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            fontFamily: font.body, fontSize: 12.5,
          }}>
            <div style={{ color: C.textMute }}>Via Pix · CPF ***456</div>
            <div style={{ color: C.jadeDeep, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%', background: C.jade,
              }} />
              Recebido agora
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, zIndex: 2 }}>
        <button style={{
          appearance: 'none', cursor: 'pointer', border: 0,
          background: C.navy, color: '#fff', borderRadius: 16,
          padding: '15px',
          fontFamily: font.body, fontSize: 15, fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <Icon d={ICONS.star} size={17} stroke="#fff" sw={2} fill="#fff" />
          Avaliar a empresa
        </button>
        <button onClick={onClose} style={{
          appearance: 'none', cursor: 'pointer', border: 0,
          background: 'transparent', color: C.text, borderRadius: 16,
          padding: '12px',
          fontFamily: font.body, fontSize: 14, fontWeight: 600,
        }}>Ver minha carteira</button>
      </div>
    </div>
  );
}

// ─── Phase selector ────────────────────────────────────────────────────────
function PhaseDots({ phase, setPhase }) {
  const labels = ['Aguardando', 'Em andamento', 'Pago'];
  return (
    <div style={{
      position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)',
      zIndex: 40,
      background: 'rgba(255,255,255,0.85)',
      backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
      border: `1px solid ${C.line}`,
      borderRadius: 999, padding: '4px',
      display: 'flex', gap: 2,
      boxShadow: '0 4px 14px rgba(14,42,120,0.10)',
    }}>
      {labels.map((l, i) => (
        <button key={i} onClick={() => setPhase(i)} style={{
          appearance: 'none', cursor: 'pointer', border: 0,
          background: phase === i ? C.navy : 'transparent',
          color: phase === i ? '#fff' : C.textMute,
          borderRadius: 999, padding: '5px 11px',
          fontFamily: font.body, fontSize: 11, fontWeight: 700,
          letterSpacing: 0.1,
        }}>{l}</button>
      ))}
    </div>
  );
}

const VAGA = {
  company: 'Bar do Pedrão',
  color: '#1B3FA0',
  role: 'Garçom',
  hours: 5,
  value: '180,00',
};

function CheckInOut() {
  const [phase, setPhase] = React.useState(0);
  const [atVenue, setAtVenue] = React.useState(true);

  const titles = [
    { sub: 'Próximo turno · hoje', title: 'Fazer check-in' },
    { sub: 'Turno em andamento', title: 'Bar do Pedrão' },
    { sub: 'Turno concluído', title: 'Bar do Pedrão' },
  ];

  return (
    <div style={{
      height: '100%', width: '100%', overflow: 'auto',
      background: C.surface2,
      fontFamily: font.body,
      position: 'relative',
      display: 'flex', flexDirection: 'column',
    }}>
      <PhaseDots phase={phase} setPhase={setPhase} />
      <TopBar title={titles[phase].title} sub={titles[phase].sub} />

      {phase === 0 && (
        <PhaseCheckIn
          vaga={VAGA}
          atVenue={atVenue}
          setAtVenue={setAtVenue}
          onCheckIn={() => setPhase(1)}
        />
      )}
      {phase === 1 && <PhaseInProgress vaga={VAGA} onCheckOut={() => setPhase(2)} />}
      {phase === 2 && <PhasePaid vaga={VAGA} onClose={() => setPhase(0)} />}
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
    }} data-screen-label="04 Check-in/out">
      <IOSDevice width={402} height={874} dark={false}>
        <div style={{ position: 'relative', height: '100%', width: '100%' }}>
          <CheckInOut />
        </div>
      </IOSDevice>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
