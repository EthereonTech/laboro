import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native'
import { router } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Svg, Path } from 'react-native-svg'
import Toast from 'react-native-toast-message'
import { useAuthStore } from '../../store/auth'
import { C } from '../../lib/theme'

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
  const isValid = phone.replace(/\D/g, '').length === 13

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
          {/* Back button */}
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
            <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <Path d="M15 6l-6 6 6 6" stroke="#fff" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </TouchableOpacity>

          <View style={s.content}>
            {/* Step indicator */}
            <Text style={s.stepLabel}>Entrar na plataforma</Text>

            <Text style={s.title}>Qual é o seu{'\n'}celular?</Text>
            <Text style={s.subtitle}>
              Você receberá um código de 6 dígitos via SMS para confirmar seu acesso.
            </Text>

            {/* Input card */}
            <View style={s.inputCard}>
              <Text style={s.inputLabel}>Número de celular</Text>
              <TextInput
                style={s.input}
                value={phone}
                onChangeText={(t) => setPhone(formatPhone(t))}
                keyboardType="phone-pad"
                maxLength={19}
                autoFocus
                placeholderTextColor={C.textSoft}
                selectionColor={C.jade}
              />
              <Text style={s.inputHint}>Formato: +55 (DDD) 9 0000-0000</Text>
            </View>

            <View style={{ flex: 1 }} />

            {/* CTA */}
            <TouchableOpacity
              style={[s.btn, !isValid && s.btnDisabled]}
              onPress={handleContinue}
              disabled={!isValid || loading}
              activeOpacity={0.88}
            >
              {loading ? (
                <ActivityIndicator color={C.jadeInk} />
              ) : (
                <>
                  <Text style={s.btnText}>Enviar código</Text>
                  <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <Path d="M9 6l6 6-6 6" stroke={C.jadeInk} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                </>
              )}
            </TouchableOpacity>

            <Text style={s.legal}>
              Ao continuar, você concorda com os{' '}
              <Text style={s.legalLink}>Termos de Uso</Text>
              {' '}e{' '}
              <Text style={s.legalLink}>Política de Privacidade</Text>
              {' '}da Laboro.
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
    marginBottom: 32,
  },
  inputCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    borderRadius: 18,
    padding: 18,
  },
  inputLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.55)',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  input: {
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 1,
    paddingVertical: 4,
  },
  inputHint: {
    marginTop: 8,
    fontSize: 12,
    color: 'rgba(255,255,255,0.35)',
  },
  btn: {
    backgroundColor: C.jade,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: C.jade,
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  btnDisabled: {
    backgroundColor: '#C7CBD9',
    shadowOpacity: 0,
    elevation: 0,
  },
  btnText: {
    fontSize: 17,
    fontWeight: '700',
    color: C.jadeInk,
    letterSpacing: -0.3,
  },
  legal: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 12,
    color: 'rgba(248,249,252,0.4)',
    lineHeight: 18,
  },
  legalLink: {
    color: 'rgba(248,249,252,0.7)',
    textDecorationLine: 'underline',
  },
})
