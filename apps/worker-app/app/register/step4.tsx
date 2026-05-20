import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Svg, Path } from 'react-native-svg'
import Toast from 'react-native-toast-message'
import { api } from '../../lib/api'
import { C } from '../../lib/theme'

function StepBar({ step }: { step: number }) {
  const insets = useSafeAreaInsets()
  return (
    <View style={{ paddingTop: insets.top + 12, paddingHorizontal: 20, backgroundColor: C.surface2 }}>
      <View style={bar.topRow}>
        <TouchableOpacity style={bar.backBtn} onPress={() => router.back()}>
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path d="M15 6l-6 6 6 6" stroke={C.text} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </TouchableOpacity>
        <Text style={bar.label}>Cadastro · Etapa {step} de 4</Text>
        <TouchableOpacity onPress={() => router.replace('/(auth)/phone')}>
          <Text style={bar.exit}>Sair</Text>
        </TouchableOpacity>
      </View>
      <View style={bar.segments}>
        {[1, 2, 3, 4].map(i => (
          <View key={i} style={[bar.seg, i <= step ? bar.segOn : bar.segOff]} />
        ))}
      </View>
    </View>
  )
}

const bar = StyleSheet.create({
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingBottom: 14 },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: C.surface3, alignItems: 'center', justifyContent: 'center',
  },
  label: { flex: 1, textAlign: 'center', fontSize: 11.5, fontWeight: '700', color: C.textSoft, letterSpacing: 0.6, textTransform: 'uppercase' },
  exit: { fontSize: 13, fontWeight: '600', color: C.textMute, paddingHorizontal: 8, paddingVertical: 4 },
  segments: { flexDirection: 'row', gap: 6, paddingBottom: 2 },
  seg: { flex: 1, height: 5, borderRadius: 3 },
  segOn: { backgroundColor: C.navy },
  segOff: { backgroundColor: C.line },
})

function Field({ label, value, onChange, placeholder, keyboardType = 'default' }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; keyboardType?: any
}) {
  const [focus, setFocus] = useState(false)
  return (
    <View style={[f.box, focus && f.boxFocus]}>
      <Text style={[f.lbl, focus && f.lblFocus]}>{label}</Text>
      <TextInput
        style={f.input}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={C.textSoft}
        keyboardType={keyboardType}
        autoCapitalize="none"
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
      />
    </View>
  )
}

const f = StyleSheet.create({
  box: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1.5, borderColor: C.line, padding: 12 },
  boxFocus: { borderColor: C.navy },
  lbl: { fontSize: 11, fontWeight: '700', color: C.textSoft, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 4 },
  lblFocus: { color: C.navy },
  input: { fontSize: 15, fontWeight: '600', color: C.text },
})

const PIX_TYPES = [
  { id: 'cpf',      label: 'CPF' },
  { id: 'phone',    label: 'Telefone' },
  { id: 'email',    label: 'E-mail' },
  { id: 'random',   label: 'Aleatória' },
]

const PIX_PLACEHOLDERS: Record<string, string> = {
  cpf:    '000.000.000-00',
  phone:  '(46) 9 9999-9999',
  email:  'seu@email.com',
  random: 'chave aleatória',
}

const ESCROW_STEPS = [
  { n: '1', text: 'A empresa reserva o valor antes do turno',   color: C.navy },
  { n: '2', text: 'Você trabalha · o dinheiro fica protegido', color: '#FF6B35' },
  { n: '3', text: 'Após o check-out, cai no seu Pix em até 1h', color: C.jadeDeep },
]

export default function RegisterStep4() {
  const [pixType, setPixType] = useState('cpf')
  const [pixKey, setPixKey] = useState('')
  const [terms, setTerms] = useState(true)
  const [loading, setLoading] = useState(false)

  const canFinish = pixKey.trim().length > 4 && terms

  async function handleFinish() {
    if (!canFinish) return
    setLoading(true)
    try {
      await api.put('/workers/me', {
        pix_key: pixKey,
        pix_key_type: pixType,
      })
      router.replace('/(tabs)')
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Erro', text2: e.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.surface2 }}>
      <StepBar step={4} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 160 }} keyboardShouldPersistTaps="handled">
          <Text style={s.title}>Onde você recebe?</Text>
          <Text style={s.subtitle}>Sua chave Pix para receber o pagamento dos turnos.</Text>

          {/* Pix type selector */}
          <View style={s.typeSelector}>
            {PIX_TYPES.map(t => {
              const active = pixType === t.id
              return (
                <TouchableOpacity
                  key={t.id}
                  style={[s.typeBtn, active && s.typeBtnActive]}
                  onPress={() => { setPixType(t.id); setPixKey('') }}
                  activeOpacity={0.8}
                >
                  <Text style={[s.typeBtnText, active && s.typeBtnTextActive]}>{t.label}</Text>
                </TouchableOpacity>
              )
            })}
          </View>

          {/* Key input */}
          <View style={{ marginTop: 14 }}>
            <Field
              label={`Chave Pix · ${PIX_TYPES.find(t => t.id === pixType)?.label}`}
              value={pixKey}
              onChange={setPixKey}
              placeholder={PIX_PLACEHOLDERS[pixType]}
              keyboardType={pixType === 'email' ? 'email-address' : pixType === 'phone' ? 'phone-pad' : 'default'}
            />
          </View>

          {/* Escrow explainer */}
          <View style={s.escrow}>
            <View style={s.escrowHeader}>
              <View style={s.escrowIconWrap}>
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                  <Path d="M6 10V8a6 6 0 1 1 12 0v2M5 10h14v10H5z" stroke={C.jadeDeep} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </View>
              <Text style={s.escrowTitle}>Como funciona o escrow</Text>
            </View>
            <View style={{ gap: 10, marginTop: 14 }}>
              {ESCROW_STEPS.map((step, i) => (
                <View key={i} style={s.escrowRow}>
                  <View style={[s.escrowNum, { backgroundColor: step.color }]}>
                    <Text style={s.escrowNumText}>{step.n}</Text>
                  </View>
                  <Text style={s.escrowText}>{step.text}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Terms */}
          <TouchableOpacity
            style={s.terms}
            onPress={() => setTerms(v => !v)}
            activeOpacity={0.8}
          >
            <View style={[s.checkbox, terms && s.checkboxOn]}>
              {terms && (
                <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                  <Path d="M5 12l4 4L19 7" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              )}
            </View>
            <Text style={s.termsText}>
              Aceito os{' '}
              <Text style={s.termsLink}>termos de uso</Text>
              {' '}e{' '}
              <Text style={s.termsLink}>política de privacidade</Text>
              {' '}do Laboro.
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={s.cta}>
        <TouchableOpacity
          style={[s.ctaBtn, !canFinish && s.ctaBtnDisabled, canFinish && s.ctaBtnJade]}
          onPress={handleFinish}
          disabled={!canFinish || loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color={C.jadeInk} />
          ) : (
            <>
              <Text style={[s.ctaText, canFinish && s.ctaTextJade]}>Concluir cadastro</Text>
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <Path d="M9 6l6 6-6 6" stroke={canFinish ? C.jadeInk : '#fff'} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </>
          )}
        </TouchableOpacity>
        <Text style={s.subText}>R$ 0,00 para começar · sem mensalidade</Text>
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  title: { fontSize: 26, fontWeight: '800', color: C.text, letterSpacing: -0.8, lineHeight: 30 },
  subtitle: { fontSize: 14.5, color: C.textMute, marginTop: 6, lineHeight: 20 },
  typeSelector: {
    marginTop: 22, backgroundColor: '#fff', borderRadius: 14, padding: 4,
    borderWidth: 1, borderColor: C.line,
    flexDirection: 'row', gap: 2,
  },
  typeBtn: {
    flex: 1, borderRadius: 11, paddingVertical: 10, paddingHorizontal: 4,
    alignItems: 'center',
  },
  typeBtnActive: { backgroundColor: C.navy },
  typeBtnText: { fontSize: 11.5, fontWeight: '700', color: C.text, letterSpacing: 0.1 },
  typeBtnTextActive: { color: '#fff' },
  escrow: {
    marginTop: 22,
    backgroundColor: '#F7FFFB',
    borderWidth: 1, borderColor: 'rgba(0,196,140,0.2)',
    borderRadius: 16, padding: 16,
  },
  escrowHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  escrowIconWrap: {
    width: 40, height: 40, borderRadius: 11,
    backgroundColor: '#fff', borderWidth: 1, borderColor: 'rgba(0,196,140,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  escrowTitle: { fontSize: 16, fontWeight: '800', color: C.jadeInk, letterSpacing: -0.3 },
  escrowRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  escrowNum: {
    width: 22, height: 22, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  escrowNumText: { fontSize: 12, fontWeight: '800', color: '#fff' },
  escrowText: { flex: 1, fontSize: 13.5, color: C.text, fontWeight: '500', lineHeight: 19, paddingTop: 2 },
  terms: {
    marginTop: 18, padding: 12,
    backgroundColor: C.surface3, borderRadius: 12,
    flexDirection: 'row', gap: 10, alignItems: 'center',
  },
  checkbox: {
    width: 20, height: 20, borderRadius: 6,
    borderWidth: 1.5, borderColor: C.navy,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  checkboxOn: { backgroundColor: C.navy },
  termsText: { flex: 1, fontSize: 12.5, color: C.textMute, lineHeight: 18 },
  termsLink: { color: C.navy, fontWeight: '700' },
  cta: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 20, paddingBottom: 36,
    backgroundColor: C.surface2,
  },
  ctaBtn: {
    backgroundColor: C.navy, borderRadius: 18, paddingVertical: 15,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    shadowColor: C.navy, shadowOffset: { width: 0, height: 14 }, shadowOpacity: 0.35, shadowRadius: 26, elevation: 8,
  },
  ctaBtnDisabled: { backgroundColor: '#C7CBD9', shadowOpacity: 0, elevation: 0 },
  ctaBtnJade: {
    backgroundColor: C.jade,
    shadowColor: C.jade,
  },
  ctaText: { fontSize: 15, fontWeight: '700', color: '#fff', letterSpacing: -0.1 },
  ctaTextJade: { color: C.jadeInk },
  subText: { textAlign: 'center', marginTop: 8, fontSize: 12, color: C.textMute },
})
