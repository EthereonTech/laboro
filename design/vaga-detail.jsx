// Vaga Detail — Laboro
// Tela 3 — Detalhe + estado pós-aceite (escrow visual)

const { C, font } = window.LAB;

// shared atoms ─────────────────────────────────────────────────────────────
function Icon({ d, size = 18, stroke = 'currentColor', sw = 1.8, fill = 'none' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}>
      <path d={d} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
const ICONS = {
  back:   'M15 6l-6 6 6 6',
  share:  'M12 4v12m0-12l-4 4m4-4l4 4M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4',
  heart:  'M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10Z',
  star:   'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.2L12 17l-5.4 3 1-6.2L3.2 9.5l6.1-.9L12 3Z',
  pin:    'M12 21s7-7 7-12a7 7 0 0 0-14 0c0 5 7 12 7 12Zm0-9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  clock:  'M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  lock:   'M6 10V8a6 6 0 1 1 12 0v2M5 10h14v10H5z',
  check:  'M5 12l4 4L19 7',
  calendar:'M3 9h18M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm3-2v4m8-4v4',
  route:  'M5 5a3 3 0 1 0 0 6h10a3 3 0 1 1 0 6H5',
  shirt:  'M8 4l-4 3 2 3 2-1v11h12V9l2 1 2-3-4-3-3 2a3 3 0 0 1-6 0l-3-2Z',
  shoe:   'M3 16h14a3 3 0 0 0 3-3v-1l-3-1-4-4-3 1v3l-7 1v4Z',
  id:     'M4 6h16v12H4zM8 10h2m-2 4h6M14 9h4v3h-4z',
  info:   'M12 8h.01M11 12h1v5h1M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  chev:   'M9 6l6 6-6 6',
  chevD:  'M6 9l6 6 6-6',
  x:      'M6 6l12 12M6 18L18 6',
};

function CompanyMark({ letter, color, size = 56, radius = 16 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: radius,
      background: color, color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: font.display, fontWeight: 700, fontSize: size * 0.48,
      letterSpacing: -0.5,
      boxShadow: '0 8px 22px rgba(0,0,0,0.18)',
      flexShrink: 0,
    }}>{letter}</div>
  );
}

// Stylized mini map ────────────────────────────────────────────────────────
function MiniMap() {
  return (
    <div style={{
      borderRadius: 16, overflow: 'hidden', position: 'relative',
      height: 140, border: `1px solid ${C.line}`,
    }}>
      <svg viewBox="0 0 360 140" preserveAspectRatio="xMidYMid slice" width="100%" height="100%">
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M20 0H0v20" fill="none" stroke="#E6E8F0" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="360" height="140" fill="#F1F3F9"/>
        <rect width="360" height="140" fill="url(#grid)"/>
        {/* streets */}
        <path d="M0 95 L360 75" stroke="#fff" strokeWidth="14"/>
        <path d="M0 95 L360 75" stroke="#DCE0EC" strokeWidth="14" strokeDasharray="0 0" opacity="0.3"/>
        <path d="M120 -10 L150 150" stroke="#fff" strokeWidth="10"/>
        <path d="M240 -10 L260 150" stroke="#fff" strokeWidth="8"/>
        <path d="M-10 30 L370 50" stroke="#fff" strokeWidth="6"/>
        {/* park */}
        <rect x="170" y="20" width="60" height="40" rx="6" fill="#DCEFE0"/>
        {/* river */}
        <path d="M-10 130 Q 100 110 200 125 T 380 115 L 380 150 L -10 150 Z" fill="#D7E2F2"/>
        {/* pin */}
        <g transform="translate(180, 60)">
          <circle r="18" fill="#1B3FA0" opacity="0.18"/>
          <circle r="12" fill="#1B3FA0" opacity="0.28"/>
          <path d="M0 -16 a 8 8 0 1 1 -0.01 0 Z M0 0 L 0 8" stroke="#1B3FA0" strokeWidth="0" fill="#1B3FA0"/>
          <path d="M0 -16 C 6 -16 10 -11 10 -7 C 10 -2 0 8 0 8 C 0 8 -10 -2 -10 -7 C -10 -11 -6 -16 0 -16 Z" fill="#1B3FA0"/>
          <circle cy="-9" r="3" fill="#fff"/>
        </g>
      </svg>
    </div>
  );
}

// Bullet list row ──────────────────────────────────────────────────────────
function BulletRow({ icon, text, sub }) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '10px 0' }}>
      <div style={{
        width: 32, height: 32, borderRadius: 10,
        background: C.surface3,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon d={icon} size={16} stroke={C.navy} sw={1.9} />
      </div>
      <div style={{ flex: 1, paddingTop: 5 }}>
        <div style={{
          fontFamily: font.body, fontSize: 14.5, fontWeight: 600,
          color: C.text, letterSpacing: -0.1, lineHeight: 1.3,
        }}>{text}</div>
        {sub && (
          <div style={{
            fontFamily: font.body, fontSize: 12.5,
            color: C.textMute, marginTop: 2, lineHeight: 1.35,
          }}>{sub}</div>
        )}
      </div>
    </div>
  );
}

function SectionTitle({ children, hint }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
      <div style={{
        fontFamily: font.display, fontSize: 15, fontWeight: 700,
        color: C.text, letterSpacing: -0.2,
      }}>{children}</div>
      {hint && (
        <div style={{
          fontFamily: font.body, fontSize: 12, color: C.textSoft, fontWeight: 500,
        }}>{hint}</div>
      )}
    </div>
  );
}

// Hero ─────────────────────────────────────────────────────────────────────
function Hero({ vaga, onBack }) {
  return (
    <div style={{
      background: C.navy,
      paddingTop: 56, paddingBottom: 28,
      padding: '56px 20px 28px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: -100, right: -80, width: 280, height: 280,
        borderRadius: '50%',
        background: 'radial-gradient(closest-side, rgba(0,196,140,0.22), transparent 70%)',
      }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* top controls */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={onBack} style={{
            appearance: 'none', cursor: 'pointer',
            width: 38, height: 38, borderRadius: 12,
            background: 'rgba(255,255,255,0.10)',
            border: '1px solid rgba(255,255,255,0.10)',
            color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon d={ICONS.back} size={18} stroke="#fff" sw={2.2} />
          </button>
          <div style={{ display: 'flex', gap: 8 }}>
            {[ICONS.heart, ICONS.share].map((d, i) => (
              <button key={i} style={{
                appearance: 'none', cursor: 'pointer',
                width: 38, height: 38, borderRadius: 12,
                background: 'rgba(255,255,255,0.10)',
                border: '1px solid rgba(255,255,255,0.10)',
                color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon d={d} size={17} stroke="#fff" sw={2} />
              </button>
            ))}
          </div>
        </div>

        {/* company brand block */}
        <div style={{ display: 'flex', gap: 14, marginTop: 22, alignItems: 'center' }}>
          <CompanyMark letter={vaga.company[0]} color={vaga.companyColor} size={56} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: font.body, fontSize: 12.5, fontWeight: 500,
              color: 'rgba(255,255,255,0.55)', letterSpacing: 0.4,
              textTransform: 'uppercase',
            }}>Empresa</div>
            <div style={{
              fontFamily: font.display, fontSize: 18, fontWeight: 700,
              color: '#fff', marginTop: 2, letterSpacing: -0.4,
            }}>{vaga.company}</div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6, marginTop: 4,
              fontFamily: font.body, fontSize: 12, color: 'rgba(255,255,255,0.7)',
            }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="#FFC04C">
                <path d={ICONS.star}/>
              </svg>
              <span style={{ color: '#fff', fontWeight: 700 }}>{vaga.companyRating}</span>
              <span>·</span>
              <span>{vaga.companyReviews} avaliações</span>
              <span>·</span>
              <span>{vaga.companySegment}</span>
            </div>
          </div>
        </div>

        {/* role headline */}
        <div style={{ marginTop: 24 }}>
          <div style={{
            display: 'inline-block', padding: '4px 9px', borderRadius: 6,
            background: 'rgba(255,107,53,0.18)',
            color: '#FFB89A',
            fontFamily: font.body, fontSize: 10.5, fontWeight: 700,
            letterSpacing: 0.6, textTransform: 'uppercase',
            marginBottom: 8,
          }}>Urgente · começa em 4h</div>
          <div style={{
            fontFamily: font.display, fontSize: 34, fontWeight: 800,
            color: '#fff', letterSpacing: -1.3, lineHeight: 1.05,
          }}>{vaga.role}</div>
          <div style={{
            fontFamily: font.body, fontSize: 14, fontWeight: 500,
            color: 'rgba(255,255,255,0.6)', marginTop: 6,
          }}>{vaga.date} · {vaga.time} · {vaga.hours}h de turno</div>
        </div>
      </div>
    </div>
  );
}

// Pay card sitting on hero edge ────────────────────────────────────────────
function PayCard({ vaga }) {
  return (
    <div style={{
      margin: '-22px 20px 0',
      background: '#fff',
      border: `1px solid ${C.line}`,
      borderRadius: 20,
      padding: 18,
      boxShadow: '0 10px 30px rgba(14,42,120,0.10)',
      position: 'relative',
      zIndex: 2,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
        <div>
          <div style={{
            fontFamily: font.body, fontSize: 11.5, fontWeight: 700,
            color: C.textSoft, letterSpacing: 0.6, textTransform: 'uppercase',
          }}>Você recebe</div>
          <div style={{
            fontFamily: font.display, fontSize: 38, fontWeight: 800,
            color: C.jadeDeep, letterSpacing: -1.5, lineHeight: 1, marginTop: 4,
          }}>R$ {vaga.value}</div>
          <div style={{
            fontFamily: font.body, fontSize: 12.5, color: C.textMute, marginTop: 6,
          }}>
            Diária bruta · sem descontos
          </div>
        </div>
        <div style={{
          background: C.jadeSoft,
          padding: '8px 10px', borderRadius: 12,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
        }}>
          <div style={{
            fontFamily: font.body, fontSize: 10, color: C.jadeDeep,
            fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase',
          }}>por hora</div>
          <div style={{
            fontFamily: font.display, fontSize: 16, fontWeight: 700,
            color: C.jadeDeep, letterSpacing: -0.3,
          }}>R$ {(parseFloat(vaga.value.replace(',', '.')) / vaga.hours).toFixed(2).replace('.', ',')}</div>
        </div>
      </div>

      {/* escrow strip */}
      <div style={{
        marginTop: 14, padding: '11px 12px',
        background: 'linear-gradient(180deg, #F7FFFB, #F1FBF6)',
        border: `1px solid ${C.jade}33`,
        borderRadius: 12,
        display: 'flex', gap: 10, alignItems: 'center',
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 9, background: '#fff',
          border: `1px solid ${C.jade}33`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon d={ICONS.lock} size={15} stroke={C.jadeDeep} sw={2} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{
            fontFamily: font.body, fontSize: 13, fontWeight: 700,
            color: C.jadeInk, letterSpacing: -0.1,
          }}>Pagamento garantido em escrow</div>
          <div style={{
            fontFamily: font.body, fontSize: 11.5, color: C.textMute, marginTop: 1,
            lineHeight: 1.3,
          }}>
            A empresa já reservou R$ {vaga.value} · liberamos via Pix em até 1h após o turno
          </div>
        </div>
      </div>
    </div>
  );
}

// Detail content sections ──────────────────────────────────────────────────
function Sections({ vaga }) {
  return (
    <div style={{ padding: '20px 20px 140px' }}>
      {/* meta cards row */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
      }}>
        <MetaCard
          icon={ICONS.calendar}
          label="Quando"
          primary={vaga.date}
          secondary={vaga.time}
        />
        <MetaCard
          icon={ICONS.pin}
          label="Onde"
          primary={vaga.neighborhood}
          secondary={`${vaga.distance} de você`}
        />
      </div>

      {/* o que esperar */}
      <div style={{ marginTop: 22 }}>
        <SectionTitle>O que esperar</SectionTitle>
        <div style={{
          background: '#fff', borderRadius: 14, padding: '4px 14px',
          border: `1px solid ${C.line}`,
        }}>
          <BulletRow
            icon={ICONS.info}
            text="Atender mesas no salão principal"
            sub="Casa de show com 12 mesas, fluxo médio-alto"
          />
          <div style={{ height: 1, background: C.lineSoft, margin: '0 -14px' }} />
          <BulletRow
            icon={ICONS.info}
            text="Tirar pedidos e entregar no balcão"
            sub="Sistema de comanda eletrônica (treinamento de 15 min)"
          />
          <div style={{ height: 1, background: C.lineSoft, margin: '0 -14px' }} />
          <BulletRow
            icon={ICONS.info}
            text="Auxiliar na montagem da casa"
            sub="Chegada com 30 min de antecedência"
          />
        </div>
      </div>

      {/* o que levar */}
      <div style={{ marginTop: 22 }}>
        <SectionTitle hint="Obrigatório">O que levar</SectionTitle>
        <div style={{
          background: '#fff', borderRadius: 14, padding: '4px 14px',
          border: `1px solid ${C.line}`,
        }}>
          <BulletRow icon={ICONS.shirt} text="Camisa preta lisa, calça preta" />
          <div style={{ height: 1, background: C.lineSoft, margin: '0 -14px' }} />
          <BulletRow icon={ICONS.shoe} text="Sapato fechado antiderrapante" />
          <div style={{ height: 1, background: C.lineSoft, margin: '0 -14px' }} />
          <BulletRow icon={ICONS.id} text="RG ou CNH com foto" />
        </div>
      </div>

      {/* localização */}
      <div style={{ marginTop: 22 }}>
        <SectionTitle hint="1,2 km · 4 min de carro">Localização</SectionTitle>
        <MiniMap />
        <div style={{
          marginTop: 10,
          background: '#fff', borderRadius: 14, padding: 14,
          border: `1px solid ${C.line}`,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <Icon d={ICONS.pin} size={20} stroke={C.navy} sw={2} />
          <div style={{ flex: 1 }}>
            <div style={{
              fontFamily: font.body, fontSize: 14, fontWeight: 600, color: C.text,
            }}>R. Tocantins, 824 — Centro</div>
            <div style={{
              fontFamily: font.body, fontSize: 12, color: C.textMute, marginTop: 1,
            }}>Pato Branco · PR</div>
          </div>
          <button style={{
            appearance: 'none', cursor: 'pointer',
            background: C.surface3, color: C.navy,
            border: 0, borderRadius: 10,
            padding: '8px 12px',
            fontFamily: font.body, fontSize: 12.5, fontWeight: 700,
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <Icon d={ICONS.route} size={14} stroke={C.navy} sw={2.2} />
            Rota
          </button>
        </div>
      </div>

      {/* policy */}
      <div style={{ marginTop: 22 }}>
        <SectionTitle>Política de cancelamento</SectionTitle>
        <div style={{
          background: C.surface3, borderRadius: 14, padding: 14,
          fontFamily: font.body, fontSize: 13, color: C.textMute, lineHeight: 1.45,
        }}>
          Cancele até <span style={{ color: C.text, fontWeight: 700 }}>6h antes</span> sem afetar seu score.
          Cancelamentos próximos ao turno reduzem sua reputação na plataforma.
        </div>
      </div>
    </div>
  );
}

function MetaCard({ icon, label, primary, secondary }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 14, padding: 14,
      border: `1px solid ${C.line}`,
    }}>
      <div style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 30, height: 30, borderRadius: 9, background: C.surface3,
        marginBottom: 8,
      }}>
        <Icon d={icon} size={15} stroke={C.navy} sw={2} />
      </div>
      <div style={{
        fontFamily: font.body, fontSize: 11.5, fontWeight: 600,
        color: C.textSoft, letterSpacing: 0.4, textTransform: 'uppercase',
      }}>{label}</div>
      <div style={{
        fontFamily: font.display, fontSize: 15, fontWeight: 700,
        color: C.text, marginTop: 3, letterSpacing: -0.2,
      }}>{primary}</div>
      <div style={{
        fontFamily: font.body, fontSize: 12.5, color: C.textMute, marginTop: 1,
      }}>{secondary}</div>
    </div>
  );
}

// Sticky CTA ───────────────────────────────────────────────────────────────
function StickyCTA({ vaga, onAccept }) {
  const [pressed, setPressed] = React.useState(false);
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      paddingBottom: 30, paddingTop: 12,
      padding: '12px 20px 30px',
      background: 'linear-gradient(180deg, rgba(248,249,252,0) 0%, #F8F9FC 30%)',
      zIndex: 10,
    }}>
      <button
        onClick={onAccept}
        onMouseDown={() => setPressed(true)}
        onMouseUp={() => setPressed(false)}
        onMouseLeave={() => setPressed(false)}
        style={{
          width: '100%', appearance: 'none', cursor: 'pointer',
          background: C.jade, color: C.jadeInk,
          border: 0, borderRadius: 18,
          padding: '16px 18px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          fontFamily: font.body, fontWeight: 700,
          boxShadow: pressed
            ? '0 4px 10px rgba(0,196,140,0.3)'
            : '0 12px 26px rgba(0,196,140,0.4)',
          transform: pressed ? 'translateY(1px)' : 'translateY(0)',
          transition: 'all 140ms cubic-bezier(.2,.7,.2,1)',
        }}
      >
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontSize: 17, letterSpacing: -0.3 }}>Aceitar turno</div>
          <div style={{ fontSize: 11.5, fontWeight: 600, opacity: 0.7, marginTop: 1 }}>
            R$ {vaga.value} reservado no seu nome
          </div>
        </div>
        <div style={{
          width: 38, height: 38, borderRadius: 12,
          background: 'rgba(10,42,30,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon d={ICONS.chev} size={18} stroke={C.jadeInk} sw={2.5} />
        </div>
      </button>
    </div>
  );
}

// Acceptance sheet (escrow confirmed) ──────────────────────────────────────
function AcceptSheet({ vaga, onClose }) {
  const [phase, setPhase] = React.useState(0);
  React.useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 400);
    const t2 = setTimeout(() => setPhase(2), 1100);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'rgba(8,16,30,0.55)',
      backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      zIndex: 50,
      animation: 'fade-in 200ms ease-out',
    }}>
      <div style={{
        background: '#fff', width: '100%',
        borderTopLeftRadius: 28, borderTopRightRadius: 28,
        padding: '14px 20px 36px',
        animation: 'slide-up 360ms cubic-bezier(.2,.8,.2,1)',
        position: 'relative',
      }}>
        {/* grabber */}
        <div style={{
          width: 40, height: 4, borderRadius: 4,
          background: C.line, margin: '0 auto 18px',
        }} />

        <button onClick={onClose} style={{
          position: 'absolute', top: 18, right: 18,
          appearance: 'none', border: 0, cursor: 'pointer',
          background: C.surface3, color: C.text,
          width: 32, height: 32, borderRadius: 999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon d={ICONS.x} size={16} stroke={C.text} sw={2.2} />
        </button>

        {/* escrow lock animation */}
        <div style={{
          width: 100, height: 100, borderRadius: 999,
          background: C.jadeSoft,
          margin: '8px auto 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative',
          animation: 'pulse-jade 1.5s ease-out',
        }}>
          <div style={{
            position: 'absolute', inset: -8, borderRadius: 999,
            border: `2px solid ${C.jade}`, opacity: phase >= 1 ? 0 : 0.5,
            transform: phase >= 1 ? 'scale(1.4)' : 'scale(1)',
            transition: 'all 800ms ease-out',
          }} />
          <svg width="48" height="56" viewBox="0 0 48 56" fill="none">
            {/* lock body */}
            <rect x="6" y="24" width="36" height="28" rx="6" fill={C.jadeDeep}/>
            {/* shackle */}
            <path
              d="M14 24 V16 a10 10 0 0 1 20 0 V24"
              stroke={C.jadeDeep} strokeWidth="4" fill="none" strokeLinecap="round"
              style={{
                transform: phase >= 2 ? 'translateY(0)' : 'translateY(-4px)',
                transition: 'transform 600ms cubic-bezier(.5,1.6,.5,1)',
                transformOrigin: 'center',
              }}
            />
            {/* check inside */}
            <path
              d="M16 38 l6 6 l12 -12"
              stroke="#fff" strokeWidth="4" fill="none"
              strokeLinecap="round" strokeLinejoin="round"
              strokeDasharray="30"
              strokeDashoffset={phase >= 2 ? 0 : 30}
              style={{ transition: 'stroke-dashoffset 500ms ease-out 200ms' }}
            />
          </svg>
        </div>

        <div style={{
          textAlign: 'center',
          fontFamily: font.display, fontSize: 26, fontWeight: 800,
          color: C.text, letterSpacing: -0.7, lineHeight: 1.1,
        }}>
          Turno garantido!
        </div>
        <div style={{
          textAlign: 'center', marginTop: 8,
          fontFamily: font.body, fontSize: 14.5, color: C.textMute, lineHeight: 1.4,
          padding: '0 20px',
        }}>
          A empresa já reservou <strong style={{ color: C.jadeDeep }}>R$ {vaga.value}</strong> no escrow.
          Você recebe via Pix logo após o check-out.
        </div>

        {/* mini-recap */}
        <div style={{
          marginTop: 22, padding: 14,
          background: C.surface2, borderRadius: 14,
          border: `1px solid ${C.line}`,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <CompanyMark letter={vaga.company[0]} color={vaga.companyColor} size={44} radius={12} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: font.body, fontSize: 12.5, fontWeight: 600,
              color: C.textMute,
            }}>{vaga.company}</div>
            <div style={{
              fontFamily: font.display, fontSize: 16, fontWeight: 700,
              color: C.text, letterSpacing: -0.3,
            }}>{vaga.role}</div>
            <div style={{
              fontFamily: font.body, fontSize: 12, color: C.textMute, marginTop: 2,
            }}>{vaga.date} · {vaga.time}</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button style={{
            flex: 1, appearance: 'none', cursor: 'pointer',
            background: C.surface3, color: C.text, border: 0, borderRadius: 14,
            padding: '14px',
            fontFamily: font.body, fontSize: 14, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            <Icon d={ICONS.calendar} size={16} stroke={C.text} sw={2} />
            Adicionar à agenda
          </button>
          <button onClick={onClose} style={{
            flex: 1, appearance: 'none', cursor: 'pointer',
            background: C.navy, color: '#fff', border: 0, borderRadius: 14,
            padding: '14px',
            fontFamily: font.body, fontSize: 14, fontWeight: 700,
          }}>Ver meu turno</button>
        </div>
      </div>
    </div>
  );
}

// ─── data ──────────────────────────────────────────────────────────────────
const VAGA = {
  company: 'Bar do Pedrão',
  companyColor: '#1B3FA0',
  companyRating: '4,8',
  companyReviews: 142,
  companySegment: 'Bar e casa de show',
  role: 'Garçom',
  date: 'sex, 24 mai',
  time: '18:00 → 23:00',
  hours: 5,
  value: '180,00',
  neighborhood: 'Centro',
  distance: '1,2 km',
};

function VagaDetail() {
  const [accepted, setAccepted] = React.useState(false);
  return (
    <div style={{
      height: '100%', width: '100%', overflow: 'hidden',
      background: C.surface2, position: 'relative',
      fontFamily: font.body,
    }}>
      <div style={{ height: '100%', overflow: 'auto' }}>
        <Hero vaga={VAGA} onBack={() => {}} />
        <PayCard vaga={VAGA} />
        <Sections vaga={VAGA} />
      </div>
      <StickyCTA vaga={VAGA} onAccept={() => setAccepted(true)} />
      {accepted && <AcceptSheet vaga={VAGA} onClose={() => setAccepted(false)} />}
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
    }} data-screen-label="03 Detalhe da Vaga">
      <IOSDevice width={402} height={874} dark={false}>
        <div style={{ position: 'relative', height: '100%', width: '100%' }}>
          <VagaDetail />
        </div>
      </IOSDevice>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
