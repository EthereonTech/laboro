// Notificações — Laboro Tela 11

const { C, font } = window.LAB;

function Icon({ d, size = 18, stroke = 'currentColor', sw = 1.8, fill = 'none' }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}><path d={d} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
const ICONS = {
  back:   'M15 6l-6 6 6 6',
  chev:   'M9 6l6 6-6 6',
  bell:   'M6 8a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6Zm4 10a2 2 0 0 0 4 0',
  bolt:   'M13 3L4 14h7l-1 7 9-11h-7l1-7Z',
  check:  'M5 12l4 4L19 7',
  star:   'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.2L12 17l-5.4 3 1-6.2L3.2 9.5l6.1-.9L12 3Z',
  lock:   'M6 10V8a6 6 0 1 1 12 0v2M5 10h14v10H5z',
  trophy: 'M8 4h8v3a4 4 0 0 1-8 0V4Zm-3 1h3v4a3 3 0 0 1-3-3V5Zm14 0h-3v4a3 3 0 0 0 3-3V5ZM10 14h4l-1 4h-2l-1-4Zm-2 5h8',
  cal:    'M3 9h18M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm3-2v4m8-4v4',
  warn:   'M12 3l10 18H2L12 3Zm0 6v6m0 3v.5',
  pix:    'M5 12l7-7 7 7-7 7-7-7Zm5 0l2-2 2 2-2 2-2-2Z',
  home:   'M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-4v-7h-6v7H5a1 1 0 0 1-1-1v-9Z',
  wallet: 'M3 7a2 2 0 0 1 2-2h13l3 4v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Zm14 5a1.5 1.5 0 1 0 0 3h4v-3h-4z',
  user:   'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 9a7 7 0 0 1 14 0',
  trash:  'M5 7h14M9 7V4h6v3m-2 4v6m-4-6v6M6 7l1 14h10l1-14',
};

const TYPES = {
  vaga:      { color: '#1B3FA0', bg: '#E8F0FF',  icon: ICONS.bolt },
  pagamento: { color: '#00A372', bg: '#E6FAF3',  icon: ICONS.pix },
  escrow:    { color: '#00A372', bg: '#E6FAF3',  icon: ICONS.lock },
  turno:     { color: '#1B3FA0', bg: '#E8F0FF',  icon: ICONS.cal },
  avaliacao: { color: '#F5B400', bg: '#FFFBE6',  icon: ICONS.star },
  badge:     { color: '#FF6B35', bg: '#FFF1E9',  icon: ICONS.trophy },
  alerta:    { color: '#FF6B35', bg: '#FFF1E9',  icon: ICONS.warn },
};

// ─── Header ────────────────────────────────────────────────────────────────
function Header({ unread, onMarkRead }) {
  return (
    <div style={{
      paddingTop: 56, padding: '56px 20px 16px',
      background: '#fff', borderBottom: `1px solid ${C.lineSoft}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button style={{
          appearance: 'none', cursor: 'pointer', border: 0,
          width: 40, height: 40, borderRadius: 12, background: C.surface3,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon d={ICONS.back} size={18} stroke={C.text} sw={2.2} />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{
            fontFamily: font.display, fontSize: 22, fontWeight: 800,
            color: C.text, letterSpacing: -0.6,
          }}>Notificações</div>
          {unread > 0 && (
            <div style={{
              fontFamily: font.body, fontSize: 12, color: C.textMute, marginTop: 1,
            }}><b style={{ color: C.orange }}>{unread} não lidas</b> · {unread + 8} no total</div>
          )}
        </div>
        <button onClick={onMarkRead} style={{
          appearance: 'none', cursor: 'pointer', border: 0, background: 'transparent',
          fontFamily: font.body, fontSize: 12.5, fontWeight: 700, color: C.navy,
          padding: 8,
        }}>Marcar lidas</button>
      </div>
    </div>
  );
}

// ─── Filter chips ──────────────────────────────────────────────────────────
function Filters({ filter, setFilter }) {
  const opts = [
    { id: 'todas', label: 'Todas' },
    { id: 'vaga', label: 'Vagas' },
    { id: 'pagamento', label: 'Pagamentos' },
    { id: 'turno', label: 'Turnos' },
    { id: 'avaliacao', label: 'Avaliações' },
  ];
  return (
    <div style={{
      background: '#fff',
      borderBottom: `1px solid ${C.lineSoft}`,
      padding: '10px 16px',
      display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none',
    }}>
      {opts.map(o => {
        const active = o.id === filter;
        return (
          <button key={o.id} onClick={() => setFilter(o.id)} style={{
            appearance: 'none', cursor: 'pointer',
            background: active ? C.navy : C.surface3,
            color: active ? '#fff' : C.text,
            border: 0, borderRadius: 999,
            padding: '7px 12px',
            fontFamily: font.body, fontSize: 12.5, fontWeight: 600,
            flexShrink: 0,
          }}>{o.label}</button>
        );
      })}
    </div>
  );
}

// ─── Row ───────────────────────────────────────────────────────────────────
function NotifRow({ n }) {
  const t = TYPES[n.type];
  return (
    <div style={{
      display: 'flex', gap: 12, padding: '14px 20px',
      background: n.unread ? 'rgba(255,107,53,0.03)' : '#fff',
      borderBottom: `1px solid ${C.lineSoft}`,
      cursor: 'pointer',
      position: 'relative',
    }}>
      {n.unread && (
        <div style={{
          position: 'absolute', left: 8, top: 22,
          width: 6, height: 6, borderRadius: '50%', background: C.orange,
        }} />
      )}
      <div style={{
        width: 40, height: 40, borderRadius: 12,
        background: t.bg, color: t.color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon d={t.icon} size={18} stroke={t.color} sw={2} fill={n.type === 'avaliacao' ? t.color : 'none'} />
      </div>
      <div style={{ flex: 1, minWidth: 0, paddingTop: 1 }}>
        <div style={{
          display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8,
        }}>
          <div style={{
            fontFamily: font.body, fontSize: 14, fontWeight: 700,
            color: C.text, letterSpacing: -0.1,
          }}>{n.title}</div>
          <div style={{
            fontFamily: font.body, fontSize: 11, color: C.textSoft, flexShrink: 0,
          }}>{n.time}</div>
        </div>
        <div style={{
          fontFamily: font.body, fontSize: 13, color: C.textMute, marginTop: 3, lineHeight: 1.4,
        }}>{n.body}</div>
        {n.action && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            marginTop: 8,
            fontFamily: font.body, fontSize: 12, fontWeight: 700, color: C.navy,
          }}>
            {n.action}
            <Icon d={ICONS.chev} size={12} stroke={C.navy} sw={2.4} />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Data ──────────────────────────────────────────────────────────────────
const N_HOJE = [
  { id: 1, type: 'pagamento', title: 'Pagamento liberado · R$ 260,00', body: 'O valor do turno no Quintal Eventos caiu na sua chave Pix.', time: 'agora', action: 'Ver carteira', unread: true },
  { id: 2, type: 'vaga', title: 'Nova vaga compatível', body: 'Bar do Pedrão · Garçom · R$ 180 · hoje 18h. Está a 1,2 km de você.', time: '32 min', action: 'Ver vaga', unread: true },
  { id: 3, type: 'turno', title: 'Lembrete: turno em 3h', body: 'Você fez check-in no Bar do Pedrão? Lembre-se de levar camisa preta e RG.', time: '2h', unread: true },
];
const N_ONTEM = [
  { id: 4, type: 'avaliacao', title: 'Você recebeu 5,0 estrelas', body: 'Quintal Eventos avaliou seu turno: "Trabalhou bem · voltaria a contratar".', time: 'ontem 03h', action: 'Ver avaliação', unread: false },
  { id: 5, type: 'escrow', title: 'R$ 260,00 reservados em escrow', body: 'O valor da sua vaga sábado já está protegido até você fazer check-out.', time: 'ontem', unread: false },
];
const N_SEMANA = [
  { id: 6, type: 'badge', title: 'Nova conquista: Estrela ⭐', body: 'Você acumulou 15 avaliações 5,0. Continue assim para chegar a Top Pro.', time: 'qua', action: 'Ver perfil', unread: false },
  { id: 7, type: 'alerta', title: 'Vaga urgente perto de você', body: 'Brasa Hamburgueria precisa de 1 atendente em 2h. R$ 165.', time: 'ter', unread: false },
  { id: 8, type: 'vaga', title: 'Nova vaga compatível', body: 'Vovó Tereza · Aux. de Cozinha · dom 26 mai · R$ 210.', time: 'seg', unread: false },
];

// ─── Tab bar ───────────────────────────────────────────────────────────────
const WORKER_NAV = {
  home:   '02 Home Trabalhador.html',
  shifts: '09 Meus Turnos.html',
  pay:    '10 Carteira.html',
  me:     '06 Perfil do Trabalhador.html',
};
function TabBar() {
  const tabs = [
    { id: 'home', label: 'Vagas', icon: ICONS.home },
    { id: 'shifts', label: 'Turnos', icon: ICONS.cal },
    { id: 'pay', label: 'Carteira', icon: ICONS.wallet },
    { id: 'me', label: 'Perfil', icon: ICONS.user },
  ];
  const go = (id) => { window.location.href = encodeURI(WORKER_NAV[id]); };
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      paddingBottom: 28, paddingTop: 8,
      background: '#fff', borderTop: `1px solid ${C.lineSoft}`,
      display: 'flex', justifyContent: 'space-around', alignItems: 'center', zIndex: 5,
    }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => go(t.id)} style={{
          appearance: 'none', border: 0, background: 'transparent',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
          padding: '6px 12px', cursor: 'pointer',
        }}>
          <Icon d={t.icon} size={22} stroke={C.textSoft} sw={1.8} />
          <div style={{
            fontFamily: font.body, fontSize: 10.5, fontWeight: 500, color: C.textSoft,
          }}>{t.label}</div>
        </button>
      ))}
    </div>
  );
}

// ─── Screen ────────────────────────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <div style={{
      padding: '14px 20px 8px', background: C.surface2,
      fontFamily: font.body, fontSize: 11, fontWeight: 700,
      color: C.textSoft, letterSpacing: 0.6, textTransform: 'uppercase',
    }}>{children}</div>
  );
}

function Notifications() {
  const [filter, setFilter] = React.useState('todas');
  const [data, setData] = React.useState({ hoje: N_HOJE, ontem: N_ONTEM, semana: N_SEMANA });

  const markAll = () => {
    setData({
      hoje: data.hoje.map(n => ({ ...n, unread: false })),
      ontem: data.ontem.map(n => ({ ...n, unread: false })),
      semana: data.semana.map(n => ({ ...n, unread: false })),
    });
  };

  const fl = (arr) => filter === 'todas' ? arr : arr.filter(n => n.type === filter || (filter === 'pagamento' && n.type === 'escrow'));
  const hojeF = fl(data.hoje);
  const ontemF = fl(data.ontem);
  const semanaF = fl(data.semana);
  const unreadCount = [...data.hoje, ...data.ontem, ...data.semana].filter(n => n.unread).length;

  return (
    <div style={{
      height: '100%', width: '100%', overflow: 'hidden',
      background: C.surface2, fontFamily: font.body, position: 'relative',
      display: 'flex', flexDirection: 'column',
    }}>
      <Header unread={unreadCount} onMarkRead={markAll} />
      <Filters filter={filter} setFilter={setFilter} />
      <div style={{ flex: 1, overflow: 'auto', paddingBottom: 100 }}>
        {hojeF.length > 0 && <SectionLabel>Hoje</SectionLabel>}
        {hojeF.map(n => <NotifRow key={n.id} n={n} />)}
        {ontemF.length > 0 && <SectionLabel>Ontem</SectionLabel>}
        {ontemF.map(n => <NotifRow key={n.id} n={n} />)}
        {semanaF.length > 0 && <SectionLabel>Esta semana</SectionLabel>}
        {semanaF.map(n => <NotifRow key={n.id} n={n} />)}
      </div>
      <TabBar />
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
    }} data-screen-label="11 Notificações">
      <IOSDevice width={402} height={874} dark={false}>
        <Notifications />
      </IOSDevice>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
