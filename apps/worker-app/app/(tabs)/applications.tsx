import { useState, useEffect } from 'react'
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  RefreshControl, ActivityIndicator, ScrollView,
} from 'react-native'
import { router } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Svg, Path } from 'react-native-svg'
import { api } from '../../lib/api'
import { C, ICON_PATHS } from '../../lib/theme'
import { formatTime, specialtyLabel } from '../../lib/format'

// ── Types ──────────────────────────────────────────────────────────────────
type Application = {
  id: string
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'NO_SHOW' | 'COMPLETED'
  checkin_at: string | null
  checkout_at: string | null
  hours_worked: number | null
  worker_amount?: number
  rating_received?: number | null
  has_rated_business?: boolean
  cancellation_reason?: string | null
  shift: {
    id: string
    specialty: string
    starts_at: string
    ends_at: string
    total_value: number
    worker_amount?: number
    rate_per_hour?: number
    business: { trade_name: string }
  }
}

type LabelItem = { _label: true; id: string; text: string }
type ProxItem = Application | LabelItem

type Tab = 'prox' | 'and' | 'conc' | 'canc'

// ── Helpers ────────────────────────────────────────────────────────────────
const COMPANY_COLORS = ['#1B3FA0', '#FF6B35', '#00A372', '#7C2D12', '#A67C00', '#5B21B6', '#0369A1']
function companyColor(name: string) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffffff
  return COMPANY_COLORS[Math.abs(h) % COMPANY_COLORS.length]
}

function shiftDateLabel(iso: string): string {
  const d = new Date(iso)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  if (d.toDateString() === today.toDateString()) return 'hoje'
  if (d.toDateString() === tomorrow.toDateString()) return 'amanhã'
  return d.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })
}

function timeRange(starts: string, ends: string) {
  return `${formatTime(starts)}–${formatTime(ends)}`
}

function hoursUntilLabel(iso: string): string | null {
  const diff = new Date(iso).getTime() - Date.now()
  const h = Math.floor(diff / 3600000)
  if (h < 0 || h > 24) return null
  return `${h}h`
}

function workerValue(app: Application): string {
  const raw = app.shift.worker_amount ?? app.shift.total_value * 0.82
  return raw.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function groupApplications(apps: Application[]) {
  const prox: Application[] = []
  const and: Application[] = []
  const conc: Application[] = []
  const canc: Application[] = []
  for (const a of apps) {
    if (a.status === 'COMPLETED') conc.push(a)
    else if (a.status === 'CANCELLED' || a.status === 'NO_SHOW') canc.push(a)
    else if (a.checkin_at && !a.checkout_at) and.push(a)
    else prox.push(a)
  }
  return { prox, and, conc, canc }
}

function buildProxList(apps: Application[]): ProxItem[] {
  const today = apps.filter(a => shiftDateLabel(a.shift.starts_at) === 'hoje')
  const upcoming = apps.filter(a => shiftDateLabel(a.shift.starts_at) !== 'hoje')
  const items: ProxItem[] = []
  if (today.length > 0) {
    items.push({ _label: true, id: '__label_hoje', text: 'Hoje' })
    items.push(...today)
  }
  if (upcoming.length > 0) {
    items.push({ _label: true, id: '__label_prox', text: 'Próximos dias' })
    items.push(...upcoming)
  }
  return items
}

// ── Icon helper ────────────────────────────────────────────────────────────
function Icon({ d, size = 18, stroke = 'currentColor', sw = 1.8, fill = 'none' }: {
  d: string; size?: number; stroke?: string; sw?: number; fill?: string
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={fill}>
      <Path d={d} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" fill={fill} />
    </Svg>
  )
}

// ── CompanyMark ────────────────────────────────────────────────────────────
function CompanyMark({ name, size = 44, faded = false }: { name: string; size?: number; faded?: boolean }) {
  return (
    <View style={[cm.wrap, {
      width: size, height: size,
      backgroundColor: faded ? C.surface3 : companyColor(name),
    }]}>
      <Text style={[cm.letter, { fontSize: size * 0.42, color: faded ? C.textMute : '#fff' }]}>
        {name[0]?.toUpperCase()}
      </Text>
    </View>
  )
}
const cm = StyleSheet.create({
  wrap: { borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  letter: { fontWeight: '700', letterSpacing: -0.5 },
})

// ── MetaPill ───────────────────────────────────────────────────────────────
function MetaPill({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={mp.pill}>
      <Icon d={icon} size={12} stroke={C.navy} sw={2} />
      <Text style={mp.text}>{text}</Text>
    </View>
  )
}
const mp = StyleSheet.create({
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: C.surface3, paddingHorizontal: 9, paddingVertical: 5,
    borderRadius: 8,
  },
  text: { fontSize: 12, fontWeight: '500', color: C.textMute },
})

// ── CardProximo ────────────────────────────────────────────────────────────
function CardProximo({ app }: { app: Application }) {
  const soon = hoursUntilLabel(app.shift.starts_at)
  const date = shiftDateLabel(app.shift.starts_at)
  const time = timeRange(app.shift.starts_at, app.shift.ends_at)
  const val = workerValue(app)

  return (
    <View style={prox.card}>
      <View style={prox.topRow}>
        <CompanyMark name={app.shift.business.trade_name} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={prox.company} numberOfLines={1}>{app.shift.business.trade_name}</Text>
          <Text style={prox.role} numberOfLines={1}>{specialtyLabel(app.shift.specialty)}</Text>
        </View>
        {soon && (
          <View style={prox.urgentBadge}>
            <Icon d={ICON_PATHS.bolt} size={10} stroke="#fff" sw={2.4} fill="#fff" />
            <Text style={prox.urgentText}>em {soon}</Text>
          </View>
        )}
      </View>

      <View style={prox.metaRow}>
        <MetaPill icon={ICON_PATHS.calendar} text={date} />
        <MetaPill icon={ICON_PATHS.clock} text={time} />
      </View>

      <View style={prox.divider} />

      <View style={prox.bottom}>
        <View style={prox.escrowRow}>
          <Icon d={ICON_PATHS.lock} size={11} stroke={C.jadeDeep} sw={2.2} />
          <Text style={prox.escrowText}>R$ {val} em escrow</Text>
        </View>
        <TouchableOpacity
          style={prox.checkinBtn}
          onPress={() => router.push(`/checkin/${app.shift.id}`)}
          activeOpacity={0.85}
        >
          <Text style={prox.checkinText}>Check-in</Text>
          <Icon d={ICON_PATHS.chevR} size={14} stroke={C.jadeInk} sw={2.4} />
        </TouchableOpacity>
      </View>
    </View>
  )
}

const prox = StyleSheet.create({
  card: {
    backgroundColor: C.surface, borderRadius: 18, padding: 16,
    borderWidth: 1, borderColor: C.line,
    shadowColor: C.navy, shadowOpacity: 0.05, shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }, elevation: 2,
  },
  topRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  company: { fontSize: 12, fontWeight: '600', color: C.textMute },
  role: { fontSize: 18, fontWeight: '700', color: C.text, letterSpacing: -0.4, marginTop: 1 },
  urgentBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: C.orange, borderRadius: 999,
    paddingHorizontal: 9, paddingVertical: 4,
  },
  urgentText: { fontSize: 10, fontWeight: '700', color: '#fff', letterSpacing: 0.4, textTransform: 'uppercase' },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  divider: { height: 1, borderStyle: 'dashed', borderWidth: 1, borderColor: C.line, marginTop: 14 },
  bottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 14 },
  escrowRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  escrowText: { fontSize: 11, fontWeight: '700', color: C.jadeDeep, letterSpacing: 0.4, textTransform: 'uppercase' },
  checkinBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: C.jade, borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 10,
    shadowColor: C.jade, shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  checkinText: { fontSize: 13.5, fontWeight: '700', color: C.jadeInk, letterSpacing: -0.1 },
})

// ── CardAndamento (live timer) ─────────────────────────────────────────────
function CardAndamento({ app }: { app: Application }) {
  const checkinTs = app.checkin_at ? new Date(app.checkin_at).getTime() : Date.now()
  const [elapsed, setElapsed] = useState(Math.floor((Date.now() - checkinTs) / 1000))

  useEffect(() => {
    const iv = setInterval(() => setElapsed(Math.floor((Date.now() - checkinTs) / 1000)), 1000)
    return () => clearInterval(iv)
  }, [checkinTs])

  const hh = Math.floor(elapsed / 3600)
  const mm = Math.floor((elapsed % 3600) / 60)
  const ss = elapsed % 60
  const pad = (n: number) => String(n).padStart(2, '0')

  const durationSec = (new Date(app.shift.ends_at).getTime() - new Date(app.shift.starts_at).getTime()) / 1000
  const progress = Math.min(1, elapsed / durationSec)

  const workerAmt = app.shift.worker_amount ?? app.shift.total_value * 0.82
  const accumulated = (workerAmt * progress).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <View style={live.card}>
      <View style={live.glow} pointerEvents="none" />

      <View style={{ zIndex: 1 }}>
        <View style={live.topRow}>
          <CompanyMark name={app.shift.business.trade_name} />
          <View style={{ flex: 1 }}>
            <View style={live.badge}>
              <View style={live.pulseDot} />
              <Text style={live.badgeText}>Em andamento</Text>
            </View>
            <Text style={live.company}>{app.shift.business.trade_name}</Text>
            <Text style={live.role}>{specialtyLabel(app.shift.specialty)}</Text>
          </View>
        </View>

        <View style={live.timerRow}>
          <Text style={live.timerMain}>{pad(hh)}:{pad(mm)}</Text>
          <Text style={live.timerSec}>:{pad(ss)}</Text>
        </View>

        <View style={live.progressBg}>
          <View style={[live.progressFill, { width: `${Math.floor(progress * 100)}%` as any }]} />
        </View>

        <View style={live.bottom}>
          <View>
            <Text style={live.accLabel}>Acumulado</Text>
            <Text style={live.accValue}>R$ {accumulated}</Text>
          </View>
          <TouchableOpacity
            style={live.checkoutBtn}
            onPress={() => router.push(`/checkin/${app.shift.id}`)}
            activeOpacity={0.85}
          >
            <Text style={live.checkoutText}>Check-out</Text>
            <Icon d={ICON_PATHS.chevR} size={14} stroke={C.jadeInk} sw={2.4} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const live = StyleSheet.create({
  card: {
    backgroundColor: C.navy, borderRadius: 18, padding: 16,
    overflow: 'hidden', position: 'relative',
  },
  glow: {
    position: 'absolute', top: -60, right: -40,
    width: 180, height: 180, borderRadius: 90,
    backgroundColor: 'rgba(0,196,140,0.16)',
  },
  topRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,196,140,0.18)', borderRadius: 999,
    paddingHorizontal: 9, paddingVertical: 4,
  },
  pulseDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: C.jade },
  badgeText: { fontSize: 10, fontWeight: '700', color: '#7FE6C5', letterSpacing: 0.6, textTransform: 'uppercase' },
  company: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.55)', marginTop: 8 },
  role: { fontSize: 18, fontWeight: '700', color: '#fff', letterSpacing: -0.4, marginTop: 1 },
  timerRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 16 },
  timerMain: { fontSize: 44, fontWeight: '800', color: '#fff', letterSpacing: -1.8, lineHeight: 52 },
  timerSec: { fontSize: 44, fontWeight: '800', color: 'rgba(255,255,255,0.4)', letterSpacing: -1.8, lineHeight: 52 },
  progressBg: {
    marginTop: 12, height: 5, borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.10)', overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: C.jade, borderRadius: 3 },
  bottom: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    gap: 12, marginTop: 14,
  },
  accLabel: { fontSize: 10.5, fontWeight: '700', color: 'rgba(255,255,255,0.55)', letterSpacing: 0.6, textTransform: 'uppercase' },
  accValue: { fontSize: 20, fontWeight: '800', color: '#7FE6C5', letterSpacing: -0.6, marginTop: 2 },
  checkoutBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: C.jade, borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 11,
    shadowColor: C.jade, shadowOpacity: 0.35, shadowRadius: 10, shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  checkoutText: { fontSize: 13.5, fontWeight: '700', color: C.jadeInk },
})

// ── CardConcluido ──────────────────────────────────────────────────────────
function CardConcluido({ app }: { app: Application }) {
  const date = shiftDateLabel(app.shift.starts_at)
  const val = workerValue(app)
  const rating = app.rating_received
  const evaluated = app.has_rated_business ?? false

  return (
    <View style={done.card}>
      <View style={done.topRow}>
        <CompanyMark name={app.shift.business.trade_name} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={done.meta} numberOfLines={1}>{app.shift.business.trade_name} · {date}</Text>
          <Text style={done.role} numberOfLines={1}>{specialtyLabel(app.shift.specialty)}</Text>
          {rating != null && (
            <View style={done.ratingRow}>
              <View style={done.ratingBadge}>
                <Svg width={10} height={10} viewBox="0 0 24 24" fill="#F5B400">
                  <Path d={ICON_PATHS.star} stroke="#F5B400" strokeWidth={1.5} fill="#F5B400" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
                <Text style={done.ratingNum}>{rating.toFixed(1).replace('.', ',')}</Text>
              </View>
              <Text style={done.ratingLabel}>nota recebida</Text>
            </View>
          )}
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <View style={done.releasedRow}>
            <Icon d={ICON_PATHS.check} size={11} stroke={C.jadeDeep} sw={2.6} />
            <Text style={done.releasedLabel}>Liberado</Text>
          </View>
          <Text style={done.releasedValue}>R$ {val}</Text>
        </View>
      </View>

      <View style={done.divider} />
      <View style={done.actions}>
        {evaluated ? (
          <View style={done.evaluatedBox}>
            <Icon d={ICON_PATHS.check} size={14} stroke={C.jadeDeep} sw={2.4} />
            <Text style={done.evaluatedText}>Empresa avaliada</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={done.evaluateBtn}
            onPress={() => router.push(`/shifts/${app.shift.id}`)}
            activeOpacity={0.85}
          >
            <Svg width={14} height={14} viewBox="0 0 24 24" fill="#fff">
              <Path d={ICON_PATHS.star} stroke="#fff" strokeWidth={2} fill="#fff" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
            <Text style={done.evaluateBtnText}>Avaliar empresa</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={done.receiptBtn} activeOpacity={0.85}>
          <Text style={done.receiptBtnText}>Recibo</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const done = StyleSheet.create({
  card: { backgroundColor: C.surface, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: C.line },
  topRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  meta: { fontSize: 12, fontWeight: '600', color: C.textMute },
  role: { fontSize: 17, fontWeight: '700', color: C.text, letterSpacing: -0.4, marginTop: 1 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  ratingBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#FFFBE6', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 7,
  },
  ratingNum: { fontSize: 11.5, fontWeight: '700', color: '#7C5C00' },
  ratingLabel: { fontSize: 11.5, color: C.textSoft },
  releasedRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  releasedLabel: { fontSize: 10, fontWeight: '700', color: C.jadeDeep, letterSpacing: 0.4, textTransform: 'uppercase' },
  releasedValue: { fontSize: 18, fontWeight: '800', color: C.jadeDeep, letterSpacing: -0.4, marginTop: 3 },
  divider: { height: 1, backgroundColor: C.lineSoft, marginTop: 14, marginBottom: 12 },
  actions: { flexDirection: 'row', gap: 8 },
  evaluatedBox: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: C.surface3, borderRadius: 11, paddingHorizontal: 12, paddingVertical: 10,
  },
  evaluatedText: { fontSize: 12.5, color: C.textMute },
  evaluateBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: C.navy, borderRadius: 11, paddingHorizontal: 14, paddingVertical: 10,
  },
  evaluateBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  receiptBtn: { backgroundColor: C.surface3, borderRadius: 11, paddingHorizontal: 14, paddingVertical: 10 },
  receiptBtnText: { fontSize: 13, fontWeight: '600', color: C.text },
})

// ── CardCancelado ──────────────────────────────────────────────────────────
function CardCancelado({ app }: { app: Application }) {
  const date = shiftDateLabel(app.shift.starts_at)

  return (
    <View style={[canc.card, { opacity: 0.85 }]}>
      <View style={canc.topRow}>
        <CompanyMark name={app.shift.business.trade_name} faded />
        <View style={{ flex: 1 }}>
          <Text style={canc.meta} numberOfLines={1}>{app.shift.business.trade_name} · {date}</Text>
          <Text style={canc.role} numberOfLines={1}>{specialtyLabel(app.shift.specialty)}</Text>
        </View>
        <View style={canc.badge}>
          <Icon d={ICON_PATHS.x} size={10} stroke={C.textMute} sw={2.4} />
          <Text style={canc.badgeText}>Cancelado</Text>
        </View>
      </View>
      {app.cancellation_reason ? (
        <View style={canc.reasonBox}>
          <Text style={canc.reasonText}>
            <Text style={canc.reasonBold}>Motivo: </Text>
            {app.cancellation_reason}
          </Text>
        </View>
      ) : null}
    </View>
  )
}

const canc = StyleSheet.create({
  card: { backgroundColor: C.surface, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: C.line },
  topRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  meta: { fontSize: 12, fontWeight: '600', color: C.textMute },
  role: { fontSize: 16, fontWeight: '700', color: C.text, letterSpacing: -0.3, marginTop: 1, textDecorationLine: 'line-through' },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: C.surface3, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3,
  },
  badgeText: { fontSize: 10, fontWeight: '700', color: C.textMute, letterSpacing: 0.4, textTransform: 'uppercase' },
  reasonBox: { marginTop: 12, backgroundColor: C.surface2, borderRadius: 11, padding: 12 },
  reasonText: { fontSize: 12.5, color: C.textMute, lineHeight: 18 },
  reasonBold: { fontWeight: '700', color: C.text },
})

// ── SectionLabel ───────────────────────────────────────────────────────────
function SectionLabel({ text }: { text: string }) {
  return <Text style={sl.label}>{text}</Text>
}
const sl = StyleSheet.create({
  label: {
    fontSize: 11.5, fontWeight: '700', color: C.textSoft,
    letterSpacing: 0.6, textTransform: 'uppercase',
    paddingHorizontal: 20, marginTop: 18, marginBottom: 8,
  },
})

// ── Main Screen ────────────────────────────────────────────────────────────
export default function ApplicationsScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('prox')

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['my-applications'],
    queryFn: () => api.get<Application[]>('/workers/me/applications'),
  })

  const apps = data ?? []
  const groups = groupApplications(apps)
  const counts = {
    prox: groups.prox.length,
    and: groups.and.length,
    conc: groups.conc.length,
    canc: groups.canc.length,
  }

  const proxList = buildProxList(groups.prox)

  const TABS: { id: Tab; label: string }[] = [
    { id: 'prox', label: 'Próximos' },
    { id: 'and', label: 'Em andamento' },
    { id: 'conc', label: 'Concluídos' },
    { id: 'canc', label: 'Cancelados' },
  ]

  function renderProxItem({ item }: { item: ProxItem }) {
    if ('_label' in item) return <SectionLabel text={item.text} />
    return (
      <View style={{ paddingHorizontal: 20, marginBottom: 12 }}>
        <CardProximo app={item} />
      </View>
    )
  }

  function renderAndItem({ item }: { item: Application }) {
    return <View style={{ paddingHorizontal: 20, marginBottom: 12 }}><CardAndamento app={item} /></View>
  }

  function renderConcItem({ item }: { item: Application }) {
    return <View style={{ paddingHorizontal: 20, marginBottom: 12 }}><CardConcluido app={item} /></View>
  }

  function renderCancItem({ item }: { item: Application }) {
    return <View style={{ paddingHorizontal: 20, marginBottom: 12 }}><CardCancelado app={item} /></View>
  }

  function EmptyState({ label }: { label: string }) {
    return (
      <View style={s.empty}>
        <Text style={s.emptyText}>{label}</Text>
      </View>
    )
  }

  const emptyLabel =
    activeTab === 'prox' ? 'Nenhum turno próximo' :
    activeTab === 'and' ? 'Nenhum turno em andamento' :
    activeTab === 'conc' ? 'Nenhum turno concluído' :
    'Nenhum turno cancelado'

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <View style={{ flex: 1 }}>
          <Text style={s.headerLabel}>Meus turnos</Text>
          <Text style={s.headerTitle}>Agenda</Text>
        </View>
        <TouchableOpacity style={s.filterBtn} activeOpacity={0.8}>
          <Icon d={ICON_PATHS.filter} size={18} stroke={C.ink} sw={2.2} />
        </TouchableOpacity>
      </View>

      {/* Tab strip */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={s.tabStrip}
        contentContainerStyle={s.tabStripContent}
      >
        {TABS.map(t => {
          const active = t.id === activeTab
          return (
            <TouchableOpacity
              key={t.id}
              onPress={() => setActiveTab(t.id)}
              style={[s.tab, active && s.tabActive]}
              activeOpacity={0.8}
            >
              <Text style={[s.tabLabel, active && s.tabLabelActive]}>{t.label}</Text>
              <View style={[s.tabBadge, active && s.tabBadgeActive]}>
                <Text style={[s.tabBadgeText, active && s.tabBadgeTextActive]}>{counts[t.id]}</Text>
              </View>
            </TouchableOpacity>
          )
        })}
      </ScrollView>

      {/* Content */}
      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 60 }} color={C.navy} size="large" />
      ) : activeTab === 'prox' ? (
        <FlatList
          data={proxList}
          keyExtractor={(item) => ('_label' in item ? item.id : item.id)}
          renderItem={renderProxItem}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={C.navy} />}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<EmptyState label={emptyLabel} />}
        />
      ) : activeTab === 'and' ? (
        <FlatList
          data={groups.and}
          keyExtractor={(a) => a.id}
          renderItem={renderAndItem}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={C.navy} />}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<EmptyState label={emptyLabel} />}
        />
      ) : activeTab === 'conc' ? (
        <FlatList
          data={groups.conc}
          keyExtractor={(a) => a.id}
          renderItem={renderConcItem}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={C.navy} />}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<EmptyState label={emptyLabel} />}
        />
      ) : (
        <FlatList
          data={groups.canc}
          keyExtractor={(a) => a.id}
          renderItem={renderCancItem}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={C.navy} />}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<EmptyState label={emptyLabel} />}
        />
      )}
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.surface2 },
  header: {
    paddingTop: 4, paddingBottom: 16, paddingHorizontal: 20,
    backgroundColor: C.surface,
    borderBottomWidth: 1, borderBottomColor: C.lineSoft,
    flexDirection: 'row', alignItems: 'center',
  },
  headerLabel: {
    fontSize: 11.5, fontWeight: '700', color: C.textSoft,
    letterSpacing: 0.6, textTransform: 'uppercase',
  },
  headerTitle: {
    fontSize: 26, fontWeight: '800', color: C.text,
    letterSpacing: -0.8, marginTop: 2,
  },
  filterBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: C.surface3,
    alignItems: 'center', justifyContent: 'center',
  },
  tabStrip: {
    backgroundColor: C.surface,
    borderBottomWidth: 1, borderBottomColor: C.lineSoft,
    flexGrow: 0,
  },
  tabStripContent: { paddingHorizontal: 16, gap: 4 },
  tab: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingTop: 10, paddingBottom: 12,
    borderBottomWidth: 3, borderBottomColor: 'transparent',
    marginBottom: -1,
  },
  tabActive: { borderBottomColor: C.navy },
  tabLabel: { fontSize: 13.5, fontWeight: '600', color: C.textMute, letterSpacing: -0.1 },
  tabLabelActive: { fontWeight: '700', color: C.text },
  tabBadge: {
    backgroundColor: C.surface3, borderRadius: 999,
    paddingHorizontal: 7, paddingVertical: 1,
  },
  tabBadgeActive: { backgroundColor: C.navy },
  tabBadgeText: { fontSize: 11, fontWeight: '700', color: C.textMute },
  tabBadgeTextActive: { color: '#fff' },
  list: { paddingTop: 4, paddingBottom: 32 },
  empty: { paddingVertical: 48, alignItems: 'center', paddingHorizontal: 20 },
  emptyText: { fontSize: 14, color: C.textMute, textAlign: 'center' },
})
