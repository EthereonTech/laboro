import { useState, useEffect } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import * as Location from 'expo-location'
import Toast from 'react-native-toast-message'
import { api } from '../../lib/api'
import { formatCurrency, formatDateTime } from '../../lib/format'

type Application = {
  checkin_at: string | null
  checkout_at: string | null
  hours_worked: number | null
  shift: {
    id: string
    specialty: string
    starts_at: string
    ends_at: string
    total_value: number
    laboro_fee: number
    business: { trade_name: string }
  }
}

export default function CheckinScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const queryClient = useQueryClient()
  const [locating, setLocating] = useState(false)
  const [coords, setCoords] = useState<{ lat: number; lng: number; accuracy?: number } | null>(null)

  const { data: application, isLoading } = useQuery({
    queryKey: ['application', id],
    queryFn: () => api.get<Application>(`/shifts/${id}/my-application`),
  })

  const checkinMutation = useMutation({
    mutationFn: () =>
      api.post(`/shifts/${id}/checkin`, {
        lat: coords!.lat,
        lng: coords!.lng,
        accuracy: coords!.accuracy,
      }),
    onSuccess: (data: any) => {
      if (data?.warning) {
        Toast.show({ type: 'info', text1: 'Check-in realizado', text2: data.warning })
      } else {
        Toast.show({ type: 'success', text1: 'Check-in realizado! ✓', text2: 'A empresa foi notificada.' })
      }
      queryClient.invalidateQueries({ queryKey: ['application', id] })
      queryClient.invalidateQueries({ queryKey: ['my-applications'] })
    },
    onError: (e: any) => {
      Toast.show({ type: 'error', text1: 'Erro no check-in', text2: e.message })
    },
  })

  const checkoutMutation = useMutation({
    mutationFn: () => api.post(`/shifts/${id}/checkout`),
    onSuccess: (data: any) => {
      Toast.show({
        type: 'success',
        text1: 'Check-out realizado! 💰',
        text2: `${data?.hours_worked ?? ''}h trabalhadas. Pagamento em processamento.`,
      })
      queryClient.invalidateQueries({ queryKey: ['application', id] })
      queryClient.invalidateQueries({ queryKey: ['my-applications'] })
      queryClient.invalidateQueries({ queryKey: ['payment-history'] })
      // Aguardar 2s e ir para avaliação
      setTimeout(() => router.replace(`/rating/${id}`), 2000)
    },
    onError: (e: any) => {
      Toast.show({ type: 'error', text1: 'Erro no check-out', text2: e.message })
    },
  })

  async function getLocation() {
    setLocating(true)
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert('Permissão de localização', 'Precisamos da sua localização para validar o check-in.')
        return
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High })
      setCoords({
        lat: loc.coords.latitude,
        lng: loc.coords.longitude,
        accuracy: loc.coords.accuracy ?? undefined,
      })
    } finally {
      setLocating(false)
    }
  }

  useEffect(() => { getLocation() }, [])

  if (isLoading) {
    return (
      <SafeAreaView style={s.container} edges={['top']}>
        <ActivityIndicator style={{ marginTop: 80 }} color="#1D4ED8" size="large" />
      </SafeAreaView>
    )
  }

  if (!application) return null

  const { shift } = application
  const workerAmount = Number(shift.total_value) - Number(shift.laboro_fee)
  const isCheckedIn = !!application.checkin_at
  const isCheckedOut = !!application.checkout_at

  if (isCheckedOut) {
    return (
      <SafeAreaView style={s.container} edges={['top']}>
        <View style={s.doneContainer}>
          <Text style={s.doneIcon}>✅</Text>
          <Text style={s.doneTitle}>Turno concluído!</Text>
          <Text style={s.doneSub}>{application.hours_worked}h trabalhadas</Text>
          <Text style={s.doneValue}>Você receberá {formatCurrency(workerAmount)} via Pix</Text>
          <TouchableOpacity style={s.doneBtn} onPress={() => router.replace('/(tabs)/applications')}>
            <Text style={s.doneBtnText}>Ver candidaturas</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>{isCheckedIn ? 'Check-out' : 'Check-in'}</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={s.content}>
        <Text style={s.business}>{shift.business.trade_name}</Text>
        <Text style={s.datetime}>{formatDateTime(shift.starts_at)}</Text>

        {/* GPS status */}
        <View style={[s.gpsCard, coords && s.gpsCardOk]}>
          {locating ? (
            <>
              <ActivityIndicator color="#1D4ED8" />
              <Text style={s.gpsText}>Obtendo localização...</Text>
            </>
          ) : coords ? (
            <>
              <Ionicons name="location" size={24} color="#10B981" />
              <View>
                <Text style={[s.gpsText, { color: '#10B981' }]}>Localização obtida ✓</Text>
                {coords.accuracy && (
                  <Text style={s.gpsAccuracy}>
                    Precisão: ±{Math.round(coords.accuracy)}m
                    {coords.accuracy > 100 ? ' (baixa)' : ' (boa)'}
                  </Text>
                )}
              </View>
            </>
          ) : (
            <>
              <Ionicons name="location-outline" size={24} color="#EF4444" />
              <Text style={[s.gpsText, { color: '#EF4444' }]}>Localização não disponível</Text>
            </>
          )}
        </View>

        {!coords && (
          <TouchableOpacity style={s.retryBtn} onPress={getLocation}>
            <Text style={s.retryText}>Tentar novamente</Text>
          </TouchableOpacity>
        )}

        <View style={s.infoBox}>
          <Text style={s.infoIcon}>💰</Text>
          <Text style={s.infoText}>
            {isCheckedIn
              ? `Ao fazer check-out, ${formatCurrency(workerAmount)} serão liberados para sua chave Pix.`
              : 'O pagamento está reservado e garantido. Faça check-in para começar o turno.'}
          </Text>
        </View>

        <TouchableOpacity
          style={[s.mainBtn, (!coords || checkinMutation.isPending || checkoutMutation.isPending) && s.mainBtnDisabled, isCheckedIn && { backgroundColor: '#10B981' }]}
          onPress={() => isCheckedIn ? checkoutMutation.mutate() : checkinMutation.mutate()}
          disabled={!coords || checkinMutation.isPending || checkoutMutation.isPending}
        >
          {checkinMutation.isPending || checkoutMutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name={isCheckedIn ? 'exit-outline' : 'enter-outline'} size={24} color="#fff" />
              <Text style={s.mainBtnText}>{isCheckedIn ? 'Fazer check-out' : 'Fazer check-in'}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },
  content: { flex: 1, padding: 16 },
  business: { fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 4 },
  datetime: { fontSize: 14, color: '#6B7280', marginBottom: 24 },
  gpsCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    borderWidth: 2, borderColor: '#E5E7EB', marginBottom: 12,
  },
  gpsCardOk: { borderColor: '#10B981' },
  gpsText: { fontSize: 15, fontWeight: '600', color: '#374151' },
  gpsAccuracy: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  retryBtn: { alignItems: 'center', marginBottom: 16 },
  retryText: { color: '#1D4ED8', fontSize: 15, fontWeight: '600' },
  infoBox: { flexDirection: 'row', backgroundColor: '#F0FDF4', borderRadius: 12, padding: 14, gap: 10, marginBottom: 32, alignItems: 'flex-start' },
  infoIcon: { fontSize: 20 },
  infoText: { flex: 1, fontSize: 13, color: '#166534', lineHeight: 20 },
  mainBtn: { backgroundColor: '#1D4ED8', borderRadius: 16, padding: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
  mainBtnDisabled: { backgroundColor: '#93C5FD' },
  mainBtnText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  doneContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  doneIcon: { fontSize: 72, marginBottom: 16 },
  doneTitle: { fontSize: 28, fontWeight: '800', color: '#111827', marginBottom: 8 },
  doneSub: { fontSize: 17, color: '#6B7280', marginBottom: 4 },
  doneValue: { fontSize: 17, color: '#10B981', fontWeight: '600', marginBottom: 32 },
  doneBtn: { backgroundColor: '#1D4ED8', borderRadius: 12, paddingHorizontal: 32, paddingVertical: 14 },
  doneBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
})
