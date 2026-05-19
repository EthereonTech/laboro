import { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native'
import { router } from 'expo-router'
import Toast from 'react-native-toast-message'
import { api } from '../../lib/api'
import { specialtyLabel } from '../../lib/format'

const SPECIALTIES = [
  'garcom', 'bartender', 'aux_cozinha', 'promotor',
  'caixa', 'repositor', 'cuidador', 'aux_logistica',
]

export default function RegisterStep2() {
  const [selected, setSelected] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  function toggle(s: string) {
    setSelected((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s])
  }

  async function handleNext() {
    if (selected.length === 0) return
    setLoading(true)
    try {
      await api.put('/workers/me/specialties', { specialties: selected })
      router.push('/register/step3')
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Erro', text2: e.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <StepIndicator current={2} total={4} />
      <Text style={s.title}>Suas especialidades</Text>
      <Text style={s.subtitle}>Selecione todas que se aplicam a você.</Text>

      <View style={s.grid}>
        {SPECIALTIES.map((sp) => {
          const active = selected.includes(sp)
          return (
            <TouchableOpacity
              key={sp}
              style={[s.card, active && s.cardActive]}
              onPress={() => toggle(sp)}
            >
              <Text style={[s.cardText, active && s.cardTextActive]}>{specialtyLabel(sp)}</Text>
            </TouchableOpacity>
          )
        })}
      </View>

      <TouchableOpacity
        style={[s.btn, selected.length === 0 && s.btnDisabled]}
        onPress={handleNext}
        disabled={selected.length === 0 || loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Próximo →</Text>}
      </TouchableOpacity>
    </ScrollView>
  )
}

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 8, marginBottom: 32 }}>
      {Array.from({ length: total }, (_, i) => (
        <View key={i} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: i < current ? '#1D4ED8' : '#E5E7EB' }} />
      ))}
    </View>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 24, paddingTop: 60 },
  title: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#6B7280', marginBottom: 24 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 32 },
  card: {
    paddingHorizontal: 20, paddingVertical: 14, borderRadius: 12,
    borderWidth: 1.5, borderColor: '#D1D5DB', backgroundColor: '#F9FAFB',
  },
  cardActive: { backgroundColor: '#EFF6FF', borderColor: '#1D4ED8' },
  cardText: { fontSize: 15, color: '#6B7280', fontWeight: '500' },
  cardTextActive: { color: '#1D4ED8', fontWeight: '700' },
  btn: { backgroundColor: '#1D4ED8', borderRadius: 12, padding: 16, alignItems: 'center' },
  btnDisabled: { backgroundColor: '#93C5FD' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
})
