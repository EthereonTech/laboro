import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, ActivityIndicator,
} from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Svg, Path } from 'react-native-svg'
import { api } from '../../lib/api'
import { C, ICON_PATHS } from '../../lib/theme'
import { specialtyLabel, formatDate } from '../../lib/format'

type EscrowRecord = {
  id: string
  gross_amount: number
  laboro_fee: number
  worker_amount: number
  status: string
  created_at: string
  shift: {
    specialty: string
    starts_at: string
    slots: number
  }
}

function Icon({ d, size = 18, stroke = C.text, sw = 1.8 }: { d: string; size?: number; stroke?: string; sw?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d={d} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  )
}

function ChargeStatus({ status }: { status: string }) {
  const map: Record<string, { bg: string; fg: string; icon: string; label: string }> = {
    RESERVED:  { bg: '#FFF1E9', fg: '#C2511A', icon: ICON_PATHS.lock,  label: 'Retida' },
    CONFIRMED: { bg: '#FFF1E9', fg: '#C2511A', icon: ICON_PATHS.lock,  label: 'Retida' },
    RELEASED:  { bg: C.jadeSoft, fg: C.jadeDeep, icon: ICON_PATHS.check, label: 'Cobrada' },
    REFUNDED:  { bg: C.surface3, fg: C.textMute, icon: ICON_PATHS.x,   label: 'Estornada' },
    FAILED:    { bg: '#FEE2E2', fg: '#DC2626', icon: ICON_PATHS.warn,  label: 'Falhou' },
  }
  const m = map[status] ?? map.CONFIRMED
  return (
    <View style={[cs.wrap, { backgroundColor: m.bg }]}>
      <Icon d={m.icon} size={10} stroke={m.fg} sw={2.4} />
      <Text style={[cs.text, { color: m.fg }]}>{m.label}</Text>
    </View>
  )
}

const cs = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  text: { fontSize: 10.5, fontWeight: '700', letterSpacing: 0.4, textTransform: 'uppercase' },
})

function fmtN(n: number) {
  return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function ChargeRow({ record }: { record: EscrowRecord }) {
  const crossed = record.status === 'REFUNDED'
  const total = record.gross_amount + record.laboro_fee
  return (
    <View style={row.wrap}>
      <View style={row.top}>
        <View style={{ flex: 1 }}>
          <Text style={row.date}>{formatDate(record.shift.starts_at)} · {record.shift.slots} trabalhador{record.shift.slots > 1 ? 'es' : ''}</Text>
          <Text style={row.role}>{specialtyLabel(record.shift.specialty)}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <ChargeStatus status={record.status} />
          <Text style={[row.total, crossed && row.totalCrossed]}>R$ {fmtN(total)}</Text>
        </View>
      </View>
      <View style={row.breakdown}>
        <Text style={row.breakText}>Diárias: R$ {fmtN(record.gross_amount)}</Text>
        <Text style={row.breakText}>+ Laboro 18%: R$ {fmtN(record.laboro_fee)}</Text>
      </View>
    </View>
  )
}

const row = StyleSheet.create({
  wrap: { padding: 14, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: C.lineSoft },
  top: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  date: { fontSize: 11, fontWeight: '600', color: C.textMute, letterSpacing: 0.2 },
  role: { fontSize: 15, fontWeight: '700', color: C.text, letterSpacing: -0.3, marginTop: 1 },
  total: { fontSize: 16, fontWeight: '800', color: C.text, letterSpacing: -0.3, marginTop: 5 },
  totalCrossed: { textDecorationLine: 'line-through', color: C.textSoft },
  breakdown: { marginTop: 8, paddingHorizontal: 10, paddingVertical: 8, backgroundColor: C.surface2, borderRadius: 9, flexDirection: 'row', justifyContent: 'space-between' },
  breakText: { fontSize: 11.5, color: C.textMute },
})

function monthLabel(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
}

export default function FinanceiroScreen() {
  const insets = useSafeAreaInsets()

  const { data: records, isLoading, refetch, isRefetching } = useQuery<EscrowRecord[]>({
    queryKey: ['business-payments'],
    queryFn: () => api.get('/businesses/me/payments'),
  })

  const totalSpent = records?.reduce((acc, r) => r.status !== 'REFUNDED' ? acc + r.gross_amount + r.laboro_fee : acc, 0) ?? 0
  const inEscrow = records?.filter(r => r.status === 'RESERVED' || r.status === 'CONFIRMED').reduce((acc, r) => acc + r.gross_amount + r.laboro_fee, 0) ?? 0
  const totalFee = records?.reduce((acc, r) => r.status !== 'REFUNDED' ? acc + r.laboro_fee : acc, 0) ?? 0
  const shiftCount = records?.filter(r => r.status !== 'REFUNDED').length ?? 0

  const byMonth = (records ?? []).reduce<Record<string, EscrowRecord[]>>((acc, r) => {
    const key = monthLabel(r.shift.starts_at)
    if (!acc[key]) acc[key] = []
    acc[key].push(r)
    return acc
  }, {})

  const months = Object.entries(byMonth)

  return (
    <View style={{ flex: 1, backgroundColor: C.surface2 }}>
      <View style={[fin.header, { paddingTop: insets.top + 16 }]}>
        <View style={{ position: 'absolute', top: -100, right: -60, width: 280, height: 280, borderRadius: 140, backgroundColor: 'rgba(0,196,140,0.12)' }} />
        <View style={{ position: 'relative', zIndex: 1 }}>
          <Text style={fin.periodLabel}>Gasto acumulado</Text>
          <Text style={fin.total}>R$ {fmtN(totalSpent)}</Text>
          <View style={fin.kpiRow}>
            <View style={fin.kpi}>
              <Text style={fin.kpiLabel}>Turnos</Text>
              <Text style={fin.kpiValue}>{shiftCount}</Text>
            </View>
            <View style={fin.kpi}>
              <Text style={fin.kpiLabel}>Em escrow</Text>
              <Text style={[fin.kpiValue, { color: '#FFB89A', fontSize: 14 }]}>R$ {fmtN(inEscrow)}</Text>
            </View>
            <View style={fin.kpi}>
              <Text style={fin.kpiLabel}>Comissão</Text>
              <Text style={[fin.kpiValue, { fontSize: 14 }]}>R$ {fmtN(totalFee)}</Text>
            </View>
          </View>
        </View>
      </View>

      <FlatList
        data={months}
        keyExtractor={([m]) => m}
        style={{ marginTop: -28, borderTopLeftRadius: 28, borderTopRightRadius: 28, backgroundColor: C.surface2, zIndex: 2 }}
        contentContainerStyle={{ paddingTop: 18, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={C.navy} />}
        ListHeaderComponent={
          <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 20, paddingBottom: 4 }}>
            <TouchableOpacity style={act.pill}>
              <Icon d={ICON_PATHS.filter} size={13} stroke={C.navy} sw={2.2} />
              <Text style={act.pillText}>Filtros</Text>
            </TouchableOpacity>
            <TouchableOpacity style={act.pill}>
              <Icon d={ICON_PATHS.doc} size={13} stroke={C.navy} sw={2.2} />
              <Text style={act.pillText}>NFs</Text>
            </TouchableOpacity>
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator color={C.navy} style={{ marginTop: 60 }} />
          ) : (
            <View style={{ alignItems: 'center', paddingTop: 60 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: C.text }}>Nenhuma cobrança</Text>
              <Text style={{ fontSize: 14, color: C.textMute, marginTop: 6 }}>Publique vagas para começar</Text>
            </View>
          )
        }
        renderItem={({ item: [month, recs] }) => {
          const monthTotal = recs.reduce((acc, r) => r.status !== 'REFUNDED' ? acc + r.gross_amount + r.laboro_fee : acc, 0)
          return (
            <View>
              <View style={fin.monthRow}>
                <Text style={fin.monthLabel}>{month.charAt(0).toUpperCase() + month.slice(1)}</Text>
                <Text style={fin.monthTotal}>R$ {fmtN(monthTotal)}</Text>
              </View>
              <View style={fin.group}>
                {recs.map(r => <ChargeRow key={r.id} record={r} />)}
                <View style={fin.groupFooter}>
                  <Text style={fin.groupFooterLabel}>Total no mês</Text>
                  <Text style={fin.groupFooterValue}>R$ {fmtN(monthTotal)}</Text>
                </View>
              </View>
            </View>
          )
        }}
      />
    </View>
  )
}

const fin = StyleSheet.create({
  header: { backgroundColor: C.navy, paddingHorizontal: 20, paddingBottom: 60, overflow: 'hidden', position: 'relative' },
  periodLabel: { fontSize: 11.5, fontWeight: '700', color: 'rgba(255,255,255,0.55)', letterSpacing: 0.6, textTransform: 'uppercase' },
  total: { fontSize: 38, fontWeight: '800', color: '#fff', letterSpacing: -1.3, marginTop: 4, lineHeight: 42 },
  kpiRow: { flexDirection: 'row', gap: 10, marginTop: 18 },
  kpi: { flex: 1, backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)', borderRadius: 12, padding: 12 },
  kpiLabel: { fontSize: 10.5, fontWeight: '600', color: 'rgba(255,255,255,0.55)', letterSpacing: 0.3, textTransform: 'uppercase' },
  kpiValue: { fontSize: 16, fontWeight: '800', color: '#fff', letterSpacing: -0.3, marginTop: 5 },
  monthRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', paddingHorizontal: 24, paddingTop: 20, paddingBottom: 10 },
  monthLabel: { fontSize: 11, fontWeight: '700', color: C.textSoft, letterSpacing: 0.5, textTransform: 'uppercase' },
  monthTotal: { fontSize: 12, fontWeight: '700', color: C.text, letterSpacing: -0.2 },
  group: { marginHorizontal: 20, backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: C.line, overflow: 'hidden' },
  groupFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', backgroundColor: C.surface2, paddingHorizontal: 14, paddingVertical: 12 },
  groupFooterLabel: { fontSize: 12, fontWeight: '600', color: C.textMute },
  groupFooterValue: { fontSize: 17, fontWeight: '800', color: C.text, letterSpacing: -0.3 },
})

const act = StyleSheet.create({
  pill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, borderWidth: 1, borderColor: C.line, backgroundColor: '#fff' },
  pillText: { fontSize: 12.5, fontWeight: '700', color: C.text },
})
