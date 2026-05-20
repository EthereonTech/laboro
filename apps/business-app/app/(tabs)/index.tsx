import { useState } from 'react'
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ScrollView, TextInput, ActivityIndicator, RefreshControl,
  Modal, KeyboardAvoidingView, Platform,
} from 'react-native'
import { router } from 'expo-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Svg, Path } from 'react-native-svg'
import Toast from 'react-native-toast-message'
import { api } from '../../lib/api'
import { C, ICON_PATHS } from '../../lib/theme'
import { formatCurrency, specialtyLabel, formatTime, formatDate } from '../../lib/format'

type Shift = {
  id: string
  specialty: string
  starts_at: string
  ends_at: string
  total_value: number
  status: string
  slots: number
  is_urgent: boolean
  _count?: { applications: number }
  confirmed_count?: number
}

type Business = {
  id: string
  trade_name: string
  score: number
}

function Icon({ d, size = 18, stroke = C.text, sw = 1.8 }: { d: string; size?: number; stroke?: string; sw?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d={d} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; fg: string; dot: string; label: string }> = {
    OPEN:        { bg: '#FFF1E9', fg: '#C2511A', dot: C.orange, label: 'Aberta' },
    FILLED:      { bg: '#E8F3FF', fg: '#1B3FA0', dot: C.navy,   label: 'Preenchida' },
    IN_PROGRESS: { bg: '#E8F8F1', fg: '#00805B', dot: C.jade,   label: 'Em andamento' },
    DONE:        { bg: C.surface3, fg: C.textMute, dot: '#9AA0B7', label: 'Concluída' },
    CANCELLED:   { bg: '#FEE2E2', fg: '#DC2626', dot: '#DC2626', label: 'Cancelada' },
  }
  const m = map[status] ?? map.OPEN
  return (
    <View style={[sb.wrap, { backgroundColor: m.bg }]}>
      <View style={[sb.dot, { backgroundColor: m.dot }]} />
      <Text style={[sb.text, { color: m.fg }]}>{m.label}</Text>
    </View>
  )
}

const sb = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  text: { fontSize: 11, fontWeight: '700', letterSpacing: 0.4, textTransform: 'uppercase' },
})

function ShiftCard({ shift }: { shift: Shift }) {
  const confirmed = shift.confirmed_count ?? shift._count?.applications ?? 0
  const pct = shift.slots > 0 ? confirmed / shift.slots : 0
  const barColor = shift.status === 'IN_PROGRESS' ? C.jade : pct >= 1 ? C.navy : C.orange

  return (
    <TouchableOpacity
      style={card.wrap}
      onPress={() => router.push(`/shifts/${shift.id}` as any)}
      activeOpacity={0.85}
    >
      <View style={card.top}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={card.role}>{specialtyLabel(shift.specialty)}</Text>
          <View style={card.meta}>
            <View style={card.metaItem}>
              <Icon d={ICON_PATHS.calendar} size={13} stroke={C.textMute} sw={2} />
              <Text style={card.metaText}>{formatDate(shift.starts_at)}</Text>
            </View>
            <View style={card.metaItem}>
              <Icon d={ICON_PATHS.clock} size={13} stroke={C.textMute} sw={2} />
              <Text style={card.metaText}>{formatTime(shift.starts_at)}–{formatTime(shift.ends_at)}</Text>
            </View>
          </View>
        </View>
        <StatusBadge status={shift.status} />
      </View>

      {/* progress */}
      <View style={card.prog}>
        <Text style={card.progText}>
          <Text style={{ color: C.text, fontWeight: '700' }}>{confirmed}</Text> de {shift.slots} confirmados
        </Text>
        <View style={card.bar}>
          <View style={[card.barFill, { width: `${Math.min(pct * 100, 100)}%` as any, backgroundColor: barColor }]} />
        </View>
      </View>

      {/* footer */}
      <View style={card.footer}>
        <View>
          <Text style={card.escrowLabel}>Reservado em escrow</Text>
          <Text style={card.escrowValue}>{formatCurrency(shift.total_value)}</Text>
        </View>
        {shift.is_urgent ? (
          <View style={card.urgentBadge}>
            <Icon d={ICON_PATHS.bolt} size={11} stroke="#fff" sw={2.4} />
            <Text style={card.urgentText}>urgente</Text>
          </View>
        ) : (
          <Icon d={ICON_PATHS.chevR} size={18} stroke={C.textMute} sw={2} />
        )}
      </View>
    </TouchableOpacity>
  )
}

const card = StyleSheet.create({
  wrap: {
    backgroundColor: '#fff', borderRadius: 18, padding: 16,
    borderWidth: 1, borderColor: C.line,
    shadowColor: C.navy, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2,
  },
  top: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  role: { fontSize: 18, fontWeight: '700', color: C.text, letterSpacing: -0.5, lineHeight: 22 },
  meta: { flexDirection: 'row', gap: 12, marginTop: 6 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12.5, color: C.textMute, fontWeight: '500' },
  prog: { marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: C.line, borderStyle: 'dashed' },
  progText: { fontSize: 12.5, color: C.textMute, fontWeight: '600', marginBottom: 8 },
  bar: { height: 5, borderRadius: 3, backgroundColor: C.surface3, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3 },
  footer: {
    marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: C.lineSoft,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  escrowLabel: { fontSize: 10.5, fontWeight: '700', color: C.textSoft, letterSpacing: 0.6, textTransform: 'uppercase' },
  escrowValue: { fontSize: 18, fontWeight: '800', color: C.text, letterSpacing: -0.5, marginTop: 2 },
  urgentBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: C.orange, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999,
  },
  urgentText: { fontSize: 11, fontWeight: '700', color: '#fff', letterSpacing: 0.3, textTransform: 'uppercase' },
})

const SPECIALTIES = ['garcom','bartender','aux_cozinha','promotor','caixa','repositor','cuidador','aux_logistica']
const STATUS_TABS = [
  { id: 'all',         label: 'Todas' },
  { id: 'OPEN',        label: 'Abertas' },
  { id: 'IN_PROGRESS', label: 'Andamento' },
  { id: 'FILLED',      label: 'Preenchidas' },
]

function PostShiftModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const qc = useQueryClient()
  const [specialty, setSpecialty] = useState('garcom')
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [rate, setRate] = useState('')
  const [slots, setSlots] = useState(1)
  const [instructions, setInstructions] = useState('')

  const rateNum = parseFloat(rate.replace(',', '.')) || 0
  const hours = (() => {
    const [sh, sm] = startTime.split(':').map(Number)
    const [eh, em] = endTime.split(':').map(Number)
    if (!isNaN(sh) && !isNaN(eh)) {
      const diff = (eh * 60 + em - sh * 60 - sm)
      return diff > 0 ? diff / 60 : 0
    }
    return 0
  })()
  const subtotal = rateNum * hours * slots
  const fee = subtotal * 0.18
  const total = subtotal + fee
  const fmt = (n: number) => n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const mutation = useMutation({
    mutationFn: () => {
      const starts_at = `${date}T${startTime}:00`
      const ends_at = `${date}T${endTime}:00`
      return api.post('/shifts', {
        specialty, starts_at, ends_at,
        rate_per_hour: rateNum,
        slots,
        instructions: instructions || undefined,
      })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['business-shifts'] })
      Toast.show({ type: 'success', text1: 'Vaga publicada!' })
      onClose()
    },
    onError: (e: any) => {
      Toast.show({ type: 'error', text1: 'Erro', text2: e.message })
    },
  })

  const canPost = specialty && date && startTime && endTime && rateNum > 0

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1, backgroundColor: C.surface2 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Header */}
        <View style={ps.header}>
          <TouchableOpacity style={ps.closeBtn} onPress={onClose}>
            <Icon d={ICON_PATHS.x} size={16} stroke={C.text} sw={2.2} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={ps.headerSub}>Nova vaga</Text>
            <Text style={ps.headerTitle}>Postar turno</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 160 }} keyboardShouldPersistTaps="handled">
          {/* Specialty */}
          <Text style={ps.sectionTitle}>O TURNO</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {SPECIALTIES.map(sp => (
                <TouchableOpacity
                  key={sp}
                  style={[ps.chip, specialty === sp && ps.chipActive]}
                  onPress={() => setSpecialty(sp)}
                >
                  <Text style={[ps.chipText, specialty === sp && ps.chipTextActive]}>{specialtyLabel(sp)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Date + Time */}
          <View style={ps.fieldShell}>
            <Icon d={ICON_PATHS.calendar} size={17} stroke={C.navy} sw={2} />
            <TextInput
              style={ps.fieldInput}
              value={date}
              onChangeText={setDate}
              placeholder="Data (AAAA-MM-DD)"
              placeholderTextColor={C.textSoft}
            />
          </View>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
            <View style={[ps.fieldShell, { flex: 1 }]}>
              <Icon d={ICON_PATHS.clock} size={17} stroke={C.navy} sw={2} />
              <TextInput
                style={ps.fieldInput}
                value={startTime}
                onChangeText={setStartTime}
                placeholder="Início (HH:MM)"
                placeholderTextColor={C.textSoft}
                keyboardType="numeric"
              />
            </View>
            <View style={[ps.fieldShell, { flex: 1 }]}>
              <Icon d={ICON_PATHS.clock} size={17} stroke={C.navy} sw={2} />
              <TextInput
                style={ps.fieldInput}
                value={endTime}
                onChangeText={setEndTime}
                placeholder="Fim (HH:MM)"
                placeholderTextColor={C.textSoft}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Instructions */}
          <View style={[ps.fieldShell, { marginTop: 10, alignItems: 'flex-start' }]}>
            <Icon d={ICON_PATHS.doc} size={17} stroke={C.navy} sw={2} />
            <TextInput
              style={[ps.fieldInput, { minHeight: 80, textAlignVertical: 'top' }]}
              value={instructions}
              onChangeText={setInstructions}
              placeholder="Instruções para o trabalhador (opcional)"
              placeholderTextColor={C.textSoft}
              multiline
            />
          </View>

          {/* Slots stepper */}
          <Text style={[ps.sectionTitle, { marginTop: 20 }]}>DETALHES</Text>
          <View style={ps.stepperRow}>
            <View style={ps.stepperIcon}>
              <Icon d={ICON_PATHS.users} size={17} stroke={C.navy} sw={2} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={ps.fieldLabel}>Número de vagas</Text>
              <Text style={ps.fieldSub}>Quantos trabalhadores você precisa</Text>
            </View>
            <View style={ps.stepper}>
              <TouchableOpacity style={ps.stepBtn} onPress={() => setSlots(s => Math.max(1, s - 1))}>
                <Text style={ps.stepBtnText}>–</Text>
              </TouchableOpacity>
              <Text style={ps.stepValue}>{slots}</Text>
              <TouchableOpacity style={ps.stepBtn} onPress={() => setSlots(s => Math.min(20, s + 1))}>
                <Text style={ps.stepBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Rate */}
          <Text style={[ps.sectionTitle, { marginTop: 20 }]}>PAGAMENTO <Text style={ps.hint}>· Comissão: 18%</Text></Text>
          <View style={ps.fieldShell}>
            <Icon d={ICON_PATHS.money} size={17} stroke={C.navy} sw={2} />
            <Text style={ps.currencyPrefix}>R$</Text>
            <TextInput
              style={[ps.fieldInput, { flex: 1, fontSize: 22, fontWeight: '800' }]}
              value={rate}
              onChangeText={v => setRate(v.replace(/[^0-9,]/g, ''))}
              placeholder="0,00"
              placeholderTextColor={C.textSoft}
              keyboardType="numeric"
            />
          </View>
          {subtotal > 0 && (
            <View style={ps.summary}>
              <SummaryRow label={`${slots}× R$ ${fmt(rateNum)} × ${fmt(hours)}h`} value={`R$ ${fmt(subtotal)}`} />
              <SummaryRow label="Comissão Laboro · 18%" value={`R$ ${fmt(fee)}`} muted />
              <View style={ps.divider} />
              <SummaryRow label="Total reservado" value={`R$ ${fmt(total)}`} bold />
            </View>
          )}

          {/* Escrow note */}
          <View style={ps.escrowNote}>
            <View style={ps.escrowNoteIcon}>
              <Icon d={ICON_PATHS.shield} size={16} stroke={C.jadeDeep} sw={2} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={ps.escrowNoteTitle}>O valor fica protegido no escrow</Text>
              <Text style={ps.escrowNoteText}>
                {total > 0 ? `Reservamos R$ ${fmt(total)} ` : 'Reservamos o valor '}na sua forma de pagamento e só cobramos quando o turno é concluído.
              </Text>
            </View>
          </View>
        </ScrollView>

        <View style={ps.cta}>
          <TouchableOpacity
            style={[ps.ctaBtn, !canPost && ps.ctaBtnDisabled]}
            onPress={() => mutation.mutate()}
            disabled={!canPost || mutation.isPending}
            activeOpacity={0.85}
          >
            {mutation.isPending ? (
              <ActivityIndicator color={C.jadeInk} />
            ) : (
              <>
                <View>
                  <Text style={ps.ctaTitle}>Publicar e reservar</Text>
                  {total > 0 && <Text style={ps.ctaSub}>R$ {fmt(total)} em escrow</Text>}
                </View>
                <Icon d={ICON_PATHS.chevR} size={18} stroke={C.jadeInk} sw={2.4} />
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

function SummaryRow({ label, value, muted, bold }: { label: string; value: string; muted?: boolean; bold?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}>
      <Text style={{ fontSize: bold ? 13.5 : 13, fontWeight: bold ? '700' : '500', color: bold ? C.text : C.textMute }}>{label}</Text>
      <Text style={{ fontSize: bold ? 18 : 13, fontWeight: bold ? '800' : '600', color: bold ? C.jadeDeep : muted ? C.textMute : C.text, letterSpacing: bold ? -0.4 : 0 }}>{value}</Text>
    </View>
  )
}

const ps = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingTop: 56, paddingHorizontal: 20, paddingBottom: 14,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: C.line,
  },
  closeBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: C.surface3, alignItems: 'center', justifyContent: 'center' },
  headerSub: { fontSize: 11.5, fontWeight: '700', color: C.textSoft, letterSpacing: 0.6, textTransform: 'uppercase' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: C.text, letterSpacing: -0.4 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: C.text, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 10 },
  hint: { color: C.textSoft, fontWeight: '500' },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: C.line, backgroundColor: '#fff' },
  chipActive: { backgroundColor: C.navy, borderColor: C.navy },
  chipText: { fontSize: 13, fontWeight: '600', color: C.text },
  chipTextActive: { color: '#fff' },
  fieldShell: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#fff', borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: C.line,
  },
  fieldInput: { flex: 1, fontSize: 15, fontWeight: '600', color: C.text },
  fieldLabel: { fontSize: 11.5, fontWeight: '600', color: C.textSoft, letterSpacing: 0.3, textTransform: 'uppercase' },
  fieldSub: { fontSize: 12.5, color: C.textMute, marginTop: 1 },
  currencyPrefix: { fontSize: 13, color: C.textMute },
  stepperRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#fff', borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: C.line,
  },
  stepperIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: C.surface3, alignItems: 'center', justifyContent: 'center' },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.surface2, borderRadius: 12, padding: 4 },
  stepBtn: { width: 30, height: 30, borderRadius: 8, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.08, shadowOffset: { width: 0, height: 1 }, shadowRadius: 3, elevation: 1 },
  stepBtnText: { fontSize: 18, fontWeight: '700', color: C.navy },
  stepValue: { minWidth: 24, textAlign: 'center', fontSize: 17, fontWeight: '800', color: C.text },
  summary: { marginTop: 10, backgroundColor: '#fff', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: C.line },
  divider: { height: 1, backgroundColor: C.lineSoft, marginVertical: 8 },
  escrowNote: {
    marginTop: 14, backgroundColor: '#F7FFFB',
    borderWidth: 1, borderColor: 'rgba(0,196,140,0.2)',
    borderRadius: 14, padding: 14,
    flexDirection: 'row', gap: 12, alignItems: 'flex-start',
  },
  escrowNoteIcon: { width: 32, height: 32, borderRadius: 9, backgroundColor: '#fff', borderWidth: 1, borderColor: 'rgba(0,196,140,0.2)', alignItems: 'center', justifyContent: 'center' },
  escrowNoteTitle: { fontSize: 13.5, fontWeight: '700', color: C.jadeInk },
  escrowNoteText: { fontSize: 12, color: C.textMute, marginTop: 3, lineHeight: 17 },
  cta: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: 36, backgroundColor: C.surface2 },
  ctaBtn: {
    backgroundColor: C.jade, borderRadius: 18, paddingVertical: 16, paddingHorizontal: 20,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    shadowColor: C.jade, shadowOffset: { width: 0, height: 14 }, shadowOpacity: 0.4, shadowRadius: 26, elevation: 8,
  },
  ctaBtnDisabled: { backgroundColor: '#C7CBD9', shadowOpacity: 0, elevation: 0 },
  ctaTitle: { fontSize: 16, fontWeight: '700', color: C.jadeInk, letterSpacing: -0.3 },
  ctaSub: { fontSize: 11.5, fontWeight: '600', color: C.jadeInk, opacity: 0.7, marginTop: 1 },
})

export default function BusinessHome() {
  const insets = useSafeAreaInsets()
  const [statusTab, setStatusTab] = useState('all')
  const [postVisible, setPostVisible] = useState(false)

  const { data: shifts, isLoading, refetch, isRefetching } = useQuery<Shift[]>({
    queryKey: ['business-shifts'],
    queryFn: () => api.get('/shifts/my'),
  })

  const { data: business } = useQuery<Business>({
    queryKey: ['business-profile'],
    queryFn: () => api.get('/businesses/me'),
  })

  const urgentCount = shifts?.filter(s => s.is_urgent && s.status === 'OPEN').length ?? 0
  const openCount = shifts?.filter(s => s.status === 'OPEN').length ?? 0
  const todayConfirmed = shifts?.reduce((acc, s) => acc + (s.confirmed_count ?? s._count?.applications ?? 0), 0) ?? 0

  const filtered = statusTab === 'all' ? (shifts ?? []) : (shifts ?? []).filter(s => s.status === statusTab)

  const initials = (business?.trade_name ?? 'E').slice(0, 1).toUpperCase()

  return (
    <View style={{ flex: 1, backgroundColor: C.surface2 }}>
      {/* Navy header */}
      <View style={[h.header, { paddingTop: insets.top + 12 }]}>
        <View style={{ position: 'absolute', top: -100, right: -60, width: 280, height: 280, borderRadius: 140, backgroundColor: 'rgba(0,196,140,0.12)' }} />
        <View style={h.topRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={[h.logo, { backgroundColor: C.orange }]}>
              <Text style={h.logoText}>{initials}</Text>
            </View>
            <View>
              <Text style={h.panelLabel}>Painel da empresa</Text>
              <Text style={h.bizName}>{business?.trade_name ?? '...'}</Text>
            </View>
          </View>
          <TouchableOpacity style={h.bellBtn}>
            <Icon d={ICON_PATHS.bell} size={18} stroke="#fff" sw={2} />
          </TouchableOpacity>
        </View>
        {/* KPI row */}
        <View style={h.kpiRow}>
          <KpiCard value={String(openCount)} label="vagas abertas" tint="#FFB89A" />
          <KpiCard value={String(todayConfirmed)} label="confirmados" sublabel="hoje" tint="#7FE6C5" />
          <KpiCard value={shifts && shifts.length > 0 ? formatTime(shifts[0].starts_at) : '–'} label="próximo turno" tint="#fff" />
        </View>
      </View>

      {/* Content panel */}
      <FlatList
        data={filtered}
        keyExtractor={i => i.id}
        contentContainerStyle={[l.list, { paddingTop: 18 }]}
        style={{ marginTop: -28, borderTopLeftRadius: 28, borderTopRightRadius: 28, backgroundColor: C.surface2, zIndex: 2 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={C.navy} />}
        ListHeaderComponent={
          <>
            {/* Urgent banner */}
            {urgentCount > 0 && (
              <TouchableOpacity style={l.urgentBanner} activeOpacity={0.85}>
                <View style={l.urgentIcon}>
                  <Icon d={ICON_PATHS.warn} size={18} stroke={C.orange} sw={2} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={l.urgentTitle}>{urgentCount} vaga{urgentCount > 1 ? 's começa' : ' começa'} em breve sem candidatos</Text>
                  <Text style={l.urgentSub}>Aumente o valor ou adicione mais detalhes</Text>
                </View>
                <Icon d={ICON_PATHS.chevR} size={16} stroke={C.textMute} sw={2} />
              </TouchableOpacity>
            )}

            {/* Section header + tabs */}
            <View style={l.sectionRow}>
              <Text style={l.sectionTitle}>Vagas ativas</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }} contentContainerStyle={{ paddingHorizontal: 20, gap: 6 }}>
              {STATUS_TABS.map(t => {
                const count = t.id === 'all' ? (shifts?.length ?? 0) : (shifts?.filter(s => s.status === t.id).length ?? 0)
                const active = statusTab === t.id
                return (
                  <TouchableOpacity key={t.id} style={[l.tab, active && l.tabActive]} onPress={() => setStatusTab(t.id)}>
                    <Text style={[l.tabText, active && l.tabTextActive]}>{t.label}</Text>
                    <View style={[l.tabCount, active && l.tabCountActive]}>
                      <Text style={[l.tabCountText, active && l.tabCountTextActive]}>{count}</Text>
                    </View>
                  </TouchableOpacity>
                )
              })}
            </ScrollView>
          </>
        }
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator color={C.navy} style={{ marginTop: 60 }} />
          ) : (
            <View style={l.empty}>
              <Text style={l.emptyText}>Nenhuma vaga ativa</Text>
              <Text style={l.emptySub}>Poste uma vaga usando o botão abaixo</Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <View style={{ paddingHorizontal: 20, marginBottom: 12 }}>
            <ShiftCard shift={item} />
          </View>
        )}
      />

      {/* FAB */}
      <TouchableOpacity style={fab.btn} onPress={() => setPostVisible(true)} activeOpacity={0.85}>
        <Icon d={ICON_PATHS.plus} size={20} stroke={C.jadeInk} sw={2.6} />
        <Text style={fab.text}>Postar vaga</Text>
      </TouchableOpacity>

      <PostShiftModal visible={postVisible} onClose={() => setPostVisible(false)} />
    </View>
  )
}

function KpiCard({ value, label, sublabel, tint }: { value: string; label: string; sublabel?: string; tint: string }) {
  return (
    <View style={kpi.card}>
      <Text style={[kpi.value, { color: tint }]}>{value}</Text>
      <Text style={kpi.label}>{label}</Text>
      {sublabel && <Text style={kpi.sub}>{sublabel}</Text>}
    </View>
  )
}

const kpi = StyleSheet.create({
  card: { flex: 1, backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)', borderRadius: 14, padding: 12 },
  value: { fontSize: 24, fontWeight: '800', letterSpacing: -0.8, lineHeight: 26 },
  label: { fontSize: 11.5, fontWeight: '600', color: 'rgba(255,255,255,0.7)', marginTop: 5 },
  sub: { fontSize: 10.5, color: 'rgba(255,255,255,0.5)', marginTop: 1 },
})

const h = StyleSheet.create({
  header: { backgroundColor: C.navy, paddingHorizontal: 20, paddingBottom: 60, overflow: 'hidden', position: 'relative' },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  logo: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', shadowColor: '#ff6b35', shadowOpacity: 0.4, shadowOffset: { width: 0, height: 4 }, shadowRadius: 14, elevation: 4 },
  logoText: { fontSize: 18, fontWeight: '700', color: '#fff' },
  panelLabel: { fontSize: 11.5, fontWeight: '600', color: 'rgba(255,255,255,0.55)', letterSpacing: 0.5, textTransform: 'uppercase' },
  bizName: { fontSize: 17, fontWeight: '700', color: '#fff', letterSpacing: -0.4, marginTop: 1 },
  bellBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  kpiRow: { flexDirection: 'row', gap: 10, marginTop: 22 },
})

const l = StyleSheet.create({
  list: { paddingBottom: 120 },
  urgentBanner: {
    marginHorizontal: 20, marginBottom: 18,
    backgroundColor: '#fff', borderRadius: 14, padding: 14,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderLeftWidth: 4, borderLeftColor: C.orange,
    borderWidth: 1, borderColor: `${C.orange}33`,
    shadowColor: C.orange, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.1, shadowRadius: 18, elevation: 2,
  },
  urgentIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#FFF1E9', alignItems: 'center', justifyContent: 'center' },
  urgentTitle: { fontSize: 13.5, fontWeight: '700', color: C.text, letterSpacing: -0.1 },
  urgentSub: { fontSize: 12, color: C.textMute, marginTop: 1 },
  sectionRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 14 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: C.text, letterSpacing: -0.5 },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 13, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: C.line, backgroundColor: '#fff' },
  tabActive: { backgroundColor: C.navy, borderColor: C.navy },
  tabText: { fontSize: 12.5, fontWeight: '600', color: C.text },
  tabTextActive: { color: '#fff' },
  tabCount: { backgroundColor: C.surface3, paddingHorizontal: 6, paddingVertical: 1, borderRadius: 999 },
  tabCountActive: { backgroundColor: 'rgba(255,255,255,0.2)' },
  tabCountText: { fontSize: 11, fontWeight: '700', color: C.textMute },
  tabCountTextActive: { color: '#fff' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 16, fontWeight: '700', color: C.text },
  emptySub: { fontSize: 14, color: C.textMute, marginTop: 6 },
})

const fab = StyleSheet.create({
  btn: {
    position: 'absolute', bottom: 90, right: 20,
    height: 56, paddingLeft: 18, paddingRight: 22, borderRadius: 28,
    backgroundColor: C.jade,
    flexDirection: 'row', alignItems: 'center', gap: 8,
    shadowColor: C.jade, shadowOffset: { width: 0, height: 14 }, shadowOpacity: 0.45, shadowRadius: 30, elevation: 8,
  },
  text: { fontSize: 15, fontWeight: '700', color: C.jadeInk, letterSpacing: -0.2 },
})
