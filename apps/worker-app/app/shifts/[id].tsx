import { useState } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  ActivityIndicator, Alert,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import Toast from 'react-native-toast-message'
import { api } from '../../lib/api'
import { formatCurrency, formatDateTime, formatTime, specialtyLabel } from '../../lib/format'

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
  address: { street?: string; neighborhood?: string; city: string; state: string } | null
  business: {
    trade_name: string
    segment: string
    score: number
    address: { street: string; neighborhood: string; city: string; state: string }
  }
  my_application?: { status: string } | null
}

export default function ShiftDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const queryClient = useQueryClient()

  const { data: shift, isLoading } = useQuery({
    queryKey: ['shift', id],
    queryFn: () => api.get<ShiftDetail>(`/shifts/${id}`),
  })

  const apply = useMutation({
    mutationFn: () => api.post(`/shifts/${id}/apply`),
    onSuccess: () => {
      Toast.show({ type: 'success', text1: 'Candidatura enviada!', text2: 'A empresa será notificada.' })
      queryClient.invalidateQueries({ queryKey: ['shift', id] })
      queryClient.invalidateQueries({ queryKey: ['my-applications'] })
    },
    onError: (e: any) => {
      Toast.show({ type: 'error', text1: 'Erro', text2: e.message })
    },
  })

  if (isLoading) {
    return (
      <SafeAreaView style={s.container} edges={['top']}>
        <ActivityIndicator style={{ marginTop: 80 }} color="#1D4ED8" size="large" />
      </SafeAreaView>
    )
  }

  if (!shift) return null

  const addr = shift.address ?? shift.business.address
  const hours = (new Date(shift.ends_at).getTime() - new Date(shift.starts_at).getTime()) / 3600000
  const workerAmount = Number(shift.total_value) - Number(shift.laboro_fee)
  const hasApplied = !!shift.my_application
  const isConfirmed = shift.my_application?.status === 'CONFIRMED'

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <ScrollView contentContainerStyle={s.content}>
        {/* Header */}
        <View style={s.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          {shift.is_urgent && (
            <View style={s.urgentBadge}>
              <Text style={s.urgentText}>⚡ Urgente</Text>
            </View>
          )}
        </View>

        {/* Specialty + Business */}
        <View style={s.specialtyBadge}>
          <Text style={s.specialtyText}>{specialtyLabel(shift.specialty)}</Text>
        </View>
        <Text style={s.businessName}>{shift.business.trade_name}</Text>
        <View style={s.scoreRow}>
          <Text style={s.star}>⭐</Text>
          <Text style={s.score}>{Number(shift.business.score).toFixed(1)}</Text>
          <Text style={s.segment}> · {shift.business.segment}</Text>
        </View>

        {/* Value card */}
        <View style={s.valueCard}>
          <View style={s.valueMain}>
            <Text style={s.valueLabel}>Você recebe</Text>
            <Text style={s.valueAmount}>{formatCurrency(workerAmount)}</Text>
          </View>
          <View style={s.valueSub}>
            <Text style={s.rateText}>{formatCurrency(shift.rate_per_hour)}/h · {hours.toFixed(1)}h</Text>
            <Text style={s.feeText}>Taxa Laboro: {formatCurrency(shift.laboro_fee)}</Text>
          </View>
        </View>

        {/* Details */}
        <View style={s.detailsCard}>
          <DetailRow icon="calendar-outline" label="Data e hora">
            {formatDateTime(shift.starts_at)} até {formatTime(shift.ends_at)}
          </DetailRow>
          <DetailRow icon="location-outline" label="Local">
            {addr.street ? `${addr.street}, ` : ''}{addr.neighborhood ?? ''} — {addr.city}, {addr.state}
          </DetailRow>
          <DetailRow icon="people-outline" label="Vagas">
            {shift.slots} {shift.slots === 1 ? 'vaga' : 'vagas'}
          </DetailRow>
          {shift.instructions && (
            <DetailRow icon="document-text-outline" label="Instruções">
              {shift.instructions}
            </DetailRow>
          )}
        </View>

        {/* Escrow info */}
        <View style={s.escrowBox}>
          <Text style={s.escrowIcon}>🔒</Text>
          <Text style={s.escrowText}>
            Pagamento garantido via Pix escrow. O valor é retido antes do turno e liberado automaticamente após seu check-out.
          </Text>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={s.footer}>
        {isConfirmed ? (
          <TouchableOpacity style={[s.ctaBtn, { backgroundColor: '#10B981' }]} onPress={() => router.push(`/checkin/${id}`)}>
            <Text style={s.ctaBtnText}>📍 Fazer check-in</Text>
          </TouchableOpacity>
        ) : hasApplied ? (
          <View style={[s.ctaBtn, { backgroundColor: '#E5E7EB' }]}>
            <Text style={[s.ctaBtnText, { color: '#6B7280' }]}>✓ Candidatura enviada</Text>
          </View>
        ) : shift.status !== 'OPEN' ? (
          <View style={[s.ctaBtn, { backgroundColor: '#E5E7EB' }]}>
            <Text style={[s.ctaBtnText, { color: '#6B7280' }]}>Vaga encerrada</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={s.ctaBtn}
            onPress={() => apply.mutate()}
            disabled={apply.isPending}
          >
            {apply.isPending
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.ctaBtnText}>Quero me candidatar</Text>}
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  )
}

function DetailRow({ icon, label, children }: { icon: any; label: string; children: React.ReactNode }) {
  return (
    <View style={d.row}>
      <Ionicons name={icon} size={18} color="#6B7280" style={d.icon} />
      <View style={d.content}>
        <Text style={d.label}>{label}</Text>
        <Text style={d.value}>{children}</Text>
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { padding: 16, paddingBottom: 100 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  backBtn: { padding: 4 },
  urgentBadge: { backgroundColor: '#FEF3C7', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  urgentText: { fontSize: 13, color: '#92400E', fontWeight: '700' },
  specialtyBadge: { backgroundColor: '#EFF6FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, alignSelf: 'flex-start', marginBottom: 8 },
  specialtyText: { fontSize: 14, color: '#1D4ED8', fontWeight: '700' },
  businessName: { fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 4 },
  scoreRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  star: { fontSize: 14 },
  score: { fontSize: 14, fontWeight: '700', color: '#374151', marginLeft: 4 },
  segment: { fontSize: 14, color: '#9CA3AF' },
  valueCard: { backgroundColor: '#1D4ED8', borderRadius: 16, padding: 20, marginBottom: 16 },
  valueMain: { marginBottom: 8 },
  valueLabel: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 2 },
  valueAmount: { fontSize: 36, fontWeight: '800', color: '#fff' },
  valueSub: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)', paddingTop: 10 },
  rateText: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  feeText: { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
  detailsCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  escrowBox: { flexDirection: 'row', backgroundColor: '#F0FDF4', borderRadius: 12, padding: 14, gap: 10, alignItems: 'flex-start' },
  escrowIcon: { fontSize: 20 },
  escrowText: { flex: 1, fontSize: 13, color: '#166534', lineHeight: 20 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', padding: 16, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  ctaBtn: { backgroundColor: '#1D4ED8', borderRadius: 14, padding: 18, alignItems: 'center' },
  ctaBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
})

const d = StyleSheet.create({
  row: { flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  icon: { marginRight: 12, marginTop: 2 },
  content: { flex: 1 },
  label: { fontSize: 12, color: '#9CA3AF', fontWeight: '600', marginBottom: 2 },
  value: { fontSize: 14, color: '#374151', lineHeight: 20 },
})
