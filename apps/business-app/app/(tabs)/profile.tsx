import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native'
import { router } from 'expo-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { api } from '../../lib/api'
import { useAuthStore } from '../../store/auth'
import { formatCurrency, segmentLabel } from '../../lib/format'

type BusinessProfile = {
  id: string
  cnpj: string
  trade_name: string
  legal_name: string
  segment: string
  score: number
  address: { street: string; number: string; neighborhood: string; city: string; state: string }
  user: { full_name: string; phone: string }
}

export default function ProfileScreen() {
  const { logout } = useAuthStore()
  const queryClient = useQueryClient()

  const { data: business, isLoading } = useQuery({
    queryKey: ['my-business'],
    queryFn: () => api.get<BusinessProfile>('/businesses/me'),
  })

  async function handleLogout() {
    Alert.alert('Sair', 'Deseja encerrar sua sessão?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: async () => { await logout(); queryClient.clear(); router.replace('/(auth)/phone') } },
    ])
  }

  if (isLoading) {
    return <SafeAreaView style={s.container} edges={['top']}><ActivityIndicator style={{ marginTop: 60 }} color="#065F46" size="large" /></SafeAreaView>
  }

  if (!business) return null

  const { address: addr } = business

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <ScrollView contentContainerStyle={s.content}>
        <View style={s.headerRow}>
          <Text style={s.pageTitle}>Empresa</Text>
          <TouchableOpacity onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#EF4444" />
          </TouchableOpacity>
        </View>

        {/* Identidade */}
        <View style={s.card}>
          <View style={s.avatar}>
            <Text style={s.avatarInitial}>{business.trade_name[0]}</Text>
          </View>
          <Text style={s.tradeName}>{business.trade_name}</Text>
          <Text style={s.legalName}>{business.legal_name}</Text>
          <View style={s.badgeRow}>
            <Chip label={segmentLabel(business.segment)} />
            <Chip label={`⭐ ${Number(business.score).toFixed(1)}`} color="#F59E0B" />
          </View>
        </View>

        {/* Info */}
        <Section title="Dados cadastrais">
          <InfoRow icon="card-outline" label="CNPJ" value={business.cnpj} />
          <InfoRow icon="location-outline" label="Endereço" value={`${addr.street}, ${addr.number} — ${addr.neighborhood}, ${addr.city}/${addr.state}`} />
          <InfoRow icon="call-outline" label="Contato" value={business.user.phone} />
        </Section>

        <Section title="Conta">
          <MenuItem icon="create-outline" label="Editar dados da empresa" onPress={() => router.push('/profile/edit')} />
          <MenuItem icon="people-outline" label="Trabalhadores favoritos" onPress={() => router.push('/profile/favorites')} />
          <MenuItem icon="notifications-outline" label="Notificações" onPress={() => {}} />
          <MenuItem icon="shield-outline" label="Privacidade" onPress={() => {}} />
        </Section>

        <Text style={s.version}>Laboro v1.0.0 · Ethereon Tech</Text>
      </ScrollView>
    </SafeAreaView>
  )
}

function Chip({ label, color = '#065F46' }: { label: string; color?: string }) {
  return (
    <View style={[ch.chip, { backgroundColor: color + '20' }]}>
      <Text style={[ch.text, { color }]}>{label}</Text>
    </View>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={sec.container}>
      <Text style={sec.title}>{title}</Text>
      {children}
    </View>
  )
}

function InfoRow({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View style={ir.row}>
      <Ionicons name={icon} size={18} color="#6B7280" style={{ marginRight: 10 }} />
      <View style={{ flex: 1 }}>
        <Text style={ir.label}>{label}</Text>
        <Text style={ir.value}>{value}</Text>
      </View>
    </View>
  )
}

function MenuItem({ icon, label, onPress }: { icon: any; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={mi.row} onPress={onPress}>
      <Ionicons name={icon} size={20} color="#6B7280" style={{ marginRight: 12 }} />
      <Text style={mi.label}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
    </TouchableOpacity>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { padding: 16, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  pageTitle: { fontSize: 22, fontWeight: '800', color: '#111827' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#065F46', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarInitial: { fontSize: 32, fontWeight: '700', color: '#fff' },
  tradeName: { fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 4 },
  legalName: { fontSize: 13, color: '#9CA3AF', marginBottom: 12 },
  badgeRow: { flexDirection: 'row', gap: 8 },
  version: { textAlign: 'center', fontSize: 12, color: '#D1D5DB', marginTop: 8 },
})

const ch = StyleSheet.create({
  chip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  text: { fontSize: 13, fontWeight: '700' },
})

const sec = StyleSheet.create({
  container: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  title: { fontSize: 13, fontWeight: '700', color: '#9CA3AF', letterSpacing: 0.5, marginBottom: 12, textTransform: 'uppercase' },
})

const ir = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  label: { fontSize: 11, color: '#9CA3AF', fontWeight: '600', marginBottom: 2 },
  value: { fontSize: 14, color: '#374151' },
})

const mi = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  label: { flex: 1, fontSize: 15, color: '#374151', fontWeight: '500' },
})
