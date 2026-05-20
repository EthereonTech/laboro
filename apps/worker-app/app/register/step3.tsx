import { useState } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator,
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

const DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
const PERIODS = [
  { id: 'manha', label: 'Manhã',  sub: '6h–12h' },
  { id: 'tarde', label: 'Tarde',  sub: '12h–18h' },
  { id: 'noite', label: 'Noite',  sub: '18h–02h' },
]

type AvailMap = Record<string, boolean>

export default function RegisterStep3() {
  const [avail, setAvail] = useState<AvailMap>({})
  const [loading, setLoading] = useState(false)

  function toggle(day: string, period: string) {
    const key = `${day}-${period}`
    setAvail(prev => ({ ...prev, [key]: !prev[key] }))
  }

  function togglePeriod(period: string) {
    const allOn = DAYS.every(d => avail[`${d}-${period}`])
    const updated: AvailMap = { ...avail }
    DAYS.forEach(d => { updated[`${d}-${period}`] = !allOn })
    setAvail(updated)
  }

  const total = Object.values(avail).filter(Boolean).length

  async function handleNext() {
    setLoading(true)
    try {
      const slots = Object.entries(avail)
        .filter(([, v]) => v)
        .map(([k]) => {
          const [day, period] = k.split('-')
          return { day, period }
        })
      // Availability endpoint may not exist yet — fail gracefully
      await api.put('/workers/me/availability', { slots }).catch(() => {})
      router.push('/register/step4')
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Erro', text2: e.message })
    } finally {
      setLoading(false)
    }
  }

  // Day header cell width
  const DAY_COL = 34
  const LABEL_COL = 72

  return (
    <View style={{ flex: 1, backgroundColor: C.surface2 }}>
      <StepBar step={3} />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 140 }}>
        <Text style={s.title}>Quando você trabalha?</Text>
        <Text style={s.subtitle}>Marque os turnos disponíveis. Pode editar depois.</Text>

        <View style={s.grid}>
          {/* Day header row */}
          <View style={s.row}>
            <View style={{ width: LABEL_COL }} />
            {DAYS.map(d => (
              <View key={d} style={{ width: DAY_COL, alignItems: 'center' }}>
                <Text style={s.dayLabel}>{d}</Text>
              </View>
            ))}
          </View>

          {PERIODS.map((p, pi) => (
            <View key={p.id} style={[s.row, pi < PERIODS.length - 1 && s.rowBorder]}>
              <TouchableOpacity style={{ width: LABEL_COL }} onPress={() => togglePeriod(p.id)}>
                <Text style={s.periodLabel}>{p.label}</Text>
                <Text style={s.periodSub}>{p.sub}</Text>
              </TouchableOpacity>
              {DAYS.map(d => {
                const on = !!avail[`${d}-${p.id}`]
                return (
                  <TouchableOpacity
                    key={d}
                    style={[s.cell, on && s.cellOn]}
                    onPress={() => toggle(d, p.id)}
                    activeOpacity={0.75}
                  >
                    {on && (
                      <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                        <Path d="M5 12l4 4L19 7" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
                      </Svg>
                    )}
                  </TouchableOpacity>
                )
              })}
            </View>
          ))}
        </View>

        <Text style={s.countText}>
          <Text style={{ color: C.text, fontWeight: '700' }}>{total}</Text> turnos selecionados
        </Text>
      </ScrollView>

      <View style={s.cta}>
        <TouchableOpacity
          style={s.ctaBtn}
          onPress={handleNext}
          disabled={loading}
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
  grid: {
    marginTop: 22, backgroundColor: '#fff', borderRadius: 18, padding: 14,
    borderWidth: 1, borderColor: C.line,
  },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingVertical: 10,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: C.lineSoft },
  dayLabel: { fontSize: 11, fontWeight: '700', color: C.textMute, letterSpacing: 0.3, textTransform: 'uppercase' },
  periodLabel: { fontSize: 12.5, fontWeight: '700', color: C.text },
  periodSub: { fontSize: 10, color: C.textSoft, marginTop: 1 },
  cell: {
    width: 34, height: 32, borderRadius: 8,
    backgroundColor: C.surface3,
    alignItems: 'center', justifyContent: 'center',
  },
  cellOn: { backgroundColor: C.navy },
  countText: { marginTop: 14, fontSize: 12.5, color: C.textMute, textAlign: 'center' },
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
  ctaText: { fontSize: 15, fontWeight: '700', color: '#fff', letterSpacing: -0.1 },
})
