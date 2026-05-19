import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator,
} from 'react-native'
import { router } from 'expo-router'
import Toast from 'react-native-toast-message'
import { api } from '../../lib/api'

const PIX_TYPES = [
  { value: 'cpf', label: 'CPF' },
  { value: 'phone', label: 'Celular' },
  { value: 'email', label: 'E-mail' },
  { value: 'random', label: 'Chave aleatória' },
]

function formatCpf(raw: string) {
  const digits = raw.replace(/\D/g, '').slice(0, 11)
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

export default function RegisterStep1() {
  const [name, setName] = useState('')
  const [cpf, setCpf] = useState('')
  const [pixKeyType, setPixKeyType] = useState('cpf')
  const [pixKey, setPixKey] = useState('')
  const [loading, setLoading] = useState(false)

  const cpfDigits = cpf.replace(/\D/g, '')
  const isValid = name.trim().length >= 3 && cpfDigits.length === 11 && pixKey.trim().length > 4

  async function handleNext() {
    if (!isValid) return
    setLoading(true)
    try {
      await api.put('/workers/me', {
        full_name: name,
        cpf: cpfDigits,
        pix_key: pixKey,
        pix_key_type: pixKeyType,
      })
      router.push('/register/step2')
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Erro', text2: e.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
      <StepIndicator current={1} total={4} />
      <Text style={s.title}>Dados pessoais</Text>

      <Text style={s.label}>Nome completo</Text>
      <TextInput
        style={s.input}
        value={name}
        onChangeText={setName}
        placeholder="Seu nome"
        autoCapitalize="words"
        autoFocus
      />

      <Text style={s.label}>CPF</Text>
      <TextInput
        style={s.input}
        value={cpf}
        onChangeText={(t) => setCpf(formatCpf(t))}
        placeholder="000.000.000-00"
        keyboardType="numeric"
        maxLength={14}
      />

      <Text style={s.label}>Tipo de chave Pix</Text>
      <View style={s.row}>
        {PIX_TYPES.map((t) => (
          <TouchableOpacity
            key={t.value}
            style={[s.chip, pixKeyType === t.value && s.chipActive]}
            onPress={() => { setPixKeyType(t.value); setPixKey('') }}
          >
            <Text style={[s.chipText, pixKeyType === t.value && s.chipTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={s.label}>Chave Pix</Text>
      <TextInput
        style={s.input}
        value={pixKey}
        onChangeText={setPixKey}
        placeholder={
          pixKeyType === 'cpf' ? '000.000.000-00' :
          pixKeyType === 'phone' ? '+55 (00) 00000-0000' :
          pixKeyType === 'email' ? 'seuemail@email.com' : 'Cole sua chave aleatória'
        }
        keyboardType={pixKeyType === 'email' ? 'email-address' : 'default'}
        autoCapitalize="none"
      />

      <TouchableOpacity style={[s.btn, !isValid && s.btnDisabled]} onPress={handleNext} disabled={!isValid || loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Próximo →</Text>}
      </TouchableOpacity>
    </ScrollView>
  )
}

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 8, marginBottom: 32 }}>
      {Array.from({ length: total }, (_, i) => (
        <View
          key={i}
          style={{
            flex: 1, height: 4, borderRadius: 2,
            backgroundColor: i < current ? '#1D4ED8' : '#E5E7EB',
          }}
        />
      ))}
    </View>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 24, paddingTop: 60 },
  title: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  input: {
    borderWidth: 1.5, borderColor: '#D1D5DB', borderRadius: 12,
    padding: 14, fontSize: 16, color: '#111827', marginBottom: 20,
  },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1.5, borderColor: '#D1D5DB',
  },
  chipActive: { backgroundColor: '#1D4ED8', borderColor: '#1D4ED8' },
  chipText: { fontSize: 14, color: '#6B7280' },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  btn: { backgroundColor: '#1D4ED8', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  btnDisabled: { backgroundColor: '#93C5FD' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
})
