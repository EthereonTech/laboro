import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Switch, Alert,
} from 'react-native'
import { router } from 'expo-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import Toast from 'react-native-toast-message'
import { api } from '../../lib/api'
import { formatCurrency, specialtyLabel } from '../../lib/format'

const SPECIALTIES = ['garcom', 'bartender', 'aux_cozinha', 'promotor', 'caixa', 'repositor', 'cuidador', 'aux_logistica']

function pad(n: number) { return String(n).padStart(2, '0') }

function toIso(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00.000Z`
}

export default function CreateShiftScreen() {
  const queryClient = useQueryClient()

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(8, 0, 0, 0)

  const tomorrowEnd = new Date(tomorrow)
  tomorrowEnd.setHours(16, 0, 0, 0)

  const [specialty, setSpecialty] = useState('')
  const [slots, setSlots] = useState('1')
  const [ratePerHour, setRatePerHour] = useState('')
  const [startsAt, setStartsAt] = useState(tomorrow)
  const [endsAt, setEndsAt] = useState(tomorrowEnd)
  const [instructions, setInstructions] = useState('')
  const [isUrgent, setIsUrgent] = useState(false)

  const hours = (endsAt.getTime() - startsAt.getTime()) / 3600000
  const rate = parseFloat(ratePerHour) || 0
  const totalValue = hours > 0 ? hours * rate * parseInt(slots || '1') : 0
  const laboroFee = totalValue * 0.18
  const workerAmount = totalValue - laboroFee

  const isValid = specialty !== '' && rate > 0 && hours > 0 && parseInt(slots) >= 1

  const createMutation = useMutation({
    mutationFn: () => api.post('/shifts', {
      specialty,
      slots: parseInt(slots),
      rate_per_hour: rate,
      starts_at: toIso(startsAt),
      ends_at: toIso(endsAt),
      instructions: instructions.trim() || undefined,
      is_urgent: isUrgent,
    }),
    onSuccess: () => {
      Toast.show({ type: 'success', text1: 'Vaga criada! 🎉', text2: 'Trabalhadores serão notificados.' })
      queryClient.invalidateQueries({ queryKey: ['my-shifts'] })
      queryClient.invalidateQueries({ queryKey: ['business-dashboard'] })
      router.back()
    },
    onError: (e: any) => {
      Toast.show({ type: 'error', text1: 'Erro ao criar vaga', text2: e.message })
    },
  })

  function adjustTime(field: 'start' | 'end', direction: 'hours' | 'minutes', delta: number) {
    const setter = field === 'start' ? setStartsAt : setEndsAt
    const current = field === 'start' ? startsAt : endsAt
    const next = new Date(current)
    if (direction === 'hours') next.setHours(next.getHours() + delta)
    else next.setMinutes(next.getMinutes() + delta)
    setter(next)
  }

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Nova Vaga</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">

        {/* Especialidade */}
        <Label>Especialidade</Label>
        <View style={s.grid}>
          {SPECIALTIES.map((sp) => (
            <TouchableOpacity key={sp} style={[s.chip, specialty === sp && s.chipActive]} onPress={() => setSpecialty(sp)}>
              <Text style={[s.chipText, specialty === sp && s.chipTextActive]}>{specialtyLabel(sp)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Vagas e valor */}
        <View style={s.row}>
          <View style={{ flex: 1 }}>
            <Label>Nº de vagas</Label>
            <TextInput style={s.input} value={slots} onChangeText={setSlots} keyboardType="number-pad" />
          </View>
          <View style={{ flex: 2 }}>
            <Label>Valor por hora (R$)</Label>
            <TextInput style={s.input} value={ratePerHour} onChangeText={setRatePerHour} keyboardType="decimal-pad" placeholder="0,00" />
          </View>
        </View>

        {/* Data/Hora início */}
        <Label>Início do turno</Label>
        <TimeSelector date={startsAt} onAdjust={(dir, delta) => adjustTime('start', dir, delta)} />

        {/* Data/Hora fim */}
        <Label>Fim do turno</Label>
        <TimeSelector date={endsAt} onAdjust={(dir, delta) => adjustTime('end', dir, delta)} />

        {/* Urgente */}
        <View style={s.switchRow}>
          <View>
            <Text style={s.switchLabel}>Vaga urgente</Text>
            <Text style={s.switchSub}>Aparece em destaque no app do trabalhador</Text>
          </View>
          <Switch value={isUrgent} onValueChange={setIsUrgent} trackColor={{ true: '#065F46' }} />
        </View>

        {/* Instruções */}
        <Label>Instruções (opcional)</Label>
        <TextInput
          style={[s.input, { minHeight: 80, textAlignVertical: 'top' }]}
          value={instructions}
          onChangeText={setInstructions}
          multiline
          placeholder="Uniforme, habilidades específicas, pontos de atenção..."
          maxLength={500}
        />

        {/* Resumo financeiro */}
        {totalValue > 0 && (
          <View style={s.summaryCard}>
            <Text style={s.summaryTitle}>Resumo financeiro</Text>
            <SummaryRow label="Total da vaga" value={formatCurrency(totalValue)} bold />
            <SummaryRow label="Taxa Laboro (18%)" value={`- ${formatCurrency(laboroFee)}`} />
            <SummaryRow label="Repasse ao trabalhador" value={formatCurrency(workerAmount)} color="#065F46" />
            <Text style={s.summaryHint}>Duração: {hours.toFixed(1)}h · {slots} vaga{parseInt(slots) !== 1 ? 's' : ''}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[s.btn, (!isValid || createMutation.isPending) && s.btnDisabled]}
          onPress={() => createMutation.mutate()}
          disabled={!isValid || createMutation.isPending}
        >
          {createMutation.isPending
            ? <ActivityIndicator color="#fff" />
            : <Text style={s.btnText}>Publicar vaga 🚀</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>{children}</Text>
}

function TimeSelector({ date, onAdjust }: { date: Date; onAdjust: (dir: 'hours' | 'minutes', delta: number) => void }) {
  return (
    <View style={ts.container}>
      <Stepper value={pad(date.getHours())} onInc={() => onAdjust('hours', 1)} onDec={() => onAdjust('hours', -1)} label="h" />
      <Text style={ts.sep}>:</Text>
      <Stepper value={pad(date.getMinutes())} onInc={() => onAdjust('minutes', 15)} onDec={() => onAdjust('minutes', -15)} label="min" />
      <Text style={ts.date}>
        {date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
      </Text>
    </View>
  )
}

function Stepper({ value, onInc, onDec, label }: { value: string; onInc: () => void; onDec: () => void; label: string }) {
  return (
    <View style={st.container}>
      <TouchableOpacity onPress={onInc} style={st.btn}><Text style={st.arrow}>▲</Text></TouchableOpacity>
      <Text style={st.value}>{value}</Text>
      <TouchableOpacity onPress={onDec} style={st.btn}><Text style={st.arrow}>▼</Text></TouchableOpacity>
    </View>
  )
}

function SummaryRow({ label, value, bold, color }: { label: string; value: string; bold?: boolean; color?: string }) {
  return (
    <View style={sr.row}>
      <Text style={sr.label}>{label}</Text>
      <Text style={[sr.value, bold && { fontWeight: '800' }, color ? { color } : {}]}>{value}</Text>
    </View>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },
  content: { padding: 16, gap: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  chip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, borderWidth: 1.5, borderColor: '#D1D5DB', backgroundColor: '#fff' },
  chipActive: { backgroundColor: '#065F46', borderColor: '#065F46' },
  chipText: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  chipTextActive: { color: '#fff', fontWeight: '700' },
  row: { flexDirection: 'row', gap: 12, marginBottom: 4 },
  input: { borderWidth: 1.5, borderColor: '#D1D5DB', borderRadius: 12, padding: 13, fontSize: 15, color: '#111827', backgroundColor: '#fff', marginBottom: 16 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 16 },
  switchLabel: { fontSize: 15, fontWeight: '600', color: '#111827' },
  switchSub: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  summaryCard: { backgroundColor: '#ECFDF5', borderRadius: 14, padding: 16, marginBottom: 16 },
  summaryTitle: { fontSize: 14, fontWeight: '700', color: '#065F46', marginBottom: 12 },
  summaryHint: { fontSize: 12, color: '#6B7280', marginTop: 8 },
  btn: { backgroundColor: '#065F46', borderRadius: 14, padding: 18, alignItems: 'center', marginTop: 8, marginBottom: 24 },
  btnDisabled: { backgroundColor: '#6EE7B7' },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
})

const ts = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 16, gap: 8 },
  sep: { fontSize: 24, fontWeight: '700', color: '#374151' },
  date: { marginLeft: 'auto', fontSize: 14, color: '#9CA3AF' },
})

const st = StyleSheet.create({
  container: { alignItems: 'center', gap: 4 },
  btn: { padding: 4 },
  arrow: { fontSize: 12, color: '#6B7280' },
  value: { fontSize: 28, fontWeight: '800', color: '#111827', minWidth: 48, textAlign: 'center' },
})

const sr = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  label: { fontSize: 14, color: '#374151' },
  value: { fontSize: 14, color: '#111827', fontWeight: '600' },
})
