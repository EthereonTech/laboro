import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, ActivityIndicator, ScrollView } from 'react-native'
import { router } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { api } from '../../lib/api'
import { formatCurrency, formatDateTime, shiftStatusLabel, specialtyLabel } from '../../lib/format'

type Shift = {
  id: string
  specialty: string
  starts_at: string
  ends_at: string
  total_value: number
  status: string
  slots: number
  is_urgent: boolean
  _count?: { applications: number }
}

type DashboardData = {
  active_shifts: Shift[]
  pending_applications: number
  monthly_spent: number
  completed_shifts: number
}

export default function DashboardScreen() {
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['business-dashboard'],
    queryFn: () => api.get<DashboardData>('/businesses/me/dashboard'),
  })

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={s.content}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#065F46" />}
      >
        {/* Header */}
        <View style={s.headerRow}>
          <Text style={s.logo}>Laboro</Text>
          <TouchableOpacity style={s.newShiftBtn} onPress={() => router.push('/shifts/create')}>
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={s.newShiftText}>Nova vaga</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <ActivityIndicator style={{ marginTop: 60 }} color="#065F46" size="large" />
        ) : (
          <>
            {/* Stats */}
            <View style={s.statsRow}>
              <StatCard label="Gasto no mês" value={formatCurrency(data?.monthly_spent ?? 0)} icon="💰" />
              <StatCard label="Candidaturas" value={String(data?.pending_applications ?? 0)} icon="👥" suffix="pendentes" />
              <StatCard label="Turnos" value={String(data?.completed_shifts ?? 0)} icon="✅" suffix="concluídos" />
            </View>

            {/* Vagas ativas */}
            <Text style={s.sectionTitle}>Vagas ativas</Text>
            {(data?.active_shifts ?? []).length === 0 ? (
              <View style={s.emptyCard}>
                <Text style={s.emptyIcon}>📋</Text>
                <Text style={s.emptyText}>Nenhuma vaga ativa</Text>
                <TouchableOpacity style={s.emptyBtn} onPress={() => router.push('/shifts/create')}>
                  <Text style={s.emptyBtnText}>Criar primeira vaga</Text>
                </TouchableOpacity>
              </View>
            ) : (
              (data?.active_shifts ?? []).map((shift) => (
                <ActiveShiftCard key={shift.id} shift={shift} />
              ))
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

function StatCard({ label, value, icon, suffix }: { label: string; value: string; icon: string; suffix?: string }) {
  return (
    <View style={sc.box}>
      <Text style={sc.icon}>{icon}</Text>
      <Text style={sc.value}>{value}</Text>
      {suffix && <Text style={sc.suffix}>{suffix}</Text>}
      <Text style={sc.label}>{label}</Text>
    </View>
  )
}

function ActiveShiftCard({ shift }: { shift: Shift }) {
  const st = shiftStatusLabel(shift.status)
  return (
    <TouchableOpacity style={ac.card} onPress={() => router.push(`/shifts/${shift.id}`)}>
      <View style={ac.row}>
        <View style={[ac.statusDot, { backgroundColor: st.color }]} />
        <Text style={[ac.statusText, { color: st.color }]}>{st.label}</Text>
        <View style={{ flex: 1 }} />
        <Text style={ac.value}>{formatCurrency(shift.total_value)}</Text>
      </View>
      <Text style={ac.specialty}>{specialtyLabel(shift.specialty)}</Text>
      <View style={ac.footer}>
        <Text style={ac.datetime}>{formatDateTime(shift.starts_at)}</Text>
        {(shift._count?.applications ?? 0) > 0 && (
          <View style={ac.badge}>
            <Text style={ac.badgeText}>{shift._count?.applications} candidato{shift._count?.applications !== 1 ? 's' : ''}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { padding: 16, paddingBottom: 24 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  logo: { fontSize: 24, fontWeight: '800', color: '#065F46' },
  newShiftBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#065F46', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  newShiftText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#111827', marginBottom: 12 },
  emptyCard: { backgroundColor: '#fff', borderRadius: 16, padding: 32, alignItems: 'center', borderWidth: 1.5, borderColor: '#E5E7EB', borderStyle: 'dashed' },
  emptyIcon: { fontSize: 36, marginBottom: 8 },
  emptyText: { fontSize: 16, color: '#6B7280', marginBottom: 16 },
  emptyBtn: { backgroundColor: '#065F46', borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10 },
  emptyBtnText: { color: '#fff', fontWeight: '700' },
})

const sc = StyleSheet.create({
  box: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 14, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  icon: { fontSize: 22, marginBottom: 4 },
  value: { fontSize: 18, fontWeight: '800', color: '#111827' },
  suffix: { fontSize: 11, color: '#9CA3AF' },
  label: { fontSize: 11, color: '#9CA3AF', marginTop: 2, textAlign: 'center' },
})

const ac = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 12, fontWeight: '700' },
  value: { fontSize: 17, fontWeight: '800', color: '#111827' },
  specialty: { fontSize: 15, fontWeight: '600', color: '#374151', marginBottom: 6 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  datetime: { fontSize: 13, color: '#9CA3AF' },
  badge: { backgroundColor: '#FEF3C7', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 12, color: '#92400E', fontWeight: '600' },
})
