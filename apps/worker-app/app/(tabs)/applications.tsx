import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native'
import { router } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { SafeAreaView } from 'react-native-safe-area-context'
import { api } from '../../lib/api'
import { formatDateTime, formatCurrency, specialtyLabel, applicationStatusLabel } from '../../lib/format'

type Application = {
  id: string
  status: string
  checkin_at: string | null
  checkout_at: string | null
  hours_worked: number | null
  shift: {
    id: string
    specialty: string
    starts_at: string
    ends_at: string
    total_value: number
    business: { trade_name: string }
  }
}

const STATUS_COLOR: Record<string, string> = {
  PENDING: '#F59E0B',
  CONFIRMED: '#10B981',
  CANCELLED: '#EF4444',
  NO_SHOW: '#EF4444',
  COMPLETED: '#6B7280',
}

export default function ApplicationsScreen() {
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['my-applications'],
    queryFn: () => api.get<Application[]>('/workers/me/applications'),
  })

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.header}>
        <Text style={s.title}>Minhas Candidaturas</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 60 }} color="#1D4ED8" size="large" />
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={(a) => a.id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#1D4ED8" />}
          ListEmptyComponent={
            <View style={s.empty}>
              <Text style={s.emptyIcon}>📋</Text>
              <Text style={s.emptyText}>Nenhuma candidatura ainda</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)')}>
                <Text style={s.emptyLink}>Ver vagas disponíveis →</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={c.card}
              onPress={() => {
                if (item.status === 'CONFIRMED' && !item.checkout_at) {
                  router.push(`/checkin/${item.shift.id}`)
                } else {
                  router.push(`/shifts/${item.shift.id}`)
                }
              }}
            >
              <View style={c.row}>
                <View style={[c.statusDot, { backgroundColor: STATUS_COLOR[item.status] ?? '#9CA3AF' }]} />
                <Text style={c.statusText}>{applicationStatusLabel(item.status)}</Text>
              </View>
              <Text style={c.business}>{item.shift.business.trade_name}</Text>
              <Text style={c.specialty}>{specialtyLabel(item.shift.specialty)}</Text>
              <Text style={c.date}>{formatDateTime(item.shift.starts_at)}</Text>
              <View style={c.footer}>
                <Text style={c.value}>{formatCurrency(item.shift.total_value)}</Text>
                {item.status === 'CONFIRMED' && !item.checkin_at && (
                  <View style={c.actionBtn}>
                    <Text style={c.actionText}>📍 Fazer check-in</Text>
                  </View>
                )}
                {item.status === 'CONFIRMED' && item.checkin_at && !item.checkout_at && (
                  <View style={[c.actionBtn, { backgroundColor: '#10B981' }]}>
                    <Text style={c.actionText}>✅ Fazer check-out</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { paddingHorizontal: 16, paddingVertical: 16 },
  title: { fontSize: 22, fontWeight: '800', color: '#111827' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 17, fontWeight: '600', color: '#374151', marginBottom: 8 },
  emptyLink: { fontSize: 15, color: '#1D4ED8', fontWeight: '600' },
})

const c = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  business: { fontSize: 17, fontWeight: '700', color: '#111827', marginBottom: 2 },
  specialty: { fontSize: 14, color: '#1D4ED8', fontWeight: '500', marginBottom: 2 },
  date: { fontSize: 13, color: '#9CA3AF', marginBottom: 10 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  value: { fontSize: 18, fontWeight: '800', color: '#111827' },
  actionBtn: { backgroundColor: '#1D4ED8', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  actionText: { color: '#fff', fontSize: 13, fontWeight: '700' },
})
