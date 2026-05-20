import { useState } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator,
} from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Svg, Path, G, Rect, Circle } from 'react-native-svg'
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

function SpecIcon({ id, active }: { id: string; active: boolean }) {
  const stroke = active ? '#fff' : C.navy
  const sw = 1.7
  const fill = 'none'
  return (
    <Svg width={28} height={28} viewBox="0 0 24 24" fill={fill}>
      {id === 'garcom' && (
        <G>
          <Path d="M8 4h8v4a4 4 0 0 1-8 0V4Z" fill={stroke} />
          <Rect x="11" y="8" width="2" height="10" fill={stroke} />
          <Rect x="6" y="18" width="12" height="2" rx="1" fill={stroke} />
        </G>
      )}
      {id === 'bartender' && (
        <Path d="M5 4h14l-6 7v6h3v2H8v-2h3v-6L5 4Z" stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
      )}
      {id === 'cozinha' && (
        <G>
          <Rect x="4" y="13" width="16" height="7" rx="1.5" stroke={stroke} strokeWidth={sw} />
          <Path d="M7 13V8a5 5 0 0 1 10 0v5M8 8a3 3 0 1 1 4-2.7M16 8a3 3 0 1 0-4-2.7" stroke={stroke} strokeWidth={sw} />
        </G>
      )}
      {id === 'promotor' && (
        <G>
          <Path d="M4 11l13-6v14L4 13v-2Z" stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
          <Rect x="2" y="11" width="2" height="3" fill={stroke} />
          <Path d="M7 14v4l3 .5v-3.7" stroke={stroke} strokeWidth={sw} />
        </G>
      )}
      {id === 'repositor' && (
        <G>
          <Rect x="4" y="5" width="16" height="14" stroke={stroke} strokeWidth={sw} rx="1" />
          <Path d="M4 10h16M4 15h16M9 5v14M15 5v14" stroke={stroke} strokeWidth={1.5} />
        </G>
      )}
      {id === 'caixa' && (
        <G>
          <Rect x="3" y="8" width="18" height="10" rx="1.5" stroke={stroke} strokeWidth={sw} />
          <Circle cx="12" cy="13" r="2.5" stroke={stroke} strokeWidth={sw} />
          <Rect x="5" y="3" width="14" height="3" rx="1" stroke={stroke} strokeWidth={sw} />
        </G>
      )}
      {id === 'limpeza' && (
        <G>
          <Path d="M7 4l4 7h-1l-1 9-3-9h-1l2-7Z" stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
          <Rect x="14" y="12" width="6" height="8" rx="1" stroke={stroke} strokeWidth={sw} />
          <Path d="M14 16h6" stroke={stroke} strokeWidth={1.5} />
        </G>
      )}
      {id === 'recepcao' && (
        <G>
          <Circle cx="12" cy="8" r="3" stroke={stroke} strokeWidth={sw} />
          <Path d="M5 20a7 7 0 0 1 14 0" stroke={stroke} strokeWidth={sw} />
          <Rect x="9" y="14" width="6" height="1.5" rx="0.5" fill={stroke} />
        </G>
      )}
    </Svg>
  )
}

const SPECS = [
  { id: 'garcom',     label: 'Garçom' },
  { id: 'bartender',  label: 'Bartender' },
  { id: 'cozinha',    label: 'Aux. Cozinha' },
  { id: 'promotor',   label: 'Promotor' },
  { id: 'repositor',  label: 'Repositor' },
  { id: 'caixa',      label: 'Caixa' },
  { id: 'limpeza',    label: 'Limpeza' },
  { id: 'recepcao',   label: 'Recepcionista' },
]

export default function RegisterStep2() {
  const [selected, setSelected] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  function toggle(id: string) {
    if (selected.includes(id)) {
      setSelected(prev => prev.filter(x => x !== id))
    } else if (selected.length < 5) {
      setSelected(prev => [...prev, id])
    }
  }

  async function handleNext() {
    if (selected.length === 0) return
    setLoading(true)
    try {
      await api.put('/workers/me/specialties', { specialties: selected })
      router.push('/register/step3')
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Erro', text2: e.message })
    } finally {
      setLoading(false)
    }
  }

  const canContinue = selected.length > 0

  return (
    <View style={{ flex: 1, backgroundColor: C.surface2 }}>
      <StepBar step={2} />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 140 }}>
        <Text style={s.title}>O que você faz?</Text>
        <Text style={s.subtitle}>Escolha até 5 especialidades. Você vai receber vagas combinando com elas.</Text>

        <View style={s.countRow}>
          <Text style={s.count}>{selected.length} de 5 selecionadas</Text>
          {selected.length > 0 && (
            <TouchableOpacity onPress={() => setSelected([])}>
              <Text style={s.clear}>Limpar</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={s.grid}>
          {SPECS.map(sp => {
            const active = selected.includes(sp.id)
            const disabled = !active && selected.length >= 5
            return (
              <TouchableOpacity
                key={sp.id}
                style={[s.card, active && s.cardActive, disabled && s.cardDisabled]}
                onPress={() => toggle(sp.id)}
                activeOpacity={disabled ? 1 : 0.8}
              >
                <View style={[s.iconWrap, active && s.iconWrapActive]}>
                  <SpecIcon id={sp.id} active={active} />
                </View>
                <Text style={[s.cardLabel, active && s.cardLabelActive]}>{sp.label}</Text>
                {active && (
                  <View style={s.checkBadge}>
                    <Svg width={11} height={11} viewBox="0 0 24 24" fill="none">
                      <Path d="M5 12l4 4L19 7" stroke="#fff" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                  </View>
                )}
              </TouchableOpacity>
            )
          })}
        </View>
      </ScrollView>

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
  countRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 },
  count: { fontSize: 12.5, fontWeight: '600', color: C.textMute },
  clear: { fontSize: 12, fontWeight: '600', color: C.navy },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 16 },
  card: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16, padding: 16,
    borderWidth: 1.5, borderColor: C.line,
    alignItems: 'center', gap: 8,
    position: 'relative',
  },
  cardActive: {
    backgroundColor: C.navy,
    borderColor: C.navy,
    shadowColor: C.navy, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 18, elevation: 6,
  },
  cardDisabled: { opacity: 0.4 },
  iconWrap: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: C.surface3,
    alignItems: 'center', justifyContent: 'center',
  },
  iconWrapActive: { backgroundColor: 'rgba(255,255,255,0.15)' },
  cardLabel: { fontSize: 13.5, fontWeight: '700', color: C.text, letterSpacing: -0.1, textAlign: 'center' },
  cardLabelActive: { color: '#fff' },
  checkBadge: {
    position: 'absolute', top: 8, right: 8,
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: C.jade,
    alignItems: 'center', justifyContent: 'center',
  },
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
