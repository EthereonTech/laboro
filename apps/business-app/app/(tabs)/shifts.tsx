import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native'
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
}

export default function ShiftsScreen() {
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['my-shifts'],
    queryFn: () => api.get<Shift[]>('/businesses/me/shifts'),
  })

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.header}>
        <Text style={s.title}>Minhas Vagas</Text>
        <TouchableOpacity style={s.fab} onPress={() => router.push('/shifts/create')}>
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 60 }} color="#065F46" size="large" />
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={(s) => s.id}
          contentContainerStyle={{ padding: 16, gap: 10 }}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#065F46" />}
          ListEmptyComponent={
            <View style={s.empty}>
              <Text style={s.emptyIcon}>📋</Text>
              <Text style={s.emptyText}>Nenhuma vaga criada ainda</Text>
              <TouchableOpacity style={s.emptyBtn} onPress={() => router.push('/shifts/create')}>
                <Text style={s.emptyBtnText}>Criar primeira vaga →</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => {
            const st = shiftStatusLabel(item.status)
            return (
              <TouchableOpacity style={c.card} onPress={() => router.push(`/shifts/${item.id}`)}>
                <View style={c.row}>
                  <View style={[c.dot, { backgroundColor: st.color }]} />
                  <Text style={[c.status, { color: st.color }]}>{st.label}</Text>
                  {item.is_urgent && <Text style={c.urgent}>⚡ Urgente</Text>}
                  <View style={{ flex: 1 }} />
                  <Text style={c.value}>{formatCurrency(item.total_value)}</Text>
                </View>
                <Text style={c.specialty}>{specialtyLabel(item.specialty)}</Text>
                <Text style={c.datetime}>{formatDateTime(item.starts_at)} · {item.slots} vaga{item.slots !== 1 ? 's' : ''}</Text>
              </TouchableOpacity>
            )
          }}
        />
      )}
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16 },
  title: { fontSize: 22, fontWeight: '800', color: '#111827' },
  fab: { backgroundColor: '#065F46', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 17, fontWeight: '600', color: '#374151', marginBottom: 16 },
  emptyBtn: { backgroundColor: '#065F46', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
  emptyBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
})

const c = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 14, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  status: { fontSize: 12, fontWeight: '700' },
  urgent: { fontSize: 12, color: '#92400E', backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  value: { fontSize: 17, fontWeight: '800', color: '#111827' },
  specialty: { fontSize: 15, fontWeight: '600', color: '#374151', marginBottom: 4 },
  datetime: { fontSize: 13, color: '#9CA3AF' },
})
