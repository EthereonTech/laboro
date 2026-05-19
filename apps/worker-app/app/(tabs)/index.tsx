import { useState, useCallback } from 'react'
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  RefreshControl, TextInput, ActivityIndicator,
} from 'react-native'
import { router } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import * as Location from 'expo-location'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { api } from '../../lib/api'
import { formatCurrency, formatDateTime, specialtyLabel } from '../../lib/format'

type Shift = {
  id: string
  specialty: string
  starts_at: string
  ends_at: string
  rate_per_hour: number
  total_value: number
  is_urgent: boolean
  slots: number
  business: { trade_name: string; address: { city: string; neighborhood?: string } }
  distance_km?: number
}

const SPECIALTIES = ['', 'garcom', 'bartender', 'aux_cozinha', 'promotor', 'caixa', 'repositor', 'cuidador', 'aux_logistica']

export default function HomeScreen() {
  const [specialty, setSpecialty] = useState('')
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['shifts', specialty, coords],
    queryFn: async () => {
      let qs = specialty ? `specialty=${specialty}` : ''
      if (coords) qs += `${qs ? '&' : ''}lat=${coords.lat}&lng=${coords.lng}`
      const shifts = await api.get<Shift[]>(`/shifts${qs ? '?' + qs : ''}`)
      return shifts
    },
  })

  const requestLocation = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync()
    if (status !== 'granted') return
    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
    setCoords({ lat: loc.coords.latitude, lng: loc.coords.longitude })
  }, [])

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.header}>
        <Text style={s.logo}>Laboro</Text>
        <TouchableOpacity onPress={requestLocation} style={s.locationBtn}>
          <Ionicons name="location-outline" size={20} color="#1D4ED8" />
          <Text style={s.locationText}>{coords ? 'Perto de mim' : 'Usar localização'}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        horizontal
        data={SPECIALTIES}
        keyExtractor={(i) => i || 'all'}
        showsHorizontalScrollIndicator={false}
        style={s.filterList}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[s.filterChip, specialty === item && s.filterChipActive]}
            onPress={() => setSpecialty(item)}
          >
            <Text style={[s.filterChipText, specialty === item && s.filterChipTextActive]}>
              {item ? specialtyLabel(item) : 'Todas'}
            </Text>
          </TouchableOpacity>
        )}
      />

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 60 }} color="#1D4ED8" size="large" />
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={(s) => s.id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#1D4ED8" />}
          ListEmptyComponent={
            <View style={s.empty}>
              <Text style={s.emptyIcon}>🔍</Text>
              <Text style={s.emptyText}>Nenhuma vaga disponível agora</Text>
              <Text style={s.emptySubtext}>Tente mudar os filtros ou verificar mais tarde</Text>
            </View>
          }
          renderItem={({ item }) => <ShiftCard shift={item} />}
        />
      )}
    </SafeAreaView>
  )
}

function ShiftCard({ shift }: { shift: Shift }) {
  const hours = (new Date(shift.ends_at).getTime() - new Date(shift.starts_at).getTime()) / 3600000

  return (
    <TouchableOpacity style={c.card} onPress={() => router.push(`/shifts/${shift.id}`)}>
      {shift.is_urgent && (
        <View style={c.urgentBadge}>
          <Text style={c.urgentText}>⚡ Urgente</Text>
        </View>
      )}
      <View style={c.row}>
        <View style={c.specialtyBadge}>
          <Text style={c.specialtyText}>{specialtyLabel(shift.specialty)}</Text>
        </View>
        <Text style={c.value}>{formatCurrency(shift.total_value)}</Text>
      </View>
      <Text style={c.business}>{shift.business.trade_name}</Text>
      <Text style={c.datetime}>{formatDateTime(shift.starts_at)} · {hours.toFixed(1)}h</Text>
      <View style={c.footer}>
        <Text style={c.location}>
          📍 {shift.business.address.neighborhood ?? shift.business.address.city}
          {shift.distance_km ? ` · ${shift.distance_km.toFixed(1)}km` : ''}
        </Text>
        <Text style={c.rate}>{formatCurrency(shift.rate_per_hour)}/h</Text>
      </View>
    </TouchableOpacity>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  logo: { fontSize: 24, fontWeight: '800', color: '#1D4ED8' },
  locationBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { fontSize: 13, color: '#1D4ED8', fontWeight: '600' },
  filterList: { maxHeight: 48, marginBottom: 4 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB' },
  filterChipActive: { backgroundColor: '#1D4ED8', borderColor: '#1D4ED8' },
  filterChipText: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  filterChipTextActive: { color: '#fff', fontWeight: '700' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 17, fontWeight: '600', color: '#374151', marginBottom: 4 },
  emptySubtext: { fontSize: 14, color: '#9CA3AF' },
})

const c = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  urgentBadge: { backgroundColor: '#FEF3C7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start', marginBottom: 8 },
  urgentText: { fontSize: 12, color: '#92400E', fontWeight: '700' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  specialtyBadge: { backgroundColor: '#EFF6FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  specialtyText: { fontSize: 13, color: '#1D4ED8', fontWeight: '600' },
  value: { fontSize: 20, fontWeight: '800', color: '#111827' },
  business: { fontSize: 15, fontWeight: '600', color: '#374151', marginBottom: 2 },
  datetime: { fontSize: 13, color: '#6B7280', marginBottom: 8 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  location: { fontSize: 13, color: '#9CA3AF' },
  rate: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
})
