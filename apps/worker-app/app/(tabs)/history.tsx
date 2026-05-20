import { useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  RefreshControl, ActivityIndicator,
} from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Svg, Path } from 'react-native-svg'
import { api } from '../../lib/api'
import { C, ICON_PATHS } from '../../lib/theme'
import { specialtyLabel, formatDate } from '../../lib/format'

// ── Types ──────────────────────────────────────────────────────────────────
type EscrowRecord = {
  id: string
  status: 'RESERVED' | 'CONFIRMED' | 'RELEASED' | 'REFUNDED' | 'FAILED'
  gross_amount: number
  worker_amount: number
  released_at: string | null
  confirmed_at: string | null
  created_at: string
  shift: {
    id: string
    specialty: string
    starts_at: string
    ends_at: string
    business: { trade_name: string }
  }
}

type WorkerProfile = {
  pix_key: string | null
  pix_key_type: string | null
}

// ── Helpers ────────────────────────────────────────────────────────────────
const COMPANY_COLORS = ['#1B3FA0', '#FF6B35', '#00A372', '#7C2D12', '#A67C00', '#5B21B6', '#0369A1']
function companyColor(name: string) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffffff
  return COMPANY_COLORS[Math.abs(h) % COMPANY_COLORS.length]
}

function fmt(amount: number) {
  return amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function releaseEta(record: EscrowRecord): string | null {
  const ends = new Date(record.shift.ends_at)
  const eta = new Date(ends.getTime() + 60 * 60 * 1000)
  const now = new Date()
  if (eta <= now) return null
  const day = eta.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })
  const time = eta.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  return `libera ${day} · ${time}`
}

function monthLabel(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    .replace(/^\w/, c => c.toUpperCase())
}

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
function CompanyMark({ name }: { name: string }) {
  return (
    <View style={[cm.wrap, { backgroundColor: companyColor(name) }]}>
      <Text style={cm.letter}>{name[0]?.toUpperCase()}</Text>
    </View>
  )
}
const cm = StyleSheet.create({
  wrap: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  letter: { fontSize: 17, fontWeight: '700', color: '#fff', letterSpacing: -0.5 },
})

// ── StatusPill ─────────────────────────────────────────────────────────────
function StatusPill({ status }: { status: EscrowRecord['status'] }) {
  const map = {
    RESERVED:  { bg: '#FFF1E9', fg: '#C2511A', icon: ICON_PATHS.lock, label: 'Em escrow' },
    CONFIRMED: { bg: '#FFF1E9', fg: '#C2511A', icon: ICON_PATHS.lock, label: 'Em escrow' },
    RELEASED:  { bg: C.jadeSoft, fg: C.jadeDeep, icon: ICON_PATHS.check, label: 'Liberado' },
    REFUNDED:  { bg: C.surface3, fg: C.textMute, icon: ICON_PATHS.x, label: 'Estornado' },
    FAILED:    { bg: '#FEE2E2', fg: '#DC2626', icon: ICON_PATHS.warn, label: 'Falhou' },
  }
  const m = map[status] ?? map.FAILED
  return (
    <View style={[sp.pill, { backgroundColor: m.bg }]}>
      <Icon d={m.icon} size={10} stroke={m.fg} sw={2.4} />
      <Text style={[sp.text, { color: m.fg }]}>{m.label}</Text>
    </View>
  )
}
const sp = StyleSheet.create({
  pill: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start' },
  text: { fontSize: 10.5, fontWeight: '700', letterSpacing: 0.4, textTransform: 'uppercase' },
})

// ── PaymentRow ─────────────────────────────────────────────────────────────
function PaymentRow({ record, last }: { record: EscrowRecord; last?: boolean }) {
  const eta = (record.status === 'RESERVED' || record.status === 'CONFIRMED') ? releaseEta(record) : null
  const isReleased = record.status === 'RELEASED'

  return (
    <View style={[pr.row, !last && pr.rowBorder]}>
      <CompanyMark name={record.shift.business.trade_name} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={pr.company} numberOfLines={1}>{record.shift.business.trade_name}</Text>
        <Text style={pr.sub} numberOfLines={1}>
          {specialtyLabel(record.shift.specialty)} · {formatDate(record.shift.starts_at)}
        </Text>
        <View style={{ marginTop: 5 }}>
          <StatusPill status={record.status} />
        </View>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={[pr.amount, isReleased && { color: C.jadeDeep }]}>
          +R$ {fmt(record.worker_amount)}
        </Text>
        {eta && <Text style={pr.eta}>{eta}</Text>}
      </View>
    </View>
  )
}
const pr = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: C.lineSoft },
  company: { fontSize: 14, fontWeight: '700', color: C.text, letterSpacing: -0.2 },
  sub: { fontSize: 12, color: C.textMute, marginTop: 1 },
  amount: { fontSize: 17, fontWeight: '800', color: C.text, letterSpacing: -0.4 },
  eta: { fontSize: 10.5, color: C.textSoft, marginTop: 2 },
})

// ── BalanceHeader ──────────────────────────────────────────────────────────
function BalanceHeader({ total, escrow, monthTotal, hidden, onToggle }: {
  total: number
  escrow: number
  monthTotal: number
  hidden: boolean
  onToggle: () => void
}) {
  const eyePath = 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z'
  const eyeOffPath = 'M3 3l18 18M10.6 6.2a9.7 9.7 0 0 1 1.4-.2c6 0 10 7 10 7a18 18 0 0 1-3.5 4.2M6 7a18 18 0 0 0-4 5s4 7 10 7c1.6 0 3-.4 4.4-1M9.9 9.9a3 3 0 1 0 4.2 4.2'

  return (
    <View style={bh.container}>
      <View style={bh.glow} pointerEvents="none" />

      <View style={{ zIndex: 1 }}>
        {/* Balance row */}
        <View style={bh.balanceRow}>
          <View style={{ flex: 1 }}>
            <Text style={bh.label}>Saldo disponível</Text>
            <View style={bh.amountRow}>
              <Text style={bh.amount}>{hidden ? 'R$ ••••' : `R$ ${fmt(total)}`}</Text>
              <TouchableOpacity onPress={onToggle} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Icon d={hidden ? eyeOffPath : eyePath} size={20} stroke="rgba(255,255,255,0.6)" sw={1.8} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Mini stats */}
        <View style={bh.statsRow}>
          <View>
            <Text style={bh.statLabel}>Este mês</Text>
            <Text style={bh.statValue}>{hidden ? '••••' : `R$ ${fmt(monthTotal)}`}</Text>
          </View>
          <View style={bh.statDivider} />
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Icon d={ICON_PATHS.lock} size={11} stroke="rgba(255,255,255,0.55)" sw={2} />
              <Text style={bh.statLabel}>Em escrow</Text>
            </View>
            <Text style={bh.statValue}>{hidden ? '••••' : `R$ ${fmt(escrow)}`}</Text>
          </View>
        </View>

        {/* Action buttons */}
        <View style={bh.actions}>
          <TouchableOpacity style={bh.btnJade} activeOpacity={0.85}>
            <Icon d={ICON_PATHS.pix} size={16} stroke={C.jadeInk} sw={2} />
            <Text style={bh.btnJadeText}>Sacar via Pix</Text>
          </TouchableOpacity>
          <TouchableOpacity style={bh.btnGhost} activeOpacity={0.85}>
            <Icon d={ICON_PATHS.doc} size={16} stroke="#fff" sw={2} />
            <Text style={bh.btnGhostText}>Extrato</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}
const bh = StyleSheet.create({
  container: {
    backgroundColor: C.navy, paddingTop: 12, paddingBottom: 70,
    paddingHorizontal: 20, overflow: 'hidden', position: 'relative',
  },
  glow: {
    position: 'absolute', top: -120, right: -80,
    width: 320, height: 320, borderRadius: 160,
    backgroundColor: 'rgba(0,196,140,0.16)',
  },
  label: { fontSize: 11.5, fontWeight: '700', color: 'rgba(255,255,255,0.55)', letterSpacing: 0.6, textTransform: 'uppercase' },
  balanceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  amountRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  amount: { fontSize: 42, fontWeight: '800', color: '#fff', letterSpacing: -1.4, lineHeight: 50 },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 18 },
  statDivider: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.15)' },
  statLabel: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.55)', letterSpacing: 0.3, textTransform: 'uppercase' },
  statValue: { fontSize: 17, fontWeight: '700', color: '#fff', letterSpacing: -0.4, marginTop: 4 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 22 },
  btnJade: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: C.jade, borderRadius: 14, paddingVertical: 12,
    shadowColor: C.jade, shadowOpacity: 0.4, shadowRadius: 14, shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  btnJadeText: { fontSize: 14, fontWeight: '700', color: C.jadeInk },
  btnGhost: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)',
    borderRadius: 14, paddingVertical: 12,
  },
  btnGhostText: { fontSize: 14, fontWeight: '700', color: '#fff' },
})

// ── PixInfo ────────────────────────────────────────────────────────────────
function PixInfo({ pixKey, pixType }: { pixKey: string | null; pixType: string | null }) {
  const masked = pixKey
    ? pixType === 'cpf'
      ? `CPF · ***.${pixKey.slice(-9, -6)}.${pixKey.slice(-6, -3)}-**`
      : `${pixType?.toUpperCase()} · ${pixKey.slice(0, 4)}***`
    : 'Não configurada'

  return (
    <View style={pi.card}>
      <View style={pi.icon}>
        <Icon d={ICON_PATHS.pix} size={18} stroke={C.jadeDeep} sw={2} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={pi.label}>Chave Pix configurada</Text>
        <Text style={pi.value}>{masked}</Text>
      </View>
      <TouchableOpacity hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Text style={pi.changeBtn}>Trocar</Text>
      </TouchableOpacity>
    </View>
  )
}
const pi = StyleSheet.create({
  card: {
    marginHorizontal: 20, backgroundColor: C.surface, borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: C.line,
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  icon: { width: 38, height: 38, borderRadius: 11, backgroundColor: C.jadeSoft, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 11, fontWeight: '700', color: C.textSoft, letterSpacing: 0.4, textTransform: 'uppercase' },
  value: { fontSize: 14, fontWeight: '600', color: C.text, marginTop: 2 },
  changeBtn: { fontSize: 12.5, fontWeight: '700', color: C.navy },
})

// ── SectionHeader ──────────────────────────────────────────────────────────
function SectionHeader({ label, total }: { label: string; total: string }) {
  return (
    <View style={sh.row}>
      <Text style={sh.label}>{label}</Text>
      <Text style={sh.total}>{total}</Text>
    </View>
  )
}
const sh = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', paddingHorizontal: 24, paddingBottom: 8 },
  label: { fontSize: 11, fontWeight: '700', color: C.textSoft, letterSpacing: 0.5, textTransform: 'uppercase' },
  total: { fontSize: 12, fontWeight: '700', color: C.jadeDeep, letterSpacing: -0.2 },
})

// ── Main Screen ────────────────────────────────────────────────────────────
export default function HistoryScreen() {
  const [hidden, setHidden] = useState(false)

  const { data: payments, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['payment-history'],
    queryFn: () => api.get<EscrowRecord[]>('/workers/me/payments'),
  })

  const { data: profile } = useQuery({
    queryKey: ['worker-profile'],
    queryFn: () => api.get<WorkerProfile>('/workers/me'),
  })

  const records = payments ?? []

  const pending = records.filter(r => r.status === 'RESERVED' || r.status === 'CONFIRMED')
  const history = records.filter(r => r.status === 'RELEASED' || r.status === 'REFUNDED' || r.status === 'FAILED')

  const totalReleased = records.filter(r => r.status === 'RELEASED').reduce((s, r) => s + r.worker_amount, 0)
  const escrowTotal = pending.reduce((s, r) => s + r.worker_amount, 0)

  const now = new Date()
  const monthTotal = records
    .filter(r => r.status === 'RELEASED' && new Date(r.released_at ?? r.created_at).getMonth() === now.getMonth())
    .reduce((s, r) => s + r.worker_amount, 0)

  // Group history by month
  const byMonth = history.reduce<Record<string, EscrowRecord[]>>((acc, r) => {
    const key = monthLabel(r.shift.starts_at)
    if (!acc[key]) acc[key] = []
    acc[key].push(r)
    return acc
  }, {})

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 80 }} color={C.navy} size="large" />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#fff" />}
        >
          <BalanceHeader
            total={totalReleased}
            escrow={escrowTotal}
            monthTotal={monthTotal}
            hidden={hidden}
            onToggle={() => setHidden(h => !h)}
          />

          {/* Content panel slides over header */}
          <View style={s.panel}>
            <PixInfo pixKey={profile?.pix_key ?? null} pixType={profile?.pix_key_type ?? null} />

            {/* Próximos recebimentos */}
            {pending.length > 0 && (
              <View style={s.section}>
                <View style={s.sectionTitleRow}>
                  <Text style={s.sectionTitle}>Próximos recebimentos</Text>
                  <Text style={s.sectionAmt}>R$ {fmt(escrowTotal)}</Text>
                </View>
                <View style={s.card}>
                  {pending.map((r, i) => (
                    <PaymentRow key={r.id} record={r} last={i === pending.length - 1} />
                  ))}
                </View>
                <View style={s.escrowNote}>
                  <Icon d={ICON_PATHS.info} size={14} stroke={C.orange} sw={2} />
                  <Text style={s.escrowNoteText}>
                    Valores em escrow são liberados automaticamente em até 1h após o seu check-out.
                  </Text>
                </View>
              </View>
            )}

            {/* Histórico */}
            <View style={[s.section, { marginBottom: 32 }]}>
              <View style={[s.sectionTitleRow, { marginBottom: 10 }]}>
                <Text style={s.sectionTitle}>Histórico</Text>
                <TouchableOpacity style={s.filterBtn} activeOpacity={0.8}>
                  <Icon d={ICON_PATHS.filter} size={13} stroke={C.navy} sw={2.2} />
                  <Text style={s.filterText}>Filtros</Text>
                </TouchableOpacity>
              </View>

              {Object.keys(byMonth).length === 0 ? (
                <View style={s.empty}>
                  <Text style={s.emptyText}>Nenhum pagamento ainda</Text>
                  <Text style={s.emptySub}>Complete turnos para ver seus pagamentos aqui</Text>
                </View>
              ) : (
                Object.entries(byMonth).map(([month, items]) => {
                  const total = items.filter(r => r.status === 'RELEASED').reduce((s, r) => s + r.worker_amount, 0)
                  return (
                    <View key={month} style={{ marginBottom: 16 }}>
                      <SectionHeader label={month} total={`R$ ${fmt(total)}`} />
                      <View style={s.card}>
                        {items.map((r, i) => (
                          <PaymentRow key={r.id} record={r} last={i === items.length - 1} />
                        ))}
                      </View>
                    </View>
                  )
                })
              )}
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.surface2 },
  panel: {
    marginTop: -36,
    backgroundColor: C.surface2,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 18,
    zIndex: 2,
  },
  section: { marginTop: 22, paddingHorizontal: 20 },
  sectionTitleRow: {
    flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10,
  },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: C.text, letterSpacing: -0.4 },
  sectionAmt: { fontSize: 12.5, fontWeight: '700', color: C.orange },
  card: { backgroundColor: C.surface, borderRadius: 16, borderWidth: 1, borderColor: C.line, overflow: 'hidden' },
  escrowNote: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: '#FFF1E9', borderRadius: 10, padding: 12, marginTop: 10,
  },
  escrowNoteText: { flex: 1, fontSize: 11.5, color: '#7C3A1A', lineHeight: 17 },
  filterBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  filterText: { fontSize: 12.5, fontWeight: '600', color: C.navy },
  empty: { paddingVertical: 40, alignItems: 'center' },
  emptyText: { fontSize: 16, fontWeight: '600', color: C.textMute, marginBottom: 4 },
  emptySub: { fontSize: 13, color: C.textSoft, textAlign: 'center', paddingHorizontal: 16 },
})
