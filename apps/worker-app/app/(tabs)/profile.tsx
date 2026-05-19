import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, Alert, ActivityIndicator } from 'react-native'
import { router } from 'expo-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { api } from '../../lib/api'
import { useAuthStore } from '../../store/auth'
import { formatCurrency, levelLabel, specialtyLabel } from '../../lib/format'

type WorkerProfile = {
  id: string
  score: number
  level: string
  total_shifts: number
  on_time_rate: number
  pix_key: string | null
  pix_key_type: string | null
  specialties: { specialty: string }[]
  user: {
    full_name: string
    phone: string
    photo_url: string | null
  }
}

const LEVEL_COLOR: Record<string, string> = {
  BEGINNER: '#6B7280',
  VERIFIED: '#3B82F6',
  TOP_PRO: '#F59E0B',
}

export default function ProfileScreen() {
  const { logout } = useAuthStore()
  const queryClient = useQueryClient()

  const { data: worker, isLoading } = useQuery({
    queryKey: ['my-profile'],
    queryFn: () => api.get<WorkerProfile>('/workers/me'),
  })

  async function handleLogout() {
    Alert.alert('Sair', 'Deseja encerrar sua sessão?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          await logout()
          queryClient.clear()
          router.replace('/(auth)/phone')
        },
      },
    ])
  }

  async function handleDeleteAccount() {
    Alert.alert(
      'Excluir conta',
      'Seus dados pessoais serão anonimizados (LGPD). Histórico financeiro permanece por obrigação legal. Confirma?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            await api.delete('/users/me')
            await logout()
            queryClient.clear()
            router.replace('/(auth)/phone')
          },
        },
      ],
    )
  }

  if (isLoading) {
    return (
      <SafeAreaView style={s.container} edges={['top']}>
        <ActivityIndicator style={{ marginTop: 60 }} color="#1D4ED8" size="large" />
      </SafeAreaView>
    )
  }

  if (!worker) return null

  const levelColor = LEVEL_COLOR[worker.level] ?? '#6B7280'

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <ScrollView contentContainerStyle={s.content}>
        {/* Header */}
        <View style={s.headerRow}>
          <Text style={s.pageTitle}>Perfil</Text>
          <TouchableOpacity onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#EF4444" />
          </TouchableOpacity>
        </View>

        {/* Avatar + nome */}
        <View style={s.avatarSection}>
          {worker.user.photo_url ? (
            <Image source={{ uri: worker.user.photo_url }} style={s.avatar} />
          ) : (
            <View style={s.avatarPlaceholder}>
              <Text style={s.avatarInitial}>{worker.user.full_name[0]}</Text>
            </View>
          )}
          <Text style={s.name}>{worker.user.full_name}</Text>
          <View style={[s.levelBadge, { backgroundColor: levelColor + '20' }]}>
            <Text style={[s.levelText, { color: levelColor }]}>{levelLabel(worker.level)}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={s.statsRow}>
          <Stat label="Score" value={Number(worker.score).toFixed(1)} icon="⭐" />
          <Stat label="Turnos" value={String(worker.total_shifts)} icon="💼" />
          <Stat label="Pontualidade" value={`${Number(worker.on_time_rate).toFixed(0)}%`} icon="⏱" />
        </View>

        {/* Especialidades */}
        <Section title="Especialidades">
          <View style={s.chips}>
            {worker.specialties.map((sp) => (
              <View key={sp.specialty} style={s.chip}>
                <Text style={s.chipText}>{specialtyLabel(sp.specialty)}</Text>
              </View>
            ))}
          </View>
        </Section>

        {/* Chave Pix */}
        {worker.pix_key && (
          <Section title="Chave Pix">
            <Text style={s.pixType}>{worker.pix_key_type?.toUpperCase()}</Text>
            <Text style={s.pixKey}>{worker.pix_key}</Text>
          </Section>
        )}

        {/* Ações */}
        <Section title="Conta">
          <MenuItem icon="create-outline" label="Editar perfil" onPress={() => router.push('/profile/edit')} />
          <MenuItem icon="notifications-outline" label="Notificações" onPress={() => router.push('/profile/notifications')} />
          <MenuItem icon="shield-outline" label="Privacidade" onPress={() => {}} />
        </Section>

        <TouchableOpacity style={s.deleteBtn} onPress={handleDeleteAccount}>
          <Text style={s.deleteBtnText}>Excluir minha conta (LGPD)</Text>
        </TouchableOpacity>

        <Text style={s.version}>Laboro v1.0.0 · Ethereon Tech</Text>
      </ScrollView>
    </SafeAreaView>
  )
}

function Stat({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <View style={st.box}>
      <Text style={st.icon}>{icon}</Text>
      <Text style={st.value}>{value}</Text>
      <Text style={st.label}>{label}</Text>
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
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  pageTitle: { fontSize: 22, fontWeight: '800', color: '#111827' },
  avatarSection: { alignItems: 'center', marginBottom: 24 },
  avatar: { width: 96, height: 96, borderRadius: 48, marginBottom: 12 },
  avatarPlaceholder: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#1D4ED8', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarInitial: { fontSize: 40, fontWeight: '700', color: '#fff' },
  name: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 8 },
  levelBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  levelText: { fontSize: 13, fontWeight: '700' },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { backgroundColor: '#EFF6FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  chipText: { fontSize: 13, color: '#1D4ED8', fontWeight: '600' },
  pixType: { fontSize: 11, fontWeight: '700', color: '#9CA3AF', letterSpacing: 1, marginBottom: 2 },
  pixKey: { fontSize: 15, color: '#374151', fontWeight: '500' },
  deleteBtn: { marginTop: 8, padding: 16, alignItems: 'center' },
  deleteBtnText: { color: '#EF4444', fontSize: 14, fontWeight: '600' },
  version: { textAlign: 'center', fontSize: 12, color: '#D1D5DB', marginTop: 8 },
})

const st = StyleSheet.create({
  box: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 16, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  icon: { fontSize: 24, marginBottom: 4 },
  value: { fontSize: 20, fontWeight: '800', color: '#111827' },
  label: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
})

const sec = StyleSheet.create({
  container: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  title: { fontSize: 13, fontWeight: '700', color: '#9CA3AF', letterSpacing: 0.5, marginBottom: 12, textTransform: 'uppercase' },
})

const mi = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  label: { flex: 1, fontSize: 15, color: '#374151', fontWeight: '500' },
})
