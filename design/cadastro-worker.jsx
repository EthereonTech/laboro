// Cadastro do Trabalhador — 4 etapas — Laboro Tela 7

const { C, font } = window.LAB;

function Icon({ d, size = 18, stroke = 'currentColor', sw = 1.8, fill = 'none' }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}><path d={d} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
const ICONS = {
  back:   'M15 6l-6 6 6 6',
  chev:   'M9 6l6 6-6 6',
  camera: 'M4 7h3l2-3h6l2 3h3a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1Zm8 11a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Z',
  check:  'M5 12l4 4L19 7',
  user:   'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 9a7 7 0 0 1 14 0',
  shield: 'M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6l8-3Z',
  lock:   'M6 10V8a6 6 0 1 1 12 0v2M5 10h14v10H5z',
};

// Specialties with abstract glyphs
const SPECS = [
  { id: 'garcom', label: 'Garçom', icon: <g><path d="M8 4h8v4a4 4 0 0 1-8 0V4Z" fill="currentColor"/><rect x="11" y="8" width="2" height="10" fill="currentColor"/><rect x="6" y="18" width="12" height="2" rx="1" fill="currentColor"/></g> },
  { id: 'bartender', label: 'Bartender', icon: <g><path d="M5 4h14l-6 7v6h3v2H8v-2h3v-6L5 4Z" stroke="currentColor" strokeWidth="1.7" fill="none" strokeLinejoin="round"/></g> },
  { id: 'cozinha', label: 'Aux. Cozinha', icon: <g><rect x="4" y="13" width="16" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7" fill="none"/><path d="M7 13V8a5 5 0 0 1 10 0v5M8 8a3 3 0 1 1 4-2.7M16 8a3 3 0 1 0-4-2.7" stroke="currentColor" strokeWidth="1.7" fill="none"/></g> },
  { id: 'promotor', label: 'Promotor', icon: <g><path d="M4 11l13-6v14L4 13v-2Z" stroke="currentColor" strokeWidth="1.7" fill="none" strokeLinejoin="round"/><rect x="2" y="11" width="2" height="3" fill="currentColor"/><path d="M7 14v4l3 .5v-3.7" stroke="currentColor" strokeWidth="1.7" fill="none"/></g> },
  { id: 'repositor', label: 'Repositor', icon: <g><rect x="4" y="5" width="16" height="14" stroke="currentColor" strokeWidth="1.7" fill="none" rx="1"/><path d="M4 10h16M4 15h16M9 5v14M15 5v14" stroke="currentColor" strokeWidth="1.5"/></g> },
  { id: 'caixa', label: 'Caixa', icon: <g><rect x="3" y="8" width="18" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.7" fill="none"/><circle cx="12" cy="13" r="2.5" stroke="currentColor" strokeWidth="1.7" fill="none"/><rect x="5" y="3" width="14" height="3" rx="1" stroke="currentColor" strokeWidth="1.7" fill="none"/></g> },
  { id: 'limpeza', label: 'Limpeza', icon: <g><path d="M7 4l4 7h-1l-1 9-3-9h-1l2-7Z" stroke="currentColor" strokeWidth="1.7" fill="none" strokeLinejoin="round"/><rect x="14" y="12" width="6" height="8" rx="1" stroke="currentColor" strokeWidth="1.7" fill="none"/><path d="M14 16h6" stroke="currentColor" strokeWidth="1.5"/></g> },
  { id: 'recepcao', label: 'Recepcionista', icon: <g><circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="1.7" fill="none"/><path d="M5 20a7 7 0 0 1 14 0" stroke="currentColor" strokeWidth="1.7" fill="none"/><rect x="9" y="14" width="6" height="1.5" rx="0.5" fill="currentColor"/></g> },
];

const SPECS_ARR = SPECS;

// ─── Progress bar ──────────────────────────────────────────────────────────
function StepBar({ step, total = 4 }) {
  return (
    <div style={{ display: 'flex', gap: 6, padding: '0 20px', marginTop: 16 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          flex: 1, height: 5, borderRadius: 3,
          background: i <= step ? C.navy : C.line,
          transition: 'background 200ms',
        }} />
      ))}
    </div>
  );
}

// ─── Top bar ───────────────────────────────────────────────────────────────
function TopBar({ step, onBack, total = 4 }) {
  return (
    <div>
      <div style={{
        paddingTop: 56, padding: '56px 20px 0',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <button onClick={onBack} style={{
          appearance: 'none', cursor: 'pointer', border: 0,
          width: 40, height: 40, borderRadius: 12,
          background: C.surface3,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon d={ICONS.back} size={18} stroke={C.text} sw={2.2} />
        </button>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{
            fontFamily: font.body, fontSize: 11.5, fontWeight: 700,
            color: C.textSoft, letterSpacing: 0.6, textTransform: 'uppercase',
          }}>Cadastro · Etapa {step + 1} de {total}</div>
        </div>
        <button style={{
          appearance: 'none', cursor: 'pointer', border: 0, background: 'transparent',
          fontFamily: font.body, fontSize: 13, fontWeight: 600, color: C.textMute,
          padding: 8,
        }}>Sair</button>
      </div>
      <StepBar step={step} total={total} />
    </div>
  );
}

// ─── Field components ──────────────────────────────────────────────────────
function TextField({ label, value, onChange, placeholder, type = 'text', icon }) {
  const [focus, setFocus] = React.useState(false);
  return (
    <div style={{
      background: '#fff', borderRadius: 14,
      border: `1.5px solid ${focus ? C.navy : C.line}`,
      padding: '12px 14px',
      transition: 'border 150ms',
    }}>
      <div style={{
        fontFamily: font.body, fontSize: 11, fontWeight: 700,
        color: focus ? C.navy : C.textSoft, letterSpacing: 0.5, textTransform: 'uppercase',
      }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
        {icon && <Icon d={icon} size={16} stroke={C.textMute} sw={2} />}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          style={{
            flex: 1, appearance: 'none', border: 0, outline: 0, background: 'transparent',
            fontFamily: font.body, fontSize: 15, fontWeight: 600,
            color: C.text, padding: 0, minWidth: 0, width: '100%',
          }}
        />
      </div>
    </div>
  );
}

// ─── Step 0 — Dados pessoais ───────────────────────────────────────────────
function StepDados({ data, setData }) {
  return (
    <div style={{ padding: '24px 20px 140px' }}>
      <div style={{
        fontFamily: font.display, fontSize: 26, fontWeight: 800,
        color: C.text, letterSpacing: -0.8, lineHeight: 1.1,
      }}>Vamos te conhecer</div>
      <div style={{
        fontFamily: font.body, fontSize: 14.5, color: C.textMute, marginTop: 6, lineHeight: 1.4,
      }}>Seus dados são usados pra confirmar identidade e liberar pagamento Pix.</div>

      {/* avatar uploader */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 28, marginBottom: 24 }}>
        <button style={{
          appearance: 'none', cursor: 'pointer', border: 0,
          width: 110, height: 110, borderRadius: '50%',
          background: C.surface3, border: `2px dashed ${C.line}`,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
          position: 'relative',
        }}>
          <Icon d={ICONS.camera} size={26} stroke={C.navy} sw={1.8} />
          <div style={{
            fontFamily: font.body, fontSize: 11, fontWeight: 700, color: C.navy,
            letterSpacing: 0.3, textTransform: 'uppercase',
          }}>Foto</div>
          <div style={{
            position: 'absolute', bottom: 0, right: 0,
            width: 28, height: 28, borderRadius: '50%',
            background: C.jade, color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '3px solid ' + C.surface2,
            fontFamily: font.display, fontWeight: 700, fontSize: 20, lineHeight: 1,
          }}>+</div>
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <TextField label="Nome completo" value={data.nome} onChange={v => setData({ ...data, nome: v })} placeholder="ex: Júlio Santos" />
        <TextField label="CPF" value={data.cpf} onChange={v => setData({ ...data, cpf: v })} placeholder="000.000.000-00" />
        <TextField label="Telefone (WhatsApp)" value={data.tel} onChange={v => setData({ ...data, tel: v })} placeholder="(46) 9 9999-9999" />
        <TextField label="Data de nascimento" value={data.nasc} onChange={v => setData({ ...data, nasc: v })} placeholder="DD/MM/AAAA" />
      </div>

      <div style={{
        marginTop: 18, padding: '12px 14px',
        background: '#F1F3F9', borderRadius: 12,
        display: 'flex', gap: 10, alignItems: 'flex-start',
      }}>
        <Icon d={ICONS.shield} size={16} stroke={C.navy} sw={2} />
        <div style={{
          fontFamily: font.body, fontSize: 12, color: C.textMute, lineHeight: 1.45,
        }}>
          Seus dados são criptografados e usados apenas para validar sua identidade e processar pagamentos.
        </div>
      </div>
    </div>
  );
}

// ─── Step 1 — Especialidades ───────────────────────────────────────────────
function StepEspecialidades({ selected, setSelected }) {
  const toggle = (id) => {
    if (selected.includes(id)) {
      setSelected(selected.filter(s => s !== id));
    } else if (selected.length < 5) {
      setSelected([...selected, id]);
    }
  };
  return (
    <div style={{ padding: '24px 20px 140px' }}>
      <div style={{
        fontFamily: font.display, fontSize: 26, fontWeight: 800,
        color: C.text, letterSpacing: -0.8, lineHeight: 1.1,
      }}>O que você faz?</div>
      <div style={{
        fontFamily: font.body, fontSize: 14.5, color: C.textMute, marginTop: 6, lineHeight: 1.4,
      }}>Escolha até 5 especialidades. Você vai receber vagas combinando com elas.</div>

      <div style={{
        marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{
          fontFamily: font.body, fontSize: 12.5, fontWeight: 600, color: C.textMute,
        }}>{selected.length} de 5 selecionadas</div>
        <button onClick={() => setSelected([])} style={{
          appearance: 'none', cursor: 'pointer', border: 0, background: 'transparent',
          fontFamily: font.body, fontSize: 12, fontWeight: 600, color: C.navy,
        }}>Limpar</button>
      </div>

      <div style={{
        marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
      }}>
        {SPECS_ARR.map(s => {
          const active = selected.includes(s.id);
          const disabled = !active && selected.length >= 5;
          return (
            <button
              key={s.id}
              onClick={() => !disabled && toggle(s.id)}
              style={{
                appearance: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
                background: active ? C.navy : '#fff',
                color: active ? '#fff' : C.text,
                border: `1.5px solid ${active ? C.navy : C.line}`,
                borderRadius: 16, padding: 16,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                fontFamily: font.body, fontSize: 13.5, fontWeight: 700,
                letterSpacing: -0.1,
                opacity: disabled ? 0.4 : 1,
                position: 'relative',
                transition: 'all 150ms',
                boxShadow: active ? '0 8px 18px rgba(27,63,160,0.25)' : 'none',
              }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: active ? 'rgba(255,255,255,0.15)' : C.surface3,
                color: active ? '#fff' : C.navy,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24">{s.icon}</svg>
              </div>
              {s.label}
              {active && (
                <div style={{
                  position: 'absolute', top: 8, right: 8,
                  width: 18, height: 18, borderRadius: '50%',
                  background: C.jade, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon d={ICONS.check} size={11} stroke="#fff" sw={3.5} />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Step 2 — Disponibilidade ──────────────────────────────────────────────
const DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
const PERIODS = [
  { id: 'manha', label: 'Manhã', sub: '6h–12h' },
  { id: 'tarde', label: 'Tarde', sub: '12h–18h' },
  { id: 'noite', label: 'Noite', sub: '18h–02h' },
];

function StepDisponibilidade({ avail, setAvail }) {
  const toggle = (day, period) => {
    const key = `${day}-${period}`;
    setAvail({ ...avail, [key]: !avail[key] });
  };
  const togglePeriod = (period) => {
    const newAvail = { ...avail };
    const allOn = DAYS.every(d => avail[`${d}-${period}`]);
    DAYS.forEach(d => { newAvail[`${d}-${period}`] = !allOn; });
    setAvail(newAvail);
  };

  const total = Object.values(avail).filter(Boolean).length;

  return (
    <div style={{ padding: '24px 20px 140px' }}>
      <div style={{
        fontFamily: font.display, fontSize: 26, fontWeight: 800,
        color: C.text, letterSpacing: -0.8, lineHeight: 1.1,
      }}>Quando você trabalha?</div>
      <div style={{
        fontFamily: font.body, fontSize: 14.5, color: C.textMute, marginTop: 6, lineHeight: 1.4,
      }}>Marque os turnos disponíveis. Pode editar depois.</div>

      <div style={{
        marginTop: 22, background: '#fff', borderRadius: 18, padding: 14,
        border: `1px solid ${C.line}`,
      }}>
        {/* day headers */}
        <div style={{
          display: 'grid', gridTemplateColumns: '78px repeat(7, 1fr)', gap: 6,
          paddingBottom: 10, borderBottom: `1px solid ${C.lineSoft}`,
        }}>
          <div />
          {DAYS.map(d => (
            <div key={d} style={{
              textAlign: 'center',
              fontFamily: font.body, fontSize: 11, fontWeight: 700,
              color: C.textMute, letterSpacing: 0.3, textTransform: 'uppercase',
            }}>{d}</div>
          ))}
        </div>

        {PERIODS.map(p => (
          <div key={p.id} style={{
            display: 'grid', gridTemplateColumns: '78px repeat(7, 1fr)', gap: 6,
            padding: '10px 0',
            borderBottom: p.id !== 'noite' ? `1px solid ${C.lineSoft}` : 0,
            alignItems: 'center',
          }}>
            <button onClick={() => togglePeriod(p.id)} style={{
              appearance: 'none', cursor: 'pointer', border: 0, background: 'transparent',
              textAlign: 'left', padding: 0,
            }}>
              <div style={{
                fontFamily: font.body, fontSize: 12.5, fontWeight: 700,
                color: C.text,
              }}>{p.label}</div>
              <div style={{
                fontFamily: font.body, fontSize: 10, color: C.textSoft, marginTop: 1,
              }}>{p.sub}</div>
            </button>
            {DAYS.map(d => {
              const key = `${d}-${p.id}`;
              const on = avail[key];
              return (
                <button key={d} onClick={() => toggle(d, p.id)} style={{
                  appearance: 'none', cursor: 'pointer', border: 0,
                  height: 32, borderRadius: 8,
                  background: on ? C.navy : C.surface3,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 120ms',
                }}>
                  {on && <Icon d={ICONS.check} size={14} stroke="#fff" sw={3} />}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <div style={{
        marginTop: 14,
        fontFamily: font.body, fontSize: 12.5, color: C.textMute, textAlign: 'center',
      }}>
        <b style={{ color: C.text }}>{total}</b> turnos selecionados
      </div>
    </div>
  );
}

// ─── Step 3 — Dados bancários (Pix) ────────────────────────────────────────
function StepBancario({ data, setData }) {
  const types = [
    { id: 'cpf', label: 'CPF', sub: 'mesma do cadastro' },
    { id: 'tel', label: 'Telefone' },
    { id: 'email', label: 'E-mail' },
    { id: 'aleatoria', label: 'Aleatória' },
  ];
  return (
    <div style={{ padding: '24px 20px 140px' }}>
      <div style={{
        fontFamily: font.display, fontSize: 26, fontWeight: 800,
        color: C.text, letterSpacing: -0.8, lineHeight: 1.1,
      }}>Onde você recebe?</div>
      <div style={{
        fontFamily: font.body, fontSize: 14.5, color: C.textMute, marginTop: 6, lineHeight: 1.4,
      }}>Sua chave Pix para receber o pagamento dos turnos.</div>

      {/* Type selector */}
      <div style={{
        marginTop: 22, background: '#fff', borderRadius: 14, padding: 4,
        border: `1px solid ${C.line}`,
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2,
      }}>
        {types.map(t => {
          const active = data.tipo === t.id;
          return (
            <button key={t.id} onClick={() => setData({ ...data, tipo: t.id })} style={{
              appearance: 'none', cursor: 'pointer', border: 0,
              background: active ? C.navy : 'transparent',
              color: active ? '#fff' : C.text,
              borderRadius: 11, padding: '10px 4px',
              fontFamily: font.body, fontSize: 11.5, fontWeight: 700,
              letterSpacing: 0.1,
            }}>{t.label}</button>
          );
        })}
      </div>

      {/* Key input */}
      <div style={{ marginTop: 14 }}>
        <TextField
          label={`Chave Pix · ${types.find(t => t.id === data.tipo)?.label}`}
          value={data.chave}
          onChange={v => setData({ ...data, chave: v })}
          placeholder={data.tipo === 'cpf' ? '000.000.000-00' : data.tipo === 'tel' ? '(46) 9 9999-9999' : data.tipo === 'email' ? 'seu@email.com' : 'chave aleatória'}
        />
      </div>

      {/* Escrow explainer */}
      <div style={{
        marginTop: 22,
        background: 'linear-gradient(180deg, #F7FFFB, #F1FBF6)',
        border: `1px solid ${C.jade}33`,
        borderRadius: 16, padding: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 11, background: '#fff',
            border: `1px solid ${C.jade}33`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon d={ICONS.lock} size={18} stroke={C.jadeDeep} sw={2} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{
              fontFamily: font.display, fontSize: 16, fontWeight: 800,
              color: C.jadeInk, letterSpacing: -0.3,
            }}>Como funciona o escrow</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
          {[
            ['1', 'A empresa reserva o valor antes do turno', C.navy],
            ['2', 'Você trabalha · o dinheiro fica protegido', C.orange],
            ['3', 'Após o check-out, cai no seu Pix em até 1h', C.jadeDeep],
          ].map(([n, t, col], i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div style={{
                width: 22, height: 22, borderRadius: '50%', background: col, color: '#fff',
                fontFamily: font.display, fontWeight: 800, fontSize: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>{n}</div>
              <div style={{
                fontFamily: font.body, fontSize: 13.5, color: C.text,
                fontWeight: 500, lineHeight: 1.4, paddingTop: 2,
              }}>{t}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{
        marginTop: 18, padding: '12px 14px',
        background: C.surface3, borderRadius: 12,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <input type="checkbox" defaultChecked style={{
          appearance: 'none', width: 20, height: 20, borderRadius: 6,
          border: `1.5px solid ${C.navy}`,
          background: C.navy, position: 'relative', cursor: 'pointer', flexShrink: 0,
        }} />
        <div style={{
          fontFamily: font.body, fontSize: 12.5, color: C.textMute, lineHeight: 1.4,
        }}>
          Aceito os <b style={{ color: C.navy }}>termos de uso</b> e <b style={{ color: C.navy }}>política de privacidade</b> do Laboro.
        </div>
      </div>
    </div>
  );
}

// ─── Sticky CTA ────────────────────────────────────────────────────────────
function StickyCTA({ label, onClick, disabled, primary = true, sub }) {
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      padding: '12px 20px 30px',
      background: 'linear-gradient(180deg, rgba(248,249,252,0) 0%, #F8F9FC 30%)',
    }}>
      <button onClick={onClick} disabled={disabled} style={{
        width: '100%', appearance: 'none', cursor: disabled ? 'not-allowed' : 'pointer', border: 0,
        background: disabled ? '#C7CBD9' : (primary ? C.navy : C.jade),
        color: primary ? '#fff' : C.jadeInk,
        borderRadius: 18, padding: '15px 18px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        fontFamily: font.body, fontSize: 15, fontWeight: 700,
        boxShadow: disabled ? 'none' : (primary ? '0 14px 26px rgba(27,63,160,0.35)' : '0 14px 26px rgba(0,196,140,0.35)'),
        letterSpacing: -0.1,
      }}>
        {label}
        <Icon d={ICONS.chev} size={16} stroke={primary ? '#fff' : C.jadeInk} sw={2.5} />
      </button>
      {sub && (
        <div style={{
          textAlign: 'center', marginTop: 8,
          fontFamily: font.body, fontSize: 12, color: C.textMute,
        }}>{sub}</div>
      )}
    </div>
  );
}

// ─── Master ────────────────────────────────────────────────────────────────
function Cadastro() {
  const [step, setStep] = React.useState(0);
  const [dados, setDados] = React.useState({ nome: 'Júlio Santos', cpf: '034.521.789-00', tel: '(46) 9 9912-3456', nasc: '14/08/1998' });
  const [specs, setSpecs] = React.useState(['garcom', 'bartender']);
  const [avail, setAvail] = React.useState({
    'Qui-noite': true, 'Sex-noite': true, 'Sáb-tarde': true, 'Sáb-noite': true, 'Dom-tarde': true,
  });
  const [pix, setPix] = React.useState({ tipo: 'cpf', chave: '034.521.789-00' });

  const labels = ['Continuar', 'Continuar', 'Continuar', 'Concluir cadastro'];
  const next = () => setStep(s => Math.min(3, s + 1));
  const back = () => setStep(s => Math.max(0, s - 1));

  return (
    <div style={{
      height: '100%', width: '100%', overflow: 'hidden',
      background: C.surface2, fontFamily: font.body, position: 'relative',
      display: 'flex', flexDirection: 'column',
    }}>
      <TopBar step={step} onBack={back} />
      <div style={{ flex: 1, overflow: 'auto' }}>
        {step === 0 && <StepDados data={dados} setData={setDados} />}
        {step === 1 && <StepEspecialidades selected={specs} setSelected={setSpecs} />}
        {step === 2 && <StepDisponibilidade avail={avail} setAvail={setAvail} />}
        {step === 3 && <StepBancario data={pix} setData={setPix} />}
      </div>
      <StickyCTA
        label={labels[step]}
        onClick={next}
        primary={step < 3}
        sub={step === 3 ? 'R$ 0,00 para começar · sem mensalidade' : null}
      />
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
    }} data-screen-label="07 Cadastro Trabalhador">
      <IOSDevice width={402} height={874} dark={false}>
        <Cadastro />
      </IOSDevice>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
