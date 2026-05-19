import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native'
import { router } from 'expo-router'
import Toast from 'react-native-toast-message'
import { api } from '../../lib/api'

// Formata CNPJ: 00.000.000/0000-00
function formatCnpj(raw: string) {
  const d = raw.replace(/\D/g, '').slice(0, 14)
  if (d.length <= 2) return d
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`
  if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`
  if (d.length <= 12) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`
}

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 8, marginBottom: 32 }}>
      {Array.from({ length: total }, (_, i) => (
        <View key={i} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: i < current ? '#065F46' : '#E5E7EB' }} />
      ))}
    </View>
  )
}

export default function RegisterStep1() {
  const [cnpj, setCnpj] = useState('')
  const [loading, setLoading] = useState(false)

  const rawCnpj = cnpj.replace(/\D/g, '')
  const isValid = rawCnpj.length === 14

  async function handleNext() {
    if (!isValid) return
    setLoading(true)
    try {
      // Verificar CNPJ na Receita Federal primeiro
      await api.post('/businesses/validate-cnpj', { cnpj: rawCnpj })
      router.push({ pathname: '/register/step2', params: { cnpj: rawCnpj } })
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'CNPJ inválido', text2: e.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
      <StepIndicator current={1} total={3} />
      <Text style={s.title}>CNPJ da empresa</Text>
      <Text style={s.subtitle}>Vamos consultar os dados na Receita Federal automaticamente.</Text>

      <Text style={s.label}>CNPJ</Text>
      <TextInput
        style={s.input}
        value={cnpj}
        onChangeText={(t) => setCnpj(formatCnpj(t))}
        keyboardType="number-pad"
        placeholder="00.000.000/0000-00"
        placeholderTextColor="#9CA3AF"
        maxLength={18}
        autoFocus
      />

      <TouchableOpacity style={[s.btn, !isValid && s.btnDisabled]} onPress={handleNext} disabled={!isValid || loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Consultar CNPJ →</Text>}
      </TouchableOpacity>
    </ScrollView>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 24, paddingTop: 60 },
  title: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#6B7280', marginBottom: 32, lineHeight: 22 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  input: { borderWidth: 1.5, borderColor: '#D1D5DB', borderRadius: 12, padding: 14, fontSize: 20, color: '#111827', marginBottom: 20, letterSpacing: 2 },
  btn: { backgroundColor: '#065F46', borderRadius: 12, padding: 16, alignItems: 'center' },
  btnDisabled: { backgroundColor: '#6EE7B7' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
})
