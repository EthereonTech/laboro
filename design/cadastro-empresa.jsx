// Cadastro Empresa — 4 etapas — Laboro Tela 8

const { C, font } = window.LAB;

function Icon({ d, size = 18, stroke = 'currentColor', sw = 1.8, fill = 'none' }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}><path d={d} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
const ICONS = {
  back:   'M15 6l-6 6 6 6',
  chev:   'M9 6l6 6-6 6',
  chevD:  'M6 9l6 6 6-6',
  check:  'M5 12l4 4L19 7',
  shield: 'M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6l8-3Z',
  lock:   'M6 10V8a6 6 0 1 1 12 0v2M5 10h14v10H5z',
  card:   'M3 9h18M5 5h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm2 9h4',
  pix:    'M5 12l7-7 7 7-7 7-7-7Zm5 0l2-2 2 2-2 2-2-2Z',
  build:  'M4 21V7l8-4 8 4v14M9 21v-6h6v6M9 11h.01M15 11h.01M12 11h.01',
};

const SEGMENTS = [
  { id: 'bar', label: 'Bar / Casa de show' },
  { id: 'rest', label: 'Restaurante' },
  { id: 'evento', label: 'Eventos / Buffet' },
  { id: 'prom', label: 'Promotora' },
  { id: 'merc', label: 'Mercado / Loja' },
  { id: 'hotel', label: 'Hotel / Pousada' },
  { id: 'outro', label: 'Outro' },
];

// reused atoms ─────────────────────────────────────────────────────────────
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
          }}>Cadastro empresa · {step + 1} de {total}</div>
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

function TextField({ label, value, onChange, placeholder, type = 'text' }) {
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
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={{
          marginTop: 4, width: '100%',
          appearance: 'none', border: 0, outline: 0, background: 'transparent',
          fontFamily: font.body, fontSize: 15, fontWeight: 600,
          color: C.text, padding: 0, minWidth: 0,
        }}
      />
    </div>
  );
}

function Heading({ title, sub }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{
        fontFamily: font.display, fontSize: 26, fontWeight: 800,
        color: C.text, letterSpacing: -0.8, lineHeight: 1.1,
      }}>{title}</div>
      <div style={{
        fontFamily: font.body, fontSize: 14.5, color: C.textMute, marginTop: 6, lineHeight: 1.4,
      }}>{sub}</div>
    </div>
  );
}

function StickyCTA({ label, onClick, primary = true, sub }) {
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      padding: '12px 20px 30px',
      background: 'linear-gradient(180deg, rgba(248,249,252,0) 0%, #F8F9FC 30%)',
    }}>
      <button onClick={onClick} style={{
        width: '100%', appearance: 'none', cursor: 'pointer', border: 0,
        background: primary ? C.navy : C.jade,
        color: primary ? '#fff' : C.jadeInk,
        borderRadius: 18, padding: '15px 18px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        fontFamily: font.body, fontSize: 15, fontWeight: 700,
        boxShadow: primary ? '0 14px 26px rgba(27,63,160,0.35)' : '0 14px 26px rgba(0,196,140,0.35)',
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

// ─── Step 0 — Empresa ──────────────────────────────────────────────────────
function StepEmpresa({ data, setData }) {
  const [open, setOpen] = React.useState(false);
  const seg = SEGMENTS.find(s => s.id === data.segmento);
  return (
    <div style={{ padding: '24px 20px 140px' }}>
      <Heading title="Sobre seu negócio" sub="Vamos validar com seu CNPJ. Leva menos de 1 min." />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <TextField label="CNPJ" value={data.cnpj} onChange={v => setData({ ...data, cnpj: v })} placeholder="00.000.000/0000-00" />
        <TextField label="Nome fantasia" value={data.nome} onChange={v => setData({ ...data, nome: v })} placeholder="ex: Bar do Pedrão" />

        {/* Segmento dropdown */}
        <div>
          <div onClick={() => setOpen(!open)} style={{
            background: '#fff', borderRadius: 14,
            border: `1.5px solid ${open ? C.navy : C.line}`,
            padding: '12px 14px', cursor: 'pointer',
            display: 'flex', alignItems: 'center',
          }}>
            <div style={{ flex: 1 }}>
              <div style={{
                fontFamily: font.body, fontSize: 11, fontWeight: 700,
                color: open ? C.navy : C.textSoft, letterSpacing: 0.5, textTransform: 'uppercase',
              }}>Segmento</div>
              <div style={{
                fontFamily: font.body, fontSize: 15, fontWeight: 600,
                color: seg ? C.text : C.textSoft, marginTop: 4,
              }}>{seg?.label || 'Selecione'}</div>
            </div>
            <Icon d={ICONS.chevD} size={16} stroke={C.textMute} sw={2}
              style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 200ms' }} />
          </div>
          {open && (
            <div style={{
              marginTop: 6, background: '#fff', borderRadius: 14,
              border: `1px solid ${C.line}`, overflow: 'hidden',
              boxShadow: '0 10px 30px rgba(14,42,120,0.10)',
            }}>
              {SEGMENTS.map((s, i) => {
                const active = s.id === data.segmento;
                return (
                  <div key={s.id} onClick={() => { setData({ ...data, segmento: s.id }); setOpen(false); }} style={{
                    padding: '12px 14px', cursor: 'pointer',
                    background: active ? C.surface3 : '#fff',
                    borderBottom: i < SEGMENTS.length - 1 ? `1px solid ${C.lineSoft}` : 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    fontFamily: font.body, fontSize: 14, fontWeight: 600, color: C.text,
                  }}>
                    {s.label}
                    {active && <Icon d={ICONS.check} size={16} stroke={C.navy} sw={2.4} />}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <TextField label="Endereço" value={data.endereco} onChange={v => setData({ ...data, endereco: v })} placeholder="Rua, número, bairro" />
        <TextField label="Cidade · UF" value={data.cidade} onChange={v => setData({ ...data, cidade: v })} placeholder="Pato Branco · PR" />
      </div>
    </div>
  );
}

// ─── Step 1 — Responsável ──────────────────────────────────────────────────
function StepResponsavel({ data, setData }) {
  return (
    <div style={{ padding: '24px 20px 140px' }}>
      <Heading title="Quem está cadastrando?" sub="Os dados ficam vinculados à conta — usados para contato e suporte." />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <TextField label="Nome completo" value={data.nome} onChange={v => setData({ ...data, nome: v })} placeholder="ex: Pedro Ribeiro" />
        <TextField label="Cargo" value={data.cargo} onChange={v => setData({ ...data, cargo: v })} placeholder="ex: Sócio, Gerente, Proprietário" />
        <TextField label="Telefone (WhatsApp)" value={data.tel} onChange={v => setData({ ...data, tel: v })} placeholder="(46) 9 9999-9999" />
        <TextField label="E-mail" type="email" value={data.email} onChange={v => setData({ ...data, email: v })} placeholder="seu@email.com" />
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
          Outros membros da equipe podem ser adicionados depois nas configurações.
        </div>
      </div>
    </div>
  );
}

// ─── Step 2 — Pagamento ────────────────────────────────────────────────────
function StepPagamento({ data, setData }) {
  return (
    <div style={{ padding: '24px 20px 140px' }}>
      <Heading title="Como você quer pagar?" sub="Reservamos o valor antes do turno e cobramos só após o trabalho concluído." />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <PayOption
          active={data.metodo === 'cartao'}
          onClick={() => setData({ ...data, metodo: 'cartao' })}
          icon={ICONS.card}
          title="Cartão de crédito"
          sub="Cobrado apenas após o turno concluído"
          accent="Mais usado"
        />
        <PayOption
          active={data.metodo === 'pix'}
          onClick={() => setData({ ...data, metodo: 'pix' })}
          icon={ICONS.pix}
          title="Saldo pré-carregado via Pix"
          sub="Recarregue sua conta Laboro · sem taxas extras"
          accent="Mais barato"
          accentColor={C.jade}
        />
      </div>

      {/* card details (cartao) */}
      {data.metodo === 'cartao' && (
        <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <TextField label="Número do cartão" value={data.cardNumber} onChange={v => setData({ ...data, cardNumber: v })} placeholder="0000 0000 0000 0000" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <TextField label="Validade" value={data.cardExp} onChange={v => setData({ ...data, cardExp: v })} placeholder="MM/AA" />
            <TextField label="CVV" value={data.cardCvv} onChange={v => setData({ ...data, cardCvv: v })} placeholder="000" />
          </div>
        </div>
      )}

      {/* pix prepaid */}
      {data.metodo === 'pix' && (
        <div style={{
          marginTop: 18, background: '#fff', borderRadius: 14, padding: 16,
          border: `1px solid ${C.line}`,
        }}>
          <div style={{
            fontFamily: font.body, fontSize: 12, fontWeight: 700,
            color: C.textSoft, letterSpacing: 0.5, textTransform: 'uppercase',
          }}>Recarregue depois</div>
          <div style={{
            fontFamily: font.body, fontSize: 13.5, color: C.textMute, marginTop: 4, lineHeight: 1.4,
          }}>
            Conta criada com saldo zero. Você gera um Pix de qualquer valor a partir da home para recarregar antes da primeira vaga.
          </div>
        </div>
      )}
    </div>
  );
}

function PayOption({ active, onClick, icon, title, sub, accent, accentColor = C.orange }) {
  return (
    <button onClick={onClick} style={{
      appearance: 'none', cursor: 'pointer', textAlign: 'left',
      background: '#fff', borderRadius: 16, padding: 16,
      border: `1.5px solid ${active ? C.navy : C.line}`,
      display: 'flex', alignItems: 'center', gap: 14,
      transition: 'all 150ms',
      boxShadow: active ? '0 10px 24px rgba(27,63,160,0.12)' : 'none',
      position: 'relative',
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: active ? C.navy : C.surface3,
        color: active ? '#fff' : C.navy,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon d={icon} size={20} stroke={active ? '#fff' : C.navy} sw={2} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{
            fontFamily: font.display, fontSize: 16, fontWeight: 700,
            color: C.text, letterSpacing: -0.3,
          }}>{title}</div>
          {accent && (
            <div style={{
              display: 'inline-flex', padding: '2px 7px', borderRadius: 999,
              background: accentColor === C.jade ? C.jadeSoft : '#FFF1E9',
              color: accentColor === C.jade ? C.jadeDeep : C.orange,
              fontFamily: font.body, fontSize: 9.5, fontWeight: 800,
              letterSpacing: 0.5, textTransform: 'uppercase',
            }}>{accent}</div>
          )}
        </div>
        <div style={{
          fontFamily: font.body, fontSize: 12.5, color: C.textMute, marginTop: 2, lineHeight: 1.35,
        }}>{sub}</div>
      </div>
      <div style={{
        width: 22, height: 22, borderRadius: '50%',
        border: `2px solid ${active ? C.navy : C.line}`,
        background: active ? C.navy : '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        {active && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />}
      </div>
    </button>
  );
}

// ─── Step 3 — Confirmação ──────────────────────────────────────────────────
function StepConfirmacao({ empresa, resp, pag }) {
  return (
    <div style={{ padding: '24px 20px 140px' }}>
      <div style={{
        width: 72, height: 72, borderRadius: '50%',
        background: C.jadeSoft,
        margin: '0 auto 18px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'paid-pop 600ms cubic-bezier(.3,1.4,.4,1)',
      }}>
        <Icon d={ICONS.check} size={32} stroke={C.jadeDeep} sw={3} />
      </div>

      <Heading title="Quase pronto!" sub="Confira o resumo abaixo. Você pode editar tudo depois nas configurações." />

      {/* summary cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <SummaryCard
          title="Empresa"
          rows={[
            ['Nome', empresa.nome],
            ['CNPJ', empresa.cnpj],
            ['Segmento', SEGMENTS.find(s => s.id === empresa.segmento)?.label || '—'],
            ['Endereço', empresa.endereco],
          ]}
        />
        <SummaryCard
          title="Responsável"
          rows={[
            ['Nome', resp.nome],
            ['Cargo', resp.cargo],
            ['Telefone', resp.tel],
          ]}
        />
        <SummaryCard
          title="Pagamento"
          rows={[
            ['Forma', pag.metodo === 'cartao' ? 'Cartão de crédito' : 'Saldo pré-carregado · Pix'],
            ...(pag.metodo === 'cartao' ? [['Cartão', '•••• ' + (pag.cardNumber || '4242').slice(-4)]] : []),
          ]}
        />
      </div>

      {/* escrow card */}
      <div style={{
        marginTop: 18,
        background: 'linear-gradient(180deg, #F7FFFB, #F1FBF6)',
        border: `1px solid ${C.jade}33`,
        borderRadius: 16, padding: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 11, background: '#fff',
            border: `1px solid ${C.jade}33`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon d={ICONS.lock} size={18} stroke={C.jadeDeep} sw={2} />
          </div>
          <div>
            <div style={{
              fontFamily: font.display, fontSize: 16, fontWeight: 800,
              color: C.jadeInk, letterSpacing: -0.3,
            }}>Escrow protege os dois lados</div>
          </div>
        </div>
        <div style={{
          fontFamily: font.body, fontSize: 13, color: C.textMute, lineHeight: 1.5,
        }}>
          Reservamos o valor da diária quando alguém aceita sua vaga, e só liberamos para o trabalhador após o turno ser concluído. Você cancela sem custo até 6h antes do início.
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ title, rows }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 14, padding: '12px 16px',
      border: `1px solid ${C.line}`,
    }}>
      <div style={{
        fontFamily: font.body, fontSize: 11, fontWeight: 700,
        color: C.textSoft, letterSpacing: 0.6, textTransform: 'uppercase',
        marginBottom: 8,
      }}>{title}</div>
      {rows.map(([k, v], i) => (
        <div key={i} style={{
          display: 'flex', justifyContent: 'space-between', gap: 12, padding: '4px 0',
          fontFamily: font.body, fontSize: 13,
        }}>
          <span style={{ color: C.textMute }}>{k}</span>
          <span style={{ color: C.text, fontWeight: 600, textAlign: 'right' }}>{v}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Master ────────────────────────────────────────────────────────────────
function Cadastro() {
  const [step, setStep] = React.useState(0);
  const [empresa, setEmpresa] = React.useState({
    cnpj: '12.345.678/0001-90',
    nome: 'Bar do Pedrão',
    segmento: 'bar',
    endereco: 'R. Tocantins, 824 — Centro',
    cidade: 'Pato Branco · PR',
  });
  const [resp, setResp] = React.useState({
    nome: 'Pedro Ribeiro',
    cargo: 'Gerente',
    tel: '(46) 9 9988-7766',
    email: 'pedro@bardopedrao.com.br',
  });
  const [pag, setPag] = React.useState({
    metodo: 'cartao',
    cardNumber: '4242 4242 4242 4242',
    cardExp: '12/28',
    cardCvv: '123',
  });

  const labels = ['Continuar', 'Continuar', 'Continuar', 'Criar conta'];
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
        {step === 0 && <StepEmpresa data={empresa} setData={setEmpresa} />}
        {step === 1 && <StepResponsavel data={resp} setData={setResp} />}
        {step === 2 && <StepPagamento data={pag} setData={setPag} />}
        {step === 3 && <StepConfirmacao empresa={empresa} resp={resp} pag={pag} />}
      </div>
      <StickyCTA
        label={labels[step]}
        onClick={next}
        primary={step < 3}
        sub={step === 3 ? 'Sem mensalidade · você só paga 16,5% por turno preenchido' : null}
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
    }} data-screen-label="08 Cadastro Empresa">
      <IOSDevice width={402} height={874} dark={false}>
        <Cadastro />
      </IOSDevice>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
