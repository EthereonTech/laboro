import { View, Text, FlatList, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { SafeAreaView } from 'react-native-safe-area-context'
import { api } from '../../lib/api'
import { formatCurrency, formatDate, specialtyLabel } from '../../lib/format'

type EscrowRecord = {
  id: string
  status: string
  gross_amount: number
  laboro_fee: number
  worker_amount: number
  created_at: string
  shift: { specialty: string; starts_at: string }
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  RESERVED: { label: 'Aguardando pagamento', color: '#F59E0B' },
  CONFIRMED: { label: 'Pago — turno pendente', color: '#3B82F6' },
  RELEASED: { label: 'Liberado ✓', color: '#10B981' },
  REFUNDED: { label: 'Estornado', color: '#EF4444' },
  FAILED: { label: 'Falhou', color: '#EF4444' },
}

export default function HistoryScreen() {
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['business-payments'],
    queryFn: () => api.get<EscrowRecord[]>('/businesses/me/payments'),
  })

  const totalSpent = (data ?? [])
    .filter((e) => e.status === 'RELEASED')
    .reduce((sum, e) => sum + Number(e.gross_amount), 0)

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.header}>
        <Text style={s.title}>Histórico de Pagamentos</Text>
        {(data?.length ?? 0) > 0 && (
          <View style={s.totalBox}>
            <Text style={s.totalLabel}>Total investido</Text>
            <Text style={s.totalValue}>{formatCurrency(totalSpent)}</Text>
          </View>
        )}
      </View>

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 60 }} color="#065F46" size="large" />
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={(e) => e.id}
          contentContainerStyle={{ padding: 16, gap: 10 }}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#065F46" />}
          ListEmptyComponent={
            <View style={s.empty}>
              <Text style={s.emptyIcon}>💳</Text>
              <Text style={s.emptyText}>Nenhum pagamento ainda</Text>
            </View>
          }
          renderItem={({ item }) => {
            const st = STATUS_MAP[item.status] ?? { label: item.status, color: '#9CA3AF' }
            return (
              <View style={c.card}>
                <View style={c.row}>
                  <Text style={c.specialty}>{specialtyLabel(item.shift.specialty)}</Text>
                  <Text style={c.gross}>{formatCurrency(item.gross_amount)}</Text>
                </View>
                <Text style={c.date}>{formatDate(item.shift.starts_at)}</Text>
                <View style={c.breakdown}>
                  <Text style={c.breakdownText}>Trabalhador: {formatCurrency(item.worker_amount)}</Text>
                  <Text style={c.breakdownText}>Taxa Laboro: {formatCurrency(item.laboro_fee)}</Text>
                </View>
                <View style={[c.badge, { backgroundColor: st.color + '20' }]}>
                  <Text style={[c.badgeText, { color: st.color }]}>{st.label}</Text>
                </View>
              </View>
            )
          }}
        />
      )}
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { paddingHorizontal: 16, paddingVertical: 16 },
  title: { fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 12 },
  totalBox: { backgroundColor: '#ECFDF5', borderRadius: 12, padding: 14 },
  totalLabel: { fontSize: 13, color: '#065F46', fontWeight: '600', marginBottom: 2 },
  totalValue: { fontSize: 26, fontWeight: '800', color: '#065F46' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 17, fontWeight: '600', color: '#374151' },
})

const c = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 14, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  specialty: { fontSize: 16, fontWeight: '700', color: '#111827' },
  gross: { fontSize: 18, fontWeight: '800', color: '#111827' },
  date: { fontSize: 13, color: '#9CA3AF', marginBottom: 8 },
  breakdown: { flexDirection: 'row', gap: 16, marginBottom: 10 },
  breakdownText: { fontSize: 12, color: '#6B7280' },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 12, fontWeight: '700' },
})
