import { useState, useRef } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Image, Alert,
  KeyboardAvoidingView, Platform,
} from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Svg, Path } from 'react-native-svg'
import * as ImagePicker from 'expo-image-picker'
import Toast from 'react-native-toast-message'
import { api } from '../../lib/api'
import { C } from '../../lib/theme'

function formatCpf(raw: string) {
  const d = raw.replace(/\D/g, '').slice(0, 11)
  return d.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

function formatPhone(raw: string) {
  const d = raw.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d.replace(/(\d{1,2})/, '($1')
  if (d.length <= 7) return d.replace(/(\d{2})(\d{1,5})/, '($1) $2')
  if (d.length <= 10) return d.replace(/(\d{2})(\d{4})(\d{1,4})/, '($1) $2-$3')
  return d.replace(/(\d{2})(\d{5})(\d{1,4})/, '($1) $2-$3')
}

function formatDate(raw: string) {
  const d = raw.replace(/\D/g, '').slice(0, 8)
  if (d.length <= 2) return d
  if (d.length <= 4) return d.replace(/(\d{2})(\d{1,2})/, '$1/$2')
  return d.replace(/(\d{2})(\d{2})(\d{1,4})/, '$1/$2/$3')
}

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
    backgroundColor: C.surface3,
    alignItems: 'center', justifyContent: 'center',
  },
  label: { flex: 1, textAlign: 'center', fontSize: 11.5, fontWeight: '700', color: C.textSoft, letterSpacing: 0.6, textTransform: 'uppercase' },
  exit: { fontSize: 13, fontWeight: '600', color: C.textMute, paddingHorizontal: 8, paddingVertical: 4 },
  segments: { flexDirection: 'row', gap: 6, paddingBottom: 2 },
  seg: { flex: 1, height: 5, borderRadius: 3 },
  segOn: { backgroundColor: C.navy },
  segOff: { backgroundColor: C.line },
})

function Field({ label, value, onChange, placeholder, keyboardType = 'default', maxLength }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; keyboardType?: any; maxLength?: number
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
        maxLength={maxLength}
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

export default function RegisterStep1() {
  const [name, setName] = useState('')
  const [cpf, setCpf] = useState('')
  const [phone, setPhone] = useState('')
  const [dob, setDob] = useState('')
  const [photoUri, setPhotoUri] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const cpfDigits = cpf.replace(/\D/g, '')
  const canContinue = name.trim().length >= 3 && cpfDigits.length === 11 && phone.replace(/\D/g, '').length >= 10

  async function pickPhoto() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos acessar sua galeria para enviar a foto.')
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })
    if (!result.canceled) setPhotoUri(result.assets[0].uri)
  }

  async function handleNext() {
    if (!canContinue) return
    setLoading(true)
    try {
      await api.put('/workers/me', {
        full_name: name,
        cpf: cpfDigits,
      })
      if (photoUri) {
        const form = new FormData()
        form.append('photo', { uri: photoUri, name: 'photo.jpg', type: 'image/jpeg' } as any)
        await api.postForm('/workers/me/photo', form)
      }
      router.push('/register/step2')
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Erro', text2: e.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.surface2 }}>
      <StepBar step={1} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 140 }} keyboardShouldPersistTaps="handled">
          <Text style={s.title}>Vamos te conhecer</Text>
          <Text style={s.subtitle}>Seus dados são usados pra confirmar identidade e liberar pagamento Pix.</Text>

          {/* Avatar */}
          <View style={{ alignItems: 'center', marginTop: 24, marginBottom: 20 }}>
            <TouchableOpacity style={s.avatarBtn} onPress={pickPhoto} activeOpacity={0.8}>
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={s.avatarImg} />
              ) : (
                <>
                  <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M4 7h3l2-3h6l2 3h3a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1Zm8 11a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Z"
                      stroke={C.navy} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
                    />
                  </Svg>
                  <Text style={s.avatarLabel}>Foto</Text>
                </>
              )}
              <View style={s.avatarPlus}>
                <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700', lineHeight: 22 }}>+</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={{ gap: 10 }}>
            <Field label="Nome completo" value={name} onChange={setName} placeholder="ex: Júlio Santos" />
            <Field label="CPF" value={cpf} onChange={v => setCpf(formatCpf(v))} placeholder="000.000.000-00" keyboardType="numeric" maxLength={14} />
            <Field label="Telefone (WhatsApp)" value={phone} onChange={v => setPhone(formatPhone(v))} placeholder="(46) 9 9999-9999" keyboardType="phone-pad" maxLength={16} />
            <Field label="Data de nascimento" value={dob} onChange={v => setDob(formatDate(v))} placeholder="DD/MM/AAAA" keyboardType="numeric" maxLength={10} />
          </View>

          <View style={s.notice}>
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              <Path d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6l8-3Z" stroke={C.navy} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
            <Text style={s.noticeText}>
              Seus dados são criptografados e usados apenas para validar sua identidade e processar pagamentos.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Sticky CTA */}
      <View style={s.cta}>
        <TouchableOpacity
          style={[s.ctaBtn, !canContinue && s.ctaBtnDisabled]}
          onPress={handleNext}
          disabled={!canContinue || loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={s.ctaText}>Continuar</Text>
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <Path d="M9 6l6 6-6 6" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  title: { fontSize: 26, fontWeight: '800', color: C.text, letterSpacing: -0.8, lineHeight: 30 },
  subtitle: { fontSize: 14.5, color: C.textMute, marginTop: 6, lineHeight: 20 },
  avatarBtn: {
    width: 110, height: 110, borderRadius: 55,
    backgroundColor: C.surface3,
    borderWidth: 2, borderColor: C.line, borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center', gap: 4,
    position: 'relative', overflow: 'visible',
  },
  avatarImg: { width: 110, height: 110, borderRadius: 55 },
  avatarLabel: { fontSize: 11, fontWeight: '700', color: C.navy, letterSpacing: 0.3, textTransform: 'uppercase' },
  avatarPlus: {
    position: 'absolute', bottom: 0, right: 0,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: C.jade,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: C.surface2,
  },
  notice: {
    marginTop: 18, padding: 12, backgroundColor: C.surface3,
    borderRadius: 12, flexDirection: 'row', gap: 10, alignItems: 'flex-start',
  },
  noticeText: { flex: 1, fontSize: 12, color: C.textMute, lineHeight: 17 },
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
  ctaBtnDisabled: { backgroundColor: '#C7CBD9', shadowOpacity: 0 },
  ctaText: { fontSize: 15, fontWeight: '700', color: '#fff', letterSpacing: -0.1 },
})
