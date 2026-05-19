import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import Toast from 'react-native-toast-message'
import { api } from '../../lib/api'

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 8, marginBottom: 32 }}>
      {Array.from({ length: total }, (_, i) => (
        <View key={i} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: i < current ? '#065F46' : '#E5E7EB' }} />
      ))}
    </View>
  )
}

export default function RegisterStep3() {
  const { cnpj, tradeName, legalName, segment } = useLocalSearchParams<{
    cnpj: string; tradeName: string; legalName: string; segment: string
  }>()

  const [street, setStreet] = useState('')
  const [number, setNumber] = useState('')
  const [neighborhood, setNeighborhood] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [zip, setZip] = useState('')
  const [loading, setLoading] = useState(false)

  const isValid = street && number && neighborhood && city && state.length === 2 && zip.replace(/\D/g, '').length === 8

  function formatZip(raw: string) {
    const d = raw.replace(/\D/g, '').slice(0, 8)
    return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d
  }

  async function handleFinish() {
    if (!isValid) return
    setLoading(true)
    try {
      await api.post('/businesses/me', {
        cnpj,
        trade_name: tradeName,
        legal_name: legalName,
        segment,
        address: {
          street, number, neighborhood,
          city, state: state.toUpperCase(),
          zip: zip.replace(/\D/g, ''),
        },
      })
      router.replace('/(tabs)')
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Erro ao criar empresa', text2: e.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
      <StepIndicator current={3} total={3} />
      <Text style={s.title}>Endereço da empresa</Text>
      <Text style={s.subtitle}>Usado para exibir a localização das vagas no app dos trabalhadores.</Text>

      <Row>
        <Field label="CEP" flex={1.2}>
          <TextInput style={s.input} value={zip} onChangeText={(t) => setZip(formatZip(t))} keyboardType="number-pad" maxLength={9} placeholder="00000-000" />
        </Field>
        <Field label="Estado (UF)" flex={0.8}>
          <TextInput style={s.input} value={state} onChangeText={(t) => setState(t.slice(0, 2))} autoCapitalize="characters" maxLength={2} placeholder="PR" />
        </Field>
      </Row>

      <Field label="Cidade">
        <TextInput style={s.input} value={city} onChangeText={setCity} placeholder="Pato Branco" autoCapitalize="words" />
      </Field>

      <Field label="Bairro">
        <TextInput style={s.input} value={neighborhood} onChangeText={setNeighborhood} autoCapitalize="words" />
      </Field>

      <Row>
        <Field label="Rua / Avenida" flex={3}>
          <TextInput style={s.input} value={street} onChangeText={setStreet} autoCapitalize="words" />
        </Field>
        <Field label="Nº" flex={1}>
          <TextInput style={s.input} value={number} onChangeText={setNumber} keyboardType="number-pad" />
        </Field>
      </Row>

      <TouchableOpacity style={[s.btn, !isValid && s.btnDisabled]} onPress={handleFinish} disabled={!isValid || loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Criar empresa 🎉</Text>}
      </TouchableOpacity>
    </ScrollView>
  )
}

function Row({ children }: { children: React.ReactNode }) {
  return <View style={{ flexDirection: 'row', gap: 12 }}>{children}</View>
}

function Field({ label, flex = 1, children }: { label: string; flex?: number; children: React.ReactNode }) {
  return (
    <View style={{ flex, marginBottom: 4 }}>
      <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>{label}</Text>
      {children}
    </View>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 24, paddingTop: 60 },
  title: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#6B7280', marginBottom: 28, lineHeight: 22 },
  input: { borderWidth: 1.5, borderColor: '#D1D5DB', borderRadius: 12, padding: 13, fontSize: 15, color: '#111827', marginBottom: 16 },
  btn: { backgroundColor: '#065F46', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  btnDisabled: { backgroundColor: '#6EE7B7' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
})
