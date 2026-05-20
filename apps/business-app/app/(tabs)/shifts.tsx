import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, ActivityIndicator,
} from 'react-native'
import { router } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Svg, Path } from 'react-native-svg'
import { api } from '../../lib/api'
import { C, ICON_PATHS } from '../../lib/theme'
import { specialtyLabel, formatDate, formatTime, formatCurrency } from '../../lib/format'

type Application = {
  id: string
  status: string
  checkin_at?: string
  checkout_at?: string
  worker: {
    id: string
    score: number
    level: string
    total_shifts: number
    user: { full_name: string; photo_url?: string }
    specialties: { specialty: string }[]
  }
}

type Shift = {
  id: string
  specialty: string
  starts_at: string
  ends_at: string
  total_value: number
  status: string
  slots: number
  is_urgent: boolean
  applications: Application[]
  confirmed_count?: number
}

function Icon({ d, size = 18, stroke = C.text, sw = 1.8 }: { d: string; size?: number; stroke?: string; sw?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d={d} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  )
}

function WorkerAvatar({ name, size = 40 }: { name: string; size?: number }) {
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  const colors = ['#E74C3C','#3498DB','#2ECC71','#9B59B6','#F39C12','#1ABC9C','#E67E22','#E91E63']
  const hue = [...name].reduce((a, c) => a + c.charCodeAt(0), 0) % colors.length
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors[hue], alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: size * 0.36, fontWeight: '700', color: '#fff' }}>{initials}</Text>
    </View>
  )
}

function AppCard({ app, shiftId }: { app: Application; shiftId: string }) {
  const name = app.worker.user.full_name
  const status = app.status
  const statusMap: Record<string, { label: string; bg: string; fg: string }> = {
    PENDING:   { label: 'Aguardando', bg: '#FFF9E6', fg: '#B45309' },
    CONFIRMED: { label: 'Confirmado', bg: C.jadeSoft, fg: C.jadeDeep },
    COMPLETED: { label: 'Concluído',  bg: C.surface3, fg: C.textMute },
    NO_SHOW:   { label: 'No-show',    bg: '#FEE2E2', fg: '#DC2626' },
    CANCELLED: { label: 'Cancelado',  bg: '#FEE2E2', fg: '#DC2626' },
  }
  const s = statusMap[status] ?? statusMap.PENDING

  return (
    <View style={ac.wrap}>
      <WorkerAvatar name={name} />
      <View style={{ flex: 1 }}>
        <Text style={ac.name}>{name}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
          <Svg width={11} height={11} viewBox="0 0 24 24" fill="#F5B400">
            <Path d={ICON_PATHS.star} stroke="#F5B400" strokeWidth={1.5} />
          </Svg>
          <Text style={{ fontSize: 11.5, color: C.text, fontWeight: '700' }}>{Number(app.worker.score).toFixed(1).replace('.', ',')}</Text>
          <Text style={{ fontSize: 11.5, color: C.textMute }}>· {app.worker.total_shifts ?? 0} turnos</Text>
        </View>
      </View>
      <View style={{ alignItems: 'flex-end', gap: 6 }}>
        <View style={[ac.badge, { backgroundColor: s.bg }]}>
          <Text style={[ac.badgeText, { color: s.fg }]}>{s.label}</Text>
        </View>
        {status === 'PENDING' && (
          <TouchableOpacity
            style={ac.confirmBtn}
            onPress={() => router.push(`/shifts/${shiftId}` as any)}
          >
            <Text style={ac.confirmBtnText}>Ver</Text>
            <Icon d={ICON_PATHS.chevR} size={12} stroke="#fff" sw={2.2} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

const ac = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderBottomWidth: 1, borderBottomColor: C.lineSoft, backgroundColor: '#fff' },
  name: { fontSize: 14, fontWeight: '700', color: C.text, letterSpacing: -0.2 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  badgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.4, textTransform: 'uppercase' },
  confirmBtn: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: C.navy, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  confirmBtnText: { fontSize: 11, fontWeight: '700', color: '#fff' },
})

function ShiftOpsCard({ shift }: { shift: Shift }) {
  const confirmed = shift.confirmed_count ?? shift.applications?.filter(a => a.status === 'CONFIRMED').length ?? 0
  const pending = shift.applications?.filter(a => a.status === 'PENDING').length ?? 0

  const statusMap: Record<string, { bg: string; fg: string; dot: string; label: string }> = {
    OPEN:        { bg: '#FFF1E9', fg: '#C2511A', dot: C.orange, label: 'Aberta' },
    FILLED:      { bg: '#E8F3FF', fg: '#1B3FA0', dot: C.navy,   label: 'Preenchida' },
    IN_PROGRESS: { bg: '#E8F8F1', fg: '#00805B', dot: C.jade,   label: 'Em andamento' },
    DONE:        { bg: C.surface3, fg: C.textMute, dot: '#9AA0B7', label: 'Concluída' },
    CANCELLED:   { bg: '#FEE2E2', fg: '#DC2626', dot: '#DC2626', label: 'Cancelada' },
  }
  const sm = statusMap[shift.status] ?? statusMap.OPEN

  return (
    <View style={ops.wrap}>
      {/* Header */}
      <TouchableOpacity
        style={ops.header}
        onPress={() => router.push(`/shifts/${shift.id}` as any)}
        activeOpacity={0.8}
      >
        <View style={[ops.roleIcon, { backgroundColor: C.navy }]}>
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 18 }}>{specialtyLabel(shift.specialty).slice(0, 1)}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={ops.role}>{specialtyLabel(shift.specialty)} · {shift.slots} vagas</Text>
          <Text style={ops.meta}>{formatDate(shift.starts_at)} · {formatTime(shift.starts_at)}–{formatTime(shift.ends_at)} · {formatCurrency(shift.total_value / shift.slots)}/turno</Text>
        </View>
        <View style={[ops.statusBadge, { backgroundColor: sm.bg }]}>
          <View style={[ops.statusDot, { backgroundColor: sm.dot }]} />
          <Text style={[ops.statusText, { color: sm.fg }]}>{sm.label}</Text>
        </View>
      </TouchableOpacity>

      {/* Applications */}
      {shift.applications && shift.applications.length > 0 ? (
        <View>
          <View style={ops.appHeader}>
            <Text style={ops.appHeaderText}>{shift.applications.length} candidato{shift.applications.length > 1 ? 's' : ''}</Text>
            {pending > 0 && (
              <View style={ops.pendingBadge}>
                <Text style={ops.pendingText}>{pending} aguardando</Text>
              </View>
            )}
          </View>
          {shift.applications.slice(0, 3).map(app => (
            <AppCard key={app.id} app={app} shiftId={shift.id} />
          ))}
          {shift.applications.length > 3 && (
            <TouchableOpacity style={ops.seeAll} onPress={() => router.push(`/shifts/${shift.id}` as any)}>
              <Text style={ops.seeAllText}>Ver todos {shift.applications.length} candidatos</Text>
              <Icon d={ICON_PATHS.chevR} size={14} stroke={C.navy} sw={2} />
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <View style={ops.noApps}>
          <Text style={ops.noAppsText}>Nenhum candidato ainda</Text>
        </View>
      )}
    </View>
  )
}

const ops = StyleSheet.create({
  wrap: { backgroundColor: '#fff', borderRadius: 18, borderWidth: 1, borderColor: C.line, overflow: 'hidden', shadowColor: C.navy, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  roleIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  role: { fontSize: 15, fontWeight: '700', color: C.text, letterSpacing: -0.3 },
  meta: { fontSize: 12, color: C.textMute, marginTop: 2 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  statusDot: { width: 5, height: 5, borderRadius: 3 },
  statusText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.4, textTransform: 'uppercase' },
  appHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 8, backgroundColor: C.surface3, borderTopWidth: 1, borderTopColor: C.lineSoft },
  appHeaderText: { fontSize: 12, fontWeight: '700', color: C.textMute, textTransform: 'uppercase', letterSpacing: 0.4 },
  pendingBadge: { backgroundColor: '#FFF9E6', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  pendingText: { fontSize: 10.5, fontWeight: '700', color: '#B45309' },
  seeAll: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, padding: 12, borderTopWidth: 1, borderTopColor: C.lineSoft },
  seeAllText: { fontSize: 13, fontWeight: '700', color: C.navy },
  noApps: { padding: 14, backgroundColor: C.surface3, borderTopWidth: 1, borderTopColor: C.lineSoft, alignItems: 'center' },
  noAppsText: { fontSize: 13, color: C.textMute },
})

export default function ShiftsOpsScreen() {
  const insets = useSafeAreaInsets()

  const { data: shifts, isLoading, refetch, isRefetching } = useQuery<Shift[]>({
    queryKey: ['business-shifts-ops'],
    queryFn: () => api.get('/shifts/my?include=applications'),
  })

  const active = (shifts ?? []).filter(s => ['OPEN', 'FILLED', 'IN_PROGRESS'].includes(s.status))

  return (
    <View style={{ flex: 1, backgroundColor: C.surface2 }}>
      <View style={[hdr.wrap, { paddingTop: insets.top + 16 }]}>
        <Text style={hdr.sub}>Gestão de vagas</Text>
        <Text style={hdr.title}>Operações</Text>
      </View>

      <FlatList
        data={active}
        keyExtractor={s => s.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 100, gap: 14 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={C.navy} />}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator color={C.navy} style={{ marginTop: 60 }} />
          ) : (
            <View style={{ alignItems: 'center', paddingTop: 60 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: C.text }}>Nenhuma vaga ativa</Text>
              <Text style={{ fontSize: 14, color: C.textMute, marginTop: 6 }}>Publique uma vaga na aba Início</Text>
            </View>
          )
        }
        renderItem={({ item }) => <ShiftOpsCard shift={item} />}
      />
    </View>
  )
}

const hdr = StyleSheet.create({
  wrap: {
    paddingHorizontal: 20, paddingBottom: 16,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: C.lineSoft,
  },
  sub: { fontSize: 11.5, fontWeight: '700', color: C.textSoft, letterSpacing: 0.6, textTransform: 'uppercase' },
  title: { fontSize: 22, fontWeight: '800', color: C.text, letterSpacing: -0.6, marginTop: 2 },
})
