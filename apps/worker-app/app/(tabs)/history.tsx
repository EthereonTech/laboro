import { View, Text, FlatList, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { SafeAreaView } from 'react-native-safe-area-context'
import { api } from '../../lib/api'
import { formatCurrency, formatDate, specialtyLabel } from '../../lib/format'

type PaymentRecord = {
  id: string
  status: string
  worker_amount: number
  released_at: string | null
  created_at: string
  shift: {
    specialty: string
    starts_at: string
    business: { trade_name: string }
  }
}

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  RESERVED: { label: 'Aguardando pagamento', color: '#F59E0B' },
  CONFIRMED: { label: 'Pago — aguardando turno', color: '#3B82F6' },
  RELEASED: { label: 'Liberado ✓', color: '#10B981' },
  REFUNDED: { label: 'Estornado', color: '#EF4444' },
  FAILED: { label: 'Falhou', color: '#EF4444' },
}

export default function HistoryScreen() {
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['payment-history'],
    queryFn: () => api.get<PaymentRecord[]>('/workers/me/payments'),
  })

  const totalReleased = (data ?? [])
    .filter((p) => p.status === 'RELEASED')
    .reduce((sum, p) => sum + Number(p.worker_amount), 0)

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.header}>
        <Text style={s.title}>Histórico</Text>
        {(data?.length ?? 0) > 0 && (
          <View style={s.totalBox}>
            <Text style={s.totalLabel}>Total recebido</Text>
            <Text style={s.totalValue}>{formatCurrency(totalReleased)}</Text>
          </View>
        )}
      </View>

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 60 }} color="#1D4ED8" size="large" />
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={(p) => p.id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#1D4ED8" />}
          ListEmptyComponent={
            <View style={s.empty}>
              <Text style={s.emptyIcon}>💰</Text>
              <Text style={s.emptyText}>Nenhum pagamento ainda</Text>
              <Text style={s.emptySubtext}>Seus pagamentos aparecerão aqui após completar turnos</Text>
            </View>
          }
          renderItem={({ item }) => {
            const st = STATUS_LABEL[item.status] ?? { label: item.status, color: '#9CA3AF' }
            return (
              <View style={c.card}>
                <View style={c.row}>
                  <Text style={c.business}>{item.shift.business.trade_name}</Text>
                  <Text style={[c.amount, item.status === 'RELEASED' && { color: '#10B981' }]}>
                    {formatCurrency(item.worker_amount)}
                  </Text>
                </View>
                <Text style={c.specialty}>{specialtyLabel(item.shift.specialty)}</Text>
                <Text style={c.date}>{formatDate(item.shift.starts_at)}</Text>
                <View style={[c.statusBadge, { backgroundColor: st.color + '20' }]}>
                  <Text style={[c.statusText, { color: st.color }]}>{st.label}</Text>
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
  totalBox: { backgroundColor: '#EFF6FF', borderRadius: 12, padding: 16 },
  totalLabel: { fontSize: 13, color: '#1D4ED8', fontWeight: '600', marginBottom: 2 },
  totalValue: { fontSize: 28, fontWeight: '800', color: '#1D4ED8' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 17, fontWeight: '600', color: '#374151', marginBottom: 4 },
  emptySubtext: { fontSize: 14, color: '#9CA3AF', textAlign: 'center', paddingHorizontal: 32 },
})

const c = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  business: { fontSize: 16, fontWeight: '700', color: '#111827', flex: 1 },
  amount: { fontSize: 18, fontWeight: '800', color: '#111827' },
  specialty: { fontSize: 13, color: '#1D4ED8', fontWeight: '500', marginBottom: 2 },
  date: { fontSize: 13, color: '#9CA3AF', marginBottom: 10 },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: '700' },
})
