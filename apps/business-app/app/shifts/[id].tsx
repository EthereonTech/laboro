import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import Toast from 'react-native-toast-message'
import { api } from '../../lib/api'
import { formatCurrency, formatDateTime, formatTime, shiftStatusLabel, specialtyLabel, applicationStatusLabel } from '../../lib/format'

type Application = {
  id: string
  status: string
  worker: {
    id: string
    score: number
    level: string
    total_shifts: number
    user: { full_name: string; photo_url: string | null }
  }
}

type ShiftDetail = {
  id: string
  specialty: string
  starts_at: string
  ends_at: string
  rate_per_hour: number
  total_value: number
  laboro_fee: number
  slots: number
  is_urgent: boolean
  status: string
  instructions: string | null
  applications: Application[]
}

export default function ShiftDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const queryClient = useQueryClient()

  const { data: shift, isLoading } = useQuery({
    queryKey: ['shift-detail', id],
    queryFn: () => api.get<ShiftDetail>(`/shifts/${id}`),
  })

  const confirmMutation = useMutation({
    mutationFn: (workerId: string) => api.post(`/shifts/${id}/confirm/${workerId}`),
    onSuccess: () => {
      Toast.show({ type: 'success', text1: 'Trabalhador confirmado! ✓', text2: 'Um QR Code Pix será gerado em instantes.' })
      queryClient.invalidateQueries({ queryKey: ['shift-detail', id] })
      queryClient.invalidateQueries({ queryKey: ['business-dashboard'] })
    },
    onError: (e: any) => Toast.show({ type: 'error', text1: 'Erro', text2: e.message }),
  })

  const noShowMutation = useMutation({
    mutationFn: (workerId: string) => api.post(`/shifts/${id}/report-noshow/${workerId}`),
    onSuccess: () => {
      Toast.show({ type: 'success', text1: 'No-show registrado', text2: 'Estorno processado automaticamente.' })
      queryClient.invalidateQueries({ queryKey: ['shift-detail', id] })
    },
    onError: (e: any) => Toast.show({ type: 'error', text1: 'Erro', text2: e.message }),
  })

  const cancelMutation = useMutation({
    mutationFn: () => api.post(`/shifts/${id}/cancel`),
    onSuccess: () => {
      Toast.show({ type: 'success', text1: 'Vaga cancelada' })
      queryClient.invalidateQueries({ queryKey: ['my-shifts'] })
      queryClient.invalidateQueries({ queryKey: ['business-dashboard'] })
      router.back()
    },
    onError: (e: any) => Toast.show({ type: 'error', text1: 'Erro', text2: e.message }),
  })

  function confirmWorker(workerId: string, name: string) {
    Alert.alert('Confirmar trabalhador', `Deseja confirmar ${name}? Um Pix será gerado para você pagar o escrow.`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Confirmar', onPress: () => confirmMutation.mutate(workerId) },
    ])
  }

  function reportNoShow(workerId: string, name: string) {
    Alert.alert('Registrar no-show', `${name} não apareceu? O valor será estornado e o trabalhador penalizado.`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Registrar', style: 'destructive', onPress: () => noShowMutation.mutate(workerId) },
    ])
  }

  function cancelShift() {
    Alert.alert('Cancelar vaga', 'Tem certeza? A política de reembolso se aplica se houver trabalhador confirmado.', [
      { text: 'Não', style: 'cancel' },
      { text: 'Cancelar vaga', style: 'destructive', onPress: () => cancelMutation.mutate() },
    ])
  }

  if (isLoading) {
    return <SafeAreaView style={s.container} edges={['top']}><ActivityIndicator style={{ marginTop: 80 }} color="#065F46" size="large" /></SafeAreaView>
  }

  if (!shift) return null

  const hours = (new Date(shift.ends_at).getTime() - new Date(shift.starts_at).getTime()) / 3600000
  const st = shiftStatusLabel(shift.status)
  const pending = shift.applications.filter((a) => a.status === 'PENDING')
  const confirmed = shift.applications.filter((a) => a.status === 'CONFIRMED')
  const completed = shift.applications.filter((a) => a.status === 'COMPLETED')
  const canCancel = ['OPEN', 'FILLED'].includes(shift.status)

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Detalhe da Vaga</Text>
        {canCancel ? (
          <TouchableOpacity onPress={cancelShift}>
            <Text style={s.cancelText}>Cancelar</Text>
          </TouchableOpacity>
        ) : <View style={{ width: 60 }} />}
      </View>

      <ScrollView contentContainerStyle={s.content}>
        {/* Status + Info */}
        <View style={s.infoCard}>
          <View style={[s.statusBadge, { backgroundColor: st.color + '20' }]}>
            <Text style={[s.statusText, { color: st.color }]}>{st.label}</Text>
          </View>
          <Text style={s.specialty}>{specialtyLabel(shift.specialty)}</Text>
          <View style={s.detailRow}>
            <Text style={s.detailLabel}>📅</Text>
            <Text style={s.detailValue}>{formatDateTime(shift.starts_at)} até {formatTime(shift.ends_at)} ({hours.toFixed(1)}h)</Text>
          </View>
          <View style={s.detailRow}>
            <Text style={s.detailLabel}>👥</Text>
            <Text style={s.detailValue}>{shift.slots} vaga{shift.slots !== 1 ? 's' : ''} · {formatCurrency(shift.rate_per_hour)}/h</Text>
          </View>
          {shift.instructions && (
            <View style={s.instructions}>
              <Text style={s.instructionsText}>{shift.instructions}</Text>
            </View>
          )}
        </View>

        {/* Resumo financeiro */}
        <View style={s.financeCard}>
          <View style={s.finRow}><Text style={s.finLabel}>Total da vaga</Text><Text style={s.finValue}>{formatCurrency(shift.total_value)}</Text></View>
          <View style={s.finRow}><Text style={s.finLabel}>Taxa Laboro</Text><Text style={s.finValue}>- {formatCurrency(shift.laboro_fee)}</Text></View>
          <View style={s.finRow}><Text style={s.finLabel}>Repasse ao trabalhador</Text><Text style={[s.finValue, { color: '#065F46', fontWeight: '800' }]}>{formatCurrency(Number(shift.total_value) - Number(shift.laboro_fee))}</Text></View>
        </View>

        {/* Candidatos confirmados */}
        {confirmed.length > 0 && (
          <>
            <Text style={s.sectionTitle}>Confirmados ({confirmed.length})</Text>
            {confirmed.map((app) => (
              <ApplicationCard
                key={app.id}
                app={app}
                onNoShow={() => reportNoShow(app.worker.id, app.worker.user.full_name)}
                showNoShow={shift.status === 'IN_PROGRESS'}
              />
            ))}
          </>
        )}

        {/* Candidatos pendentes */}
        {pending.length > 0 && (
          <>
            <Text style={s.sectionTitle}>Candidatos pendentes ({pending.length})</Text>
            {pending.map((app) => (
              <ApplicationCard
                key={app.id}
                app={app}
                onConfirm={() => confirmWorker(app.worker.id, app.worker.user.full_name)}
                showConfirm={shift.status === 'OPEN'}
              />
            ))}
          </>
        )}

        {/* Trabalhadores que concluíram — mostrar botão de avaliar */}
        {completed.length > 0 && (
          <>
            <Text style={s.sectionTitle}>Concluídos ({completed.length})</Text>
            {completed.map((app) => (
              <ApplicationCard
                key={app.id}
                app={app}
                onRate={() => router.push(`/rating/${shift.id}?workerId=${app.worker.id}` as any)}
                showRate
              />
            ))}
          </>
        )}

        {shift.applications.length === 0 && (
          <View style={s.noApps}>
            <Text style={s.noAppsIcon}>👀</Text>
            <Text style={s.noAppsText}>Nenhum candidato ainda</Text>
            <Text style={s.noAppsSub}>Trabalhadores com a especialidade {specialtyLabel(shift.specialty)} foram notificados</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

function ApplicationCard({ app, onConfirm, onNoShow, onRate, showConfirm, showNoShow, showRate }: {
  app: Application
  onConfirm?: () => void
  onNoShow?: () => void
  onRate?: () => void
  showConfirm?: boolean
  showNoShow?: boolean
  showRate?: boolean
}) {
  const st = applicationStatusLabel(app.status)
  return (
    <View style={ac.card}>
      <TouchableOpacity style={ac.row} onPress={() => router.push(`/workers/${app.worker.id}` as any)} activeOpacity={0.7}>
        <View style={ac.avatar}>
          <Text style={ac.avatarText}>{app.worker.user.full_name[0]}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={ac.name}>{app.worker.user.full_name}</Text>
          <Text style={ac.meta}>⭐ {Number(app.worker.score).toFixed(1)} · {app.worker.total_shifts} turnos</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View style={[ac.statusBadge, { backgroundColor: st.color + '20' }]}>
            <Text style={[ac.statusText, { color: st.color }]}>{st.label}</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
        </View>
      </TouchableOpacity>
      {showConfirm && onConfirm && (
        <TouchableOpacity style={ac.confirmBtn} onPress={onConfirm}>
          <Text style={ac.confirmText}>✓ Confirmar este trabalhador</Text>
        </TouchableOpacity>
      )}
      {showNoShow && onNoShow && (
        <TouchableOpacity style={[ac.confirmBtn, { backgroundColor: '#FEE2E2' }]} onPress={onNoShow}>
          <Text style={[ac.confirmText, { color: '#EF4444' }]}>⚠️ Registrar no-show</Text>
        </TouchableOpacity>
      )}
      {showRate && onRate && (
        <TouchableOpacity style={[ac.confirmBtn, { backgroundColor: '#FEF3C7' }]} onPress={onRate}>
          <Text style={[ac.confirmText, { color: '#92400E' }]}>⭐ Avaliar trabalhador</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },
  cancelText: { color: '#EF4444', fontSize: 14, fontWeight: '600' },
  content: { padding: 16, gap: 0 },
  infoCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginBottom: 10 },
  statusText: { fontSize: 13, fontWeight: '700' },
  specialty: { fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 10 },
  detailRow: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  detailLabel: { fontSize: 15 },
  detailValue: { fontSize: 14, color: '#374151', flex: 1 },
  instructions: { backgroundColor: '#F9FAFB', borderRadius: 8, padding: 10, marginTop: 8 },
  instructionsText: { fontSize: 13, color: '#6B7280', lineHeight: 20 },
  financeCard: { backgroundColor: '#ECFDF5', borderRadius: 14, padding: 14, marginBottom: 16 },
  finRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  finLabel: { fontSize: 14, color: '#374151' },
  finValue: { fontSize: 14, color: '#111827', fontWeight: '600' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 10, marginTop: 8 },
  noApps: { alignItems: 'center', paddingVertical: 32 },
  noAppsIcon: { fontSize: 40, marginBottom: 8 },
  noAppsText: { fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 4 },
  noAppsSub: { fontSize: 13, color: '#9CA3AF', textAlign: 'center', paddingHorizontal: 24 },
})

const ac = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#065F46', justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 18, fontWeight: '700', color: '#fff' },
  name: { fontSize: 15, fontWeight: '700', color: '#111827' },
  meta: { fontSize: 13, color: '#6B7280' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: '700' },
  confirmBtn: { backgroundColor: '#ECFDF5', borderRadius: 10, padding: 10, alignItems: 'center' },
  confirmText: { color: '#065F46', fontWeight: '700', fontSize: 14 },
})
