import { useState, useRef, useEffect } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import Toast from 'react-native-toast-message'
import { useAuthStore } from '../../store/auth'

export default function OtpScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(60)
  const inputRef = useRef<TextInput>(null)
  const { verifyOtp, sendOtp } = useAuthStore()

  useEffect(() => {
    inputRef.current?.focus()
    const timer = setInterval(() => setResendCooldown((c) => Math.max(0, c - 1)), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (code.length === 6) handleVerify(code)
  }, [code])

  async function handleVerify(otp: string) {
    setLoading(true)
    try {
      const { isNew } = await verifyOtp(phone, otp)
      if (isNew) {
        router.replace('/register/step1')
      } else {
        router.replace('/(tabs)')
      }
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Código inválido', text2: e.message })
      setCode('')
      inputRef.current?.focus()
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    if (resendCooldown > 0) return
    try {
      await sendOtp(phone)
      setResendCooldown(60)
      Toast.show({ type: 'success', text1: 'Código reenviado!' })
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Erro', text2: e.message })
    }
  }

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={s.content}>
        <TouchableOpacity onPress={() => router.back()} style={s.back}>
          <Text style={s.backText}>← Voltar</Text>
        </TouchableOpacity>

        <Text style={s.title}>Digite o código</Text>
        <Text style={s.subtitle}>
          Enviamos um SMS para {phone}
        </Text>

        <TextInput
          ref={inputRef}
          style={s.input}
          value={code}
          onChangeText={(t) => setCode(t.replace(/\D/g, '').slice(0, 6))}
          keyboardType="number-pad"
          maxLength={6}
          textAlign="center"
        />

        {loading && <ActivityIndicator color="#1D4ED8" style={{ marginTop: 16 }} />}

        <TouchableOpacity onPress={handleResend} disabled={resendCooldown > 0} style={s.resend}>
          <Text style={[s.resendText, resendCooldown > 0 && s.resendDisabled]}>
            {resendCooldown > 0 ? `Reenviar em ${resendCooldown}s` : 'Reenviar código'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flex: 1, padding: 24, justifyContent: 'center' },
  back: { position: 'absolute', top: 60, left: 24 },
  backText: { color: '#1D4ED8', fontSize: 16 },
  title: { fontSize: 24, fontWeight: '700', color: '#111827', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#6B7280', marginBottom: 40 },
  input: {
    borderWidth: 2,
    borderColor: '#1D4ED8',
    borderRadius: 12,
    padding: 20,
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: 12,
    marginBottom: 24,
  },
  resend: { alignItems: 'center', marginTop: 16 },
  resendText: { color: '#1D4ED8', fontSize: 15, fontWeight: '600' },
  resendDisabled: { color: '#9CA3AF' },
})
