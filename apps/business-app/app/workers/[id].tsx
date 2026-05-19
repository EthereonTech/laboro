import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { api } from '../../lib/api'
import { specialtyLabel } from '../../lib/format'

type WorkerPublicProfile = {
  id: string
  full_name: string
  photo_url: string | null
  score: number
  total_shifts: number
  on_time_rate: number
  level: string
  specialties: string[]
  is_verified: boolean
}

const LEVEL_CONFIG = {
  BEGINNER: { label: 'Iniciante', color: '#6B7280', bg: '#F3F4F6' },
  VERIFIED: { label: 'Verificado', color: '#2563EB', bg: '#DBEAFE' },
  TOP_PRO: { label: 'Top Pro ⭐', color: '#065F46', bg: '#D1FAE5' },
}

function Stars({ score }: { score: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Text key={n} style={{ fontSize: 18, color: n <= Math.round(score) ? '#F59E0B' : '#E5E7EB' }}>★</Text>
      ))}
    </View>
  )
}

export default function WorkerProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()

  const { data: worker, isLoading } = useQuery({
    queryKey: ['worker-public', id],
    queryFn: () => api.get<WorkerPublicProfile>(`/workers/${id}`),
  })

  if (isLoading) {
    return (
      <SafeAreaView style={s.container} edges={['top']}>
        <ActivityIndicator style={{ marginTop: 80 }} color="#065F46" size="large" />
      </SafeAreaView>
    )
  }

  if (!worker) return null

  const level = LEVEL_CONFIG[worker.level as keyof typeof LEVEL_CONFIG] ?? LEVEL_CONFIG.BEGINNER

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Perfil do Trabalhador</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={s.content}>
        {/* Avatar + nome + level */}
        <View style={s.heroCard}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{worker.full_name[0].toUpperCase()}</Text>
          </View>
          <Text style={s.name}>{worker.full_name}</Text>
          {worker.is_verified && (
            <View style={s.verifiedBadge}>
              <Text style={s.verifiedText}>✓ Verificado</Text>
            </View>
          )}
          <View style={[s.levelBadge, { backgroundColor: level.bg }]}>
            <Text style={[s.levelText, { color: level.color }]}>{level.label}</Text>
          </View>
        </View>

        {/* Score */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Avaliação</Text>
          <View style={s.scoreRow}>
            <Stars score={worker.score} />
            <Text style={s.scoreNum}>{worker.score.toFixed(1)}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={s.statsRow}>
          <View style={s.statBox}>
            <Text style={s.statValue}>{worker.total_shifts}</Text>
            <Text style={s.statLabel}>Turnos</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statBox}>
            <Text style={s.statValue}>{Number(worker.on_time_rate).toFixed(0)}%</Text>
            <Text style={s.statLabel}>Pontualidade</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statBox}>
            <Text style={s.statValue}>{worker.score.toFixed(1)}</Text>
            <Text style={s.statLabel}>Score</Text>
          </View>
        </View>

        {/* Especialidades */}
        {worker.specialties.length > 0 && (
          <View style={s.card}>
            <Text style={s.cardTitle}>Especialidades</Text>
            <View style={s.chips}>
              {worker.specialties.map((sp) => (
                <View key={sp} style={s.chip}>
                  <Text style={s.chipText}>{specialtyLabel(sp)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Sobre o nível */}
        <View style={s.infoCard}>
          <Text style={s.infoTitle}>O que significa {level.label}?</Text>
          <Text style={s.infoText}>
            {worker.level === 'BEGINNER' && 'Trabalhador em início de jornada na plataforma. Menos de 5 turnos concluídos.'}
            {worker.level === 'VERIFIED' && 'Trabalhador com histórico comprovado. 5 ou mais turnos concluídos com boas avaliações.'}
            {worker.level === 'TOP_PRO' && 'Elite da plataforma. 20+ turnos, score ≥ 4.5 e pontualidade ≥ 90%. Confiança máxima.'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },
  content: { padding: 16, gap: 12 },

  heroCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 24,
    alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  avatar: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: '#065F46',
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  avatarText: { fontSize: 32, fontWeight: '700', color: '#fff' },
  name: { fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 8, textAlign: 'center' },
  verifiedBadge: {
    backgroundColor: '#D1FAE5', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 8,
  },
  verifiedText: { fontSize: 13, color: '#065F46', fontWeight: '600' },
  levelBadge: { borderRadius: 12, paddingHorizontal: 14, paddingVertical: 6 },
  levelText: { fontSize: 14, fontWeight: '700' },

  card: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  cardTitle: { fontSize: 13, fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  scoreNum: { fontSize: 24, fontWeight: '800', color: '#111827' },

  statsRow: {
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: 14,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1, overflow: 'hidden',
  },
  statBox: { flex: 1, alignItems: 'center', paddingVertical: 18 },
  statDivider: { width: 1, backgroundColor: '#E5E7EB', marginVertical: 12 },
  statValue: { fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 2 },
  statLabel: { fontSize: 12, color: '#6B7280', fontWeight: '500' },

  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    backgroundColor: '#ECFDF5', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: '#A7F3D0',
  },
  chipText: { fontSize: 13, color: '#065F46', fontWeight: '600' },

  infoCard: {
    backgroundColor: '#FFFBEB', borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: '#FDE68A',
  },
  infoTitle: { fontSize: 14, fontWeight: '700', color: '#92400E', marginBottom: 6 },
  infoText: { fontSize: 13, color: '#78350F', lineHeight: 20 },
})
