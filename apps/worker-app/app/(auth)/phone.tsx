import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native'
import { router } from 'expo-router'
import Toast from 'react-native-toast-message'
import { useAuthStore } from '../../store/auth'

export default function PhoneScreen() {
  const [phone, setPhone] = useState('+55')
  const [loading, setLoading] = useState(false)
  const sendOtp = useAuthStore((s) => s.sendOtp)

  function formatPhone(raw: string) {
    const digits = raw.replace(/\D/g, '')
    if (digits.length <= 2) return `+${digits}`
    if (digits.length <= 4) return `+${digits.slice(0, 2)} (${digits.slice(2)}`
    if (digits.length <= 9) return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4)}`
    return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4, 9)}-${digits.slice(9, 13)}`
  }

  const rawPhone = () => '+' + phone.replace(/\D/g, '')
  const isValid = phone.replace(/\D/g, '').length === 13 // 55 + DDD + 9 digits

  async function handleContinue() {
    if (!isValid) return
    setLoading(true)
    try {
      await sendOtp(rawPhone())
      router.push({ pathname: '/(auth)/otp', params: { phone: rawPhone() } })
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Erro', text2: e.message ?? 'Não foi possível enviar o código' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={s.content}>
        <Text style={s.logo}>Laboro</Text>
        <Text style={s.title}>Qual é o seu celular?</Text>
        <Text style={s.subtitle}>Você receberá um código de verificação por SMS.</Text>

        <TextInput
          style={s.input}
          value={phone}
          onChangeText={(t) => setPhone(formatPhone(t))}
          keyboardType="phone-pad"
          maxLength={19}
          autoFocus
          placeholderTextColor="#9CA3AF"
        />

        <TouchableOpacity
          style={[s.btn, !isValid && s.btnDisabled]}
          onPress={handleContinue}
          disabled={!isValid || loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={s.btnText}>Continuar</Text>}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flex: 1, padding: 24, justifyContent: 'center' },
  logo: { fontSize: 32, fontWeight: '800', color: '#1D4ED8', marginBottom: 32 },
  title: { fontSize: 24, fontWeight: '700', color: '#111827', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#6B7280', marginBottom: 32 },
  input: {
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    color: '#111827',
    marginBottom: 16,
    letterSpacing: 1,
  },
  btn: {
    backgroundColor: '#1D4ED8',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  btnDisabled: { backgroundColor: '#93C5FD' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
})
