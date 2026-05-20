import { useState, useRef, useEffect } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Svg, Path } from 'react-native-svg'
import Toast from 'react-native-toast-message'
import { useAuthStore } from '../../store/auth'
import { C } from '../../lib/theme'

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

  // Render 6 digit boxes from the hidden input value
  const digits = code.padEnd(6, ' ').split('')

  return (
    <View style={{ flex: 1, backgroundColor: C.navy }}>
      <LinearGradient
        colors={[C.navyLight, C.navy, C.navyDeep]}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={s.glowTR} pointerEvents="none" />

      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
            <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <Path d="M15 6l-6 6 6 6" stroke="#fff" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </TouchableOpacity>

          <View style={s.content}>
            <Text style={s.stepLabel}>Verificação por SMS</Text>
            <Text style={s.title}>Digite o{'\n'}código</Text>
            <Text style={s.subtitle}>
              Enviamos 6 dígitos para{'\n'}
              <Text style={{ color: '#fff', fontWeight: '600' }}>{phone}</Text>
            </Text>

            {/* Hidden real input */}
            <TextInput
              ref={inputRef}
              style={s.hiddenInput}
              value={code}
              onChangeText={(t) => setCode(t.replace(/\D/g, '').slice(0, 6))}
              keyboardType="number-pad"
              maxLength={6}
              caretHidden
            />

            {/* Visual digit boxes */}
            <TouchableOpacity
              style={s.digitsRow}
              onPress={() => inputRef.current?.focus()}
              activeOpacity={1}
            >
              {digits.map((d, i) => (
                <View
                  key={i}
                  style={[
                    s.digitBox,
                    code.length === i && s.digitBoxActive,
                    d.trim() !== '' && s.digitBoxFilled,
                  ]}
                >
                  <Text style={s.digitText}>{d.trim()}</Text>
                </View>
              ))}
            </TouchableOpacity>

            {loading && (
              <View style={s.loadingRow}>
                <ActivityIndicator color={C.jade} size="small" />
                <Text style={s.loadingText}>Verificando…</Text>
              </View>
            )}

            <View style={{ flex: 1 }} />

            <TouchableOpacity
              onPress={handleResend}
              disabled={resendCooldown > 0}
              style={s.resendBtn}
            >
              <Text style={[s.resendText, resendCooldown > 0 && s.resendDisabled]}>
                {resendCooldown > 0
                  ? `Reenviar código em ${resendCooldown}s`
                  : 'Reenviar código'}
              </Text>
            </TouchableOpacity>

            <Text style={s.hint}>
              Não recebeu? Verifique sua caixa de mensagens ou aguarde até 2 minutos.
            </Text>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  )
}

const s = StyleSheet.create({
  glowTR: {
    position: 'absolute',
    top: -140,
    right: -120,
    width: 420,
    height: 420,
    borderRadius: 210,
    backgroundColor: 'rgba(0,196,140,0.12)',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 12,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 24,
  },
  stepLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.55)',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -1.2,
    lineHeight: 40,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: 'rgba(248,249,252,0.62)',
    marginBottom: 36,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
  digitsRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
  },
  digitBox: {
    width: 48,
    height: 58,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  digitBoxActive: {
    borderColor: C.jade,
    backgroundColor: 'rgba(0,196,140,0.10)',
  },
  digitBoxFilled: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderColor: 'rgba(255,255,255,0.3)',
  },
  digitText: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
  },
  loadingText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  resendBtn: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  resendText: {
    fontSize: 15,
    fontWeight: '600',
    color: C.jade,
  },
  resendDisabled: {
    color: 'rgba(255,255,255,0.4)',
  },
  hint: {
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 18,
    color: 'rgba(248,249,252,0.35)',
  },
})
