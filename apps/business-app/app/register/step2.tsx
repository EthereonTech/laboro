import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import Toast from 'react-native-toast-message'
import { api } from '../../lib/api'
import { segmentLabel } from '../../lib/format'

const SEGMENTS = ['bar', 'restaurante', 'evento', 'hotel', 'varejo', 'saude', 'logistica', 'outro']

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 8, marginBottom: 32 }}>
      {Array.from({ length: total }, (_, i) => (
        <View key={i} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: i < current ? '#065F46' : '#E5E7EB' }} />
      ))}
    </View>
  )
}

export default function RegisterStep2() {
  const { cnpj } = useLocalSearchParams<{ cnpj: string }>()
  const [tradeName, setTradeName] = useState('')
  const [legalName, setLegalName] = useState('')
  const [segment, setSegment] = useState('')
  const [loading, setLoading] = useState(false)

  const isValid = tradeName.trim().length >= 2 && legalName.trim().length >= 2 && segment !== ''

  async function handleNext() {
    if (!isValid) return
    setLoading(true)
    try {
      router.push({
        pathname: '/register/step3',
        params: { cnpj, tradeName, legalName, segment },
      })
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Erro', text2: e.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
      <StepIndicator current={2} total={3} />
      <Text style={s.title}>Dados da empresa</Text>

      <Text style={s.label}>Nome fantasia</Text>
      <TextInput style={s.input} value={tradeName} onChangeText={setTradeName} placeholder="Como é conhecido" autoFocus />

      <Text style={s.label}>Razão social</Text>
      <TextInput style={s.input} value={legalName} onChangeText={setLegalName} placeholder="Nome jurídico completo" autoCapitalize="characters" />

      <Text style={s.label}>Segmento</Text>
      <View style={s.grid}>
        {SEGMENTS.map((seg) => (
          <TouchableOpacity
            key={seg}
            style={[s.chip, segment === seg && s.chipActive]}
            onPress={() => setSegment(seg)}
          >
            <Text style={[s.chipText, segment === seg && s.chipTextActive]}>{segmentLabel(seg)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={[s.btn, !isValid && s.btnDisabled]} onPress={handleNext} disabled={!isValid || loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Próximo →</Text>}
      </TouchableOpacity>
    </ScrollView>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 24, paddingTop: 60 },
  title: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  input: { borderWidth: 1.5, borderColor: '#D1D5DB', borderRadius: 12, padding: 14, fontSize: 16, color: '#111827', marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1.5, borderColor: '#D1D5DB', backgroundColor: '#F9FAFB' },
  chipActive: { backgroundColor: '#065F46', borderColor: '#065F46' },
  chipText: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  chipTextActive: { color: '#fff', fontWeight: '700' },
  btn: { backgroundColor: '#065F46', borderRadius: 12, padding: 16, alignItems: 'center' },
  btnDisabled: { backgroundColor: '#6EE7B7' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
})
