import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Image } from 'react-native'
import { router } from 'expo-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Svg, Path } from 'react-native-svg'
import { api } from '../../lib/api'
import { useAuthStore } from '../../store/auth'
import { C, ICON_PATHS } from '../../lib/theme'
import { specialtyLabel } from '../../lib/format'

// ── Types ──────────────────────────────────────────────────────────────────
type WorkerProfile = {
  id: string
  score: number
  level: 'BEGINNER' | 'VERIFIED' | 'TOP_PRO'
  total_shifts: number
  on_time_rate: number
  pix_key: string | null
  pix_key_type: string | null
  specialties: { specialty: string; hours?: number }[]
  user: {
    full_name: string
    phone: string
    photo_url: string | null
    created_at: string
  }
}

// ── Icon ───────────────────────────────────────────────────────────────────
function Icon({ d, size = 18, stroke = 'currentColor', sw = 1.8, fill = 'none' }: {
  d: string; size?: number; stroke?: string; sw?: number; fill?: string
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={fill}>
      <Path d={d} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" fill={fill} />
    </Svg>
  )
}

// ── Level config ───────────────────────────────────────────────────────────
const LEVEL = {
  BEGINNER: { label: 'Iniciante',  ring: 'rgba(255,255,255,0.35)', badge: 'rgba(255,255,255,0.15)', text: 'rgba(255,255,255,0.75)' },
  VERIFIED: { label: 'Verificado', ring: C.jade, badge: 'rgba(0,196,140,0.22)', text: '#7FE6C5' },
  TOP_PRO:  { label: 'Top Pro',    ring: C.orange, badge: C.orange, text: '#fff' },
}

// ── ProfileHeader ──────────────────────────────────────────────────────────
function ProfileHeader({ worker }: { worker: WorkerProfile }) {
  const level = LEVEL[worker.level]
  const initials = worker.user.full_name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()

  const since = new Date(worker.user.created_at).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })

  return (
    <View style={ph.container}>
      <View style={ph.glowTR} pointerEvents="none" />
      <View style={ph.glowBL} pointerEvents="none" />

      <View style={{ zIndex: 1 }}>
        {/* Top action row */}
        <View style={ph.topRow}>
          <Text style={ph.pageLabel}>Meu perfil</Text>
          <View style={ph.actionBtns}>
            {[ICON_PATHS.qr, ICON_PATHS.settings, ICON_PATHS.edit].map((d, i) => (
              <TouchableOpacity
                key={i}
                style={ph.iconBtn}
                onPress={i === 2 ? () => router.push('/profile/edit') : undefined}
                activeOpacity={0.7}
              >
                <Icon d={d} size={15} stroke="#fff" sw={2} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Identity */}
        <View style={ph.identity}>
          {/* Avatar with level ring */}
          <View style={[ph.ring, { borderColor: level.ring }]}>
            {worker.user.photo_url ? (
              <Image source={{ uri: worker.user.photo_url }} style={ph.avatarImg} />
            ) : (
              <View style={ph.avatarPlaceholder}>
                <Text style={ph.avatarInitials}>{initials}</Text>
              </View>
            )}
            {/* Corner check badge */}
            <View style={[ph.cornerBadge, { backgroundColor: worker.level === 'TOP_PRO' ? C.orange : C.jade }]}>
              <Icon d={ICON_PATHS.check} size={11} stroke="#fff" sw={3} />
            </View>
          </View>

          <Text style={ph.name}>{worker.user.full_name}</Text>

          {/* Level badge */}
          <View style={[ph.levelBadge, { backgroundColor: level.badge, borderColor: `${level.ring}55` }]}>
            <Icon d={ICON_PATHS.check} size={12} stroke={level.text} sw={3} />
            <Text style={[ph.levelText, { color: level.text }]}>Trabalhador {level.label}</Text>
          </View>

          {/* Specialty chips */}
          <View style={ph.chipsRow}>
            {worker.specialties.slice(0, 3).map((sp, i) => (
              <View key={i} style={ph.chip}>
                <Text style={ph.chipText}>{specialtyLabel(sp.specialty)}</Text>
                {sp.hours != null && <Text style={ph.chipHours}>{sp.hours}h</Text>}
              </View>
            ))}
          </View>

          {/* Location */}
          <View style={ph.location}>
            <Icon d={ICON_PATHS.home} size={13} stroke="rgba(255,255,255,0.6)" sw={1.8} />
            <Text style={ph.locationText}>Pato Branco · PR · membro desde {since}</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

const ph = StyleSheet.create({
  container: {
    backgroundColor: C.navy, paddingTop: 12, paddingBottom: 56,
    paddingHorizontal: 20, overflow: 'hidden', position: 'relative',
  },
  glowTR: {
    position: 'absolute', top: -120, right: -80, width: 320, height: 320,
    borderRadius: 160, backgroundColor: 'rgba(0,196,140,0.16)',
  },
  glowBL: {
    position: 'absolute', bottom: -200, left: -160, width: 420, height: 420,
    borderRadius: 210, backgroundColor: 'rgba(27,63,160,0.5)',
  },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  pageLabel: { fontSize: 11.5, fontWeight: '700', color: 'rgba(255,255,255,0.55)', letterSpacing: 0.6, textTransform: 'uppercase' },
  actionBtns: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 36, height: 36, borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center', justifyContent: 'center',
  },
  identity: { alignItems: 'center' },
  ring: {
    width: 114, height: 114, borderRadius: 57,
    borderWidth: 3, padding: 4,
    alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  avatarImg: { width: 98, height: 98, borderRadius: 49 },
  avatarPlaceholder: {
    width: 98, height: 98, borderRadius: 49,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarInitials: { fontSize: 38, fontWeight: '700', color: '#fff', letterSpacing: -1 },
  cornerBadge: {
    position: 'absolute', bottom: 2, right: 2,
    width: 28, height: 28, borderRadius: 14,
    borderWidth: 3, borderColor: C.navy,
    alignItems: 'center', justifyContent: 'center',
  },
  name: { fontSize: 26, fontWeight: '800', color: '#fff', letterSpacing: -0.8, marginTop: 14, textAlign: 'center' },
  levelBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderRadius: 999, borderWidth: 1,
    paddingHorizontal: 12, paddingVertical: 5, marginTop: 10,
  },
  levelText: { fontSize: 12, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase' },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginTop: 14, paddingHorizontal: 10 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999,
  },
  chipText: { fontSize: 12, fontWeight: '600', color: '#fff', letterSpacing: -0.1 },
  chipHours: { fontSize: 11, color: 'rgba(255,255,255,0.55)' },
  location: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14 },
  locationText: { fontSize: 12.5, color: 'rgba(255,255,255,0.6)' },
})

// ── StatCards ──────────────────────────────────────────────────────────────
function StatCards({ score, totalShifts, onTimeRate }: { score: number; totalShifts: number; onTimeRate: number }) {
  const stats = [
    { value: Number(score).toFixed(1).replace('.', ','), label: 'Nota média', icon: ICON_PATHS.star, color: '#F5B400', fill: '#F5B400' },
    { value: String(totalShifts), label: 'Turnos', icon: ICON_PATHS.bolt, color: C.navy, fill: 'none' },
    { value: `${Number(onTimeRate).toFixed(0)}%`, label: 'Pontualidade', icon: ICON_PATHS.clock, color: C.jadeDeep, fill: 'none' },
  ]
  return (
    <View style={sc.row}>
      {stats.map((st, i) => (
        <View key={i} style={sc.card}>
          <View style={[sc.iconWrap, { backgroundColor: `${st.color}1A` }]}>
            <Icon d={st.icon} size={15} stroke={st.color} sw={2} fill={st.fill} />
          </View>
          <Text style={sc.value}>{st.value}</Text>
          <Text style={sc.label}>{st.label}</Text>
        </View>
      ))}
    </View>
  )
}
const sc = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10, paddingHorizontal: 20 },
  card: { flex: 1, backgroundColor: C.surface, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: C.line },
  iconWrap: { width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  value: { fontSize: 24, fontWeight: '800', color: C.text, letterSpacing: -0.8, lineHeight: 28 },
  label: { fontSize: 11.5, fontWeight: '500', color: C.textMute, marginTop: 4 },
})

// ── TopProCard ─────────────────────────────────────────────────────────────
function TopProCard({ totalShifts }: { totalShifts: number }) {
  const milestones = [0, 10, 30]
  const labels = ['Iniciante', 'Verificado', 'Top Pro']
  const max = 30
  const current = Math.min(totalShifts, max)
  const pct = Math.floor((current / max) * 100)
  const remaining = max - current

  if (totalShifts >= max) return null

  return (
    <View style={tp.card}>
      <View style={tp.glow} pointerEvents="none" />
      <View style={{ zIndex: 1 }}>
        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
          <View style={tp.trophyWrap}>
            <Icon d={ICON_PATHS.trophy} size={20} stroke="#fff" sw={2} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={tp.nextLabel}>Próximo nível</Text>
            <Text style={tp.nextTitle}>
              Top Pro em <Text style={{ color: C.orange }}>{remaining} turnos</Text>
            </Text>
          </View>
        </View>

        {/* Progress bar */}
        <View style={tp.trackWrap}>
          <View style={tp.track}>
            <View style={[tp.fill, { width: `${pct}%` as any }]} />
            {milestones.map((m, i) => {
              const mp = Math.floor((m / max) * 100)
              const reached = current >= m
              return (
                <View
                  key={i}
                  style={[tp.dot, reached && tp.dotReached, {
                    position: 'absolute',
                    left: `${mp}%` as any,
                    transform: [{ translateX: -7 }],
                    top: -3,
                  }]}
                />
              )
            })}
          </View>
          <View style={tp.milestoneLabels}>
            {labels.map((l, i) => (
              <View key={i} style={{ alignItems: i === 0 ? 'flex-start' : i === 2 ? 'flex-end' : 'center', flex: 1 }}>
                <Text style={[tp.mLabel, { color: milestones[i] <= current ? C.text : C.textSoft }]}>{l}</Text>
                <Text style={tp.mSub}>{milestones[i]} turnos</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={tp.note}>
          <Text style={tp.noteText}>
            <Text style={{ color: C.text, fontWeight: '700' }}>Top Pro</Text>
            {' '}dá prioridade nas vagas, taxa reduzida e perfil em destaque.
          </Text>
        </View>
      </View>
    </View>
  )
}
const tp = StyleSheet.create({
  card: {
    marginHorizontal: 20, backgroundColor: C.surface, borderRadius: 18, padding: 18,
    borderWidth: 1, borderColor: C.line, overflow: 'hidden', position: 'relative',
  },
  glow: {
    position: 'absolute', top: -40, right: -30, width: 160, height: 160,
    borderRadius: 80, backgroundColor: 'rgba(255,107,53,0.08)',
  },
  trophyWrap: {
    width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
    backgroundColor: C.orange,
    shadowColor: C.orange, shadowOpacity: 0.35, shadowRadius: 10, shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  nextLabel: { fontSize: 11.5, fontWeight: '700', color: C.orange, letterSpacing: 0.6, textTransform: 'uppercase' },
  nextTitle: { fontSize: 18, fontWeight: '700', color: C.text, letterSpacing: -0.4, marginTop: 2 },
  trackWrap: { marginTop: 18 },
  track: {
    height: 8, borderRadius: 4, backgroundColor: C.surface3,
    overflow: 'visible', position: 'relative',
  },
  fill: {
    height: '100%' as any, borderRadius: 4,
    backgroundColor: C.jade,
  },
  dot: {
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: C.surface, borderWidth: 2, borderColor: C.line,
  },
  dotReached: { backgroundColor: C.jade, borderColor: '#fff', width: 14, height: 14 },
  milestoneLabels: { flexDirection: 'row', marginTop: 12 },
  mLabel: { fontSize: 11, fontWeight: '700' },
  mSub: { fontSize: 10, color: C.textSoft, marginTop: 1 },
  note: { backgroundColor: C.surface2, borderRadius: 11, padding: 12, marginTop: 14 },
  noteText: { fontSize: 12, color: C.textMute, lineHeight: 18 },
})

// ── Badges (Conquistas) ────────────────────────────────────────────────────
type Badge = { label: string; sub: string; color: string; icon: string; minShifts?: number; minOnTime?: number }
const BADGES: Badge[] = [
  { label: 'Bem-vindo', sub: '1º turno', color: '#7C5CFF', icon: ICON_PATHS.flame, minShifts: 1 },
  { label: 'Decadário', sub: '10 turnos', color: '#F5B400', icon: ICON_PATHS.bolt, minShifts: 10 },
  { label: 'Pontual', sub: '95% pontualidade', color: C.jadeDeep, icon: ICON_PATHS.clock, minOnTime: 95 },
  { label: 'Estrela', sub: '15× 5,0', color: C.orange, icon: ICON_PATHS.star, minShifts: 15 },
  { label: 'Coruja', sub: '5 turnos noturnos', color: C.navyLight, icon: ICON_PATHS.eye, minShifts: 20 },
  { label: 'Fiel', sub: '5× no mesmo lugar', color: '#C2511A', icon: ICON_PATHS.users, minShifts: 25 },
]

function BadgeItem({ badge, unlocked }: { badge: Badge; unlocked: boolean }) {
  return (
    <View style={{ alignItems: 'center', gap: 6 }}>
      <View style={[bg.icon, { backgroundColor: unlocked ? badge.color : C.surface3, opacity: unlocked ? 1 : 0.5 }]}>
        <Icon d={badge.icon} size={22} stroke={unlocked ? '#fff' : C.textMute} sw={2} fill={unlocked ? 'none' : 'none'} />
        {!unlocked && (
          <View style={StyleSheet.absoluteFillObject}>
            <View style={bg.lockOverlay}>
              <Icon d={ICON_PATHS.lock} size={16} stroke={C.textMute} sw={2} />
            </View>
          </View>
        )}
      </View>
      <Text style={[bg.label, { color: unlocked ? C.text : C.textSoft }]}>{badge.label}</Text>
      <Text style={bg.sub}>{badge.sub}</Text>
    </View>
  )
}
const bg = StyleSheet.create({
  icon: {
    width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center',
  },
  lockOverlay: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(248,249,252,0.6)', borderRadius: 16,
  },
  label: { fontSize: 11.5, fontWeight: '700', textAlign: 'center' },
  sub: { fontSize: 10, color: C.textSoft, textAlign: 'center', marginTop: -2 },
})

function Conquistas({ totalShifts, onTimeRate }: { totalShifts: number; onTimeRate: number }) {
  return (
    <View style={con.wrapper}>
      <View style={con.titleRow}>
        <Text style={con.title}>Conquistas</Text>
        <Text style={con.count}>
          {BADGES.filter(b =>
            (b.minShifts == null || totalShifts >= b.minShifts) &&
            (b.minOnTime == null || onTimeRate >= b.minOnTime)
          ).length} de {BADGES.length}
        </Text>
      </View>
      <View style={con.grid}>
        {BADGES.map((b, i) => {
          const unlocked = (!b.minShifts || totalShifts >= b.minShifts) && (!b.minOnTime || onTimeRate >= b.minOnTime)
          return <BadgeItem key={i} badge={b} unlocked={unlocked} />
        })}
      </View>
    </View>
  )
}
const con = StyleSheet.create({
  wrapper: { paddingHorizontal: 20 },
  titleRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 },
  title: { fontSize: 18, fontWeight: '700', color: C.text, letterSpacing: -0.4 },
  count: { fontSize: 12, fontWeight: '600', color: C.textMute },
  grid: {
    backgroundColor: C.surface, borderRadius: 18, padding: 16,
    borderWidth: 1, borderColor: C.line,
    flexDirection: 'row', flexWrap: 'wrap', gap: 16,
    justifyContent: 'space-around',
  },
})

// ── Timeline ───────────────────────────────────────────────────────────────
type CompletedShift = {
  id: string
  shift: {
    specialty: string
    starts_at: string
    ends_at: string
    business: { trade_name: string }
  }
  worker_amount?: number
  rating_received?: number | null
}

const COMPANY_COLORS = ['#1B3FA0', '#FF6B35', '#00A372', '#7C2D12', '#A67C00', '#5B21B6', '#0369A1']
function companyColor(name: string) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffffff
  return COMPANY_COLORS[Math.abs(h) % COMPANY_COLORS.length]
}

function TimelineRow({ item, last }: { item: CompletedShift; last: boolean }) {
  const color = companyColor(item.shift.business.trade_name)
  const date = new Date(item.shift.starts_at).toLocaleDateString('pt-BR', {
    weekday: 'short', day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit',
  })
  const val = (item.worker_amount ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const rating = item.rating_received

  return (
    <View style={{ flexDirection: 'row', gap: 12 }}>
      {/* Connector */}
      <View style={{ width: 24, alignItems: 'center', paddingTop: 14 }}>
        <View style={[tl.dot, { borderColor: color }]} />
        {!last && <View style={tl.line} />}
      </View>
      {/* Card */}
      <View style={[tl.card, { flex: 1, marginBottom: 12 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
          <View style={{ flex: 1 }}>
            <Text style={tl.company} numberOfLines={1}>{item.shift.business.trade_name}</Text>
            <Text style={tl.role} numberOfLines={1}>{specialtyLabel(item.shift.specialty)}</Text>
            <Text style={tl.date}>{date}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            {rating != null && (
              <View style={tl.ratingBadge}>
                <Svg width={10} height={10} viewBox="0 0 24 24" fill="#F5B400">
                  <Path d={ICON_PATHS.star} stroke="#F5B400" strokeWidth={1.5} fill="#F5B400" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
                <Text style={tl.ratingText}>{rating.toFixed(1).replace('.', ',')}</Text>
              </View>
            )}
            <Text style={tl.value}>R$ {val}</Text>
          </View>
        </View>
      </View>
    </View>
  )
}
const tl = StyleSheet.create({
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: C.surface, borderWidth: 2 },
  line: { flex: 1, width: 2, backgroundColor: C.lineSoft, marginTop: 4 },
  card: { backgroundColor: C.surface, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: C.line },
  company: { fontSize: 11.5, fontWeight: '600', color: C.textMute },
  role: { fontSize: 15, fontWeight: '700', color: C.text, letterSpacing: -0.3, marginTop: 2 },
  date: { fontSize: 11.5, color: C.textSoft, marginTop: 3 },
  ratingBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: '#FFFBE6', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 7,
  },
  ratingText: { fontSize: 11.5, fontWeight: '700', color: '#7C5C00' },
  value: { fontSize: 15, fontWeight: '800', color: C.jadeDeep, letterSpacing: -0.3, marginTop: 4 },
})

// ── Settings menu ──────────────────────────────────────────────────────────
function MenuItem({ icon, label, onPress, destructive = false }: {
  icon: string; label: string; onPress: () => void; destructive?: boolean
}) {
  return (
    <TouchableOpacity style={mi.row} onPress={onPress} activeOpacity={0.7}>
      <View style={[mi.iconWrap, { backgroundColor: destructive ? '#FEE2E2' : C.surface3 }]}>
        <Icon d={icon} size={16} stroke={destructive ? '#DC2626' : C.textMute} sw={2} />
      </View>
      <Text style={[mi.label, destructive && { color: '#DC2626' }]}>{label}</Text>
      <Icon d={ICON_PATHS.chevR} size={16} stroke={C.line} sw={2} />
    </TouchableOpacity>
  )
}
const mi = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.lineSoft },
  iconWrap: { width: 32, height: 32, borderRadius: 9, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  label: { flex: 1, fontSize: 15, color: C.text, fontWeight: '500' },
})

// ── Main Screen ────────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const { logout } = useAuthStore()
  const queryClient = useQueryClient()

  const { data: worker, isLoading } = useQuery({
    queryKey: ['my-profile'],
    queryFn: () => api.get<WorkerProfile>('/workers/me'),
  })

  const { data: applications } = useQuery({
    queryKey: ['my-applications'],
    queryFn: () => api.get<CompletedShift[]>('/workers/me/applications'),
  })

  const completedShifts = ((applications as any[]) ?? []).filter((a: any) => a.status === 'COMPLETED').slice(0, 5) as CompletedShift[]

  async function handleLogout() {
    Alert.alert('Sair', 'Deseja encerrar sua sessão?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair', style: 'destructive',
        onPress: async () => {
          await logout()
          queryClient.clear()
          router.replace('/(auth)/phone')
        },
      },
    ])
  }

  async function handleDeleteAccount() {
    Alert.alert(
      'Excluir conta',
      'Seus dados pessoais serão anonimizados (LGPD). Histórico financeiro permanece por obrigação legal. Confirma?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir', style: 'destructive',
          onPress: async () => {
            await api.delete('/users/me')
            await logout()
            queryClient.clear()
            router.replace('/(auth)/phone')
          },
        },
      ],
    )
  }

  if (isLoading) {
    return (
      <SafeAreaView style={s.root} edges={['top']}>
        <ActivityIndicator style={{ marginTop: 80 }} color={C.navy} size="large" />
      </SafeAreaView>
    )
  }

  if (!worker) return null

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ProfileHeader worker={worker} />

        {/* Content panel */}
        <View style={s.panel}>
          <StatCards
            score={worker.score}
            totalShifts={worker.total_shifts}
            onTimeRate={worker.on_time_rate}
          />

          <TopProCard totalShifts={worker.total_shifts} />

          <Conquistas totalShifts={worker.total_shifts} onTimeRate={Number(worker.on_time_rate)} />

          {/* History timeline */}
          {completedShifts.length > 0 && (
            <View style={s.section}>
              <View style={s.sectionTitleRow}>
                <Text style={s.sectionTitle}>Histórico</Text>
                <TouchableOpacity onPress={() => router.push('/(tabs)/applications')} activeOpacity={0.8}>
                  <Text style={s.sectionLink}>Ver tudo ({worker.total_shifts})</Text>
                </TouchableOpacity>
              </View>
              {completedShifts.map((item, i) => (
                <TimelineRow key={item.id} item={item} last={i === completedShifts.length - 1} />
              ))}
            </View>
          )}

          {/* Settings */}
          <View style={s.settingsCard}>
            <Text style={s.settingsTitle}>Conta</Text>
            <MenuItem icon={ICON_PATHS.edit} label="Editar perfil" onPress={() => router.push('/profile/edit')} />
            <MenuItem icon={ICON_PATHS.bell} label="Notificações" onPress={() => router.push('/profile/notifications')} />
            <MenuItem icon={ICON_PATHS.shield} label="Privacidade" onPress={() => {}} />
            <MenuItem icon={ICON_PATHS.arrowR} label="Sair" onPress={handleLogout} destructive />
          </View>

          <TouchableOpacity style={s.deleteBtn} onPress={handleDeleteAccount}>
            <Text style={s.deleteBtnText}>Excluir minha conta (LGPD)</Text>
          </TouchableOpacity>

          <Text style={s.version}>Laboro v1.0.0 · Ethereon Tech</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.surface2 },
  panel: {
    marginTop: -28, backgroundColor: C.surface2,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingTop: 22, zIndex: 2,
    gap: 22, paddingBottom: 40,
  },
  section: { paddingHorizontal: 20 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: C.text, letterSpacing: -0.4 },
  sectionLink: { fontSize: 12.5, fontWeight: '600', color: C.navy },
  settingsCard: {
    marginHorizontal: 20, backgroundColor: C.surface, borderRadius: 18,
    padding: 16, borderWidth: 1, borderColor: C.line,
  },
  settingsTitle: {
    fontSize: 11.5, fontWeight: '700', color: C.textSoft,
    letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 8,
  },
  deleteBtn: { alignItems: 'center', paddingVertical: 12 },
  deleteBtnText: { fontSize: 13, fontWeight: '600', color: '#DC2626' },
  version: { textAlign: 'center', fontSize: 12, color: C.textSoft },
})
