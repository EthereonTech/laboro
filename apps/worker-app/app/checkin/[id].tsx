import { useState, useEffect, useRef } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator,
  Alert, Animated, PanResponder, ScrollView,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Svg, Path, Rect, G, Circle, Defs, Pattern } from 'react-native-svg'
import * as Location from 'expo-location'
import Toast from 'react-native-toast-message'
import { api } from '../../lib/api'
import { C, ICON_PATHS } from '../../lib/theme'
import { specialtyLabel, formatTime } from '../../lib/format'

// ── Types ──────────────────────────────────────────────────────────────────
type Application = {
  id: string
  checkin_at: string | null
  checkout_at: string | null
  hours_worked: number | null
  worker_amount?: number
  shift: {
    id: string
    specialty: string
    starts_at: string
    ends_at: string
    total_value: number
    worker_amount?: number
    laboro_fee?: number
    rate_per_hour?: number
    business: {
      trade_name: string
      address?: { lat?: number; lng?: number; street?: string }
    }
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────
function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lng2 - lng1) * Math.PI) / 180
  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function Icon({ d, size = 18, stroke = 'currentColor', sw = 1.8, fill = 'none' }: {
  d: string; size?: number; stroke?: string; sw?: number; fill?: string
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={fill}>
      <Path d={d} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" fill={fill} />
    </Svg>
  )
}

const COMPANY_COLORS = ['#1B3FA0', '#FF6B35', '#00A372', '#7C2D12', '#A67C00', '#5B21B6', '#0369A1']
function companyColor(name: string) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffffff
  return COMPANY_COLORS[Math.abs(h) % COMPANY_COLORS.length]
}

// ── SlideConfirm ───────────────────────────────────────────────────────────
const KNOB = 56
const TRACK_H = 64

function SlideConfirm({ label, color, onConfirm, disabled = false }: {
  label: string; color: string; onConfirm?: () => void; disabled?: boolean
}) {
  const trackWidthRef = useRef(300)
  const doneRef = useRef(false)
  const [isDone, setIsDone] = useState(false)
  const x = useRef(new Animated.Value(0)).current
  const onConfirmRef = useRef(onConfirm)
  const disabledRef = useRef(disabled)

  useEffect(() => { onConfirmRef.current = onConfirm }, [onConfirm])
  useEffect(() => { disabledRef.current = disabled }, [disabled])

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabledRef.current && !doneRef.current,
      onMoveShouldSetPanResponder: () => !disabledRef.current && !doneRef.current,
      onPanResponderMove: (_, gs) => {
        const maxX = trackWidthRef.current - KNOB - 8
        const val = Math.max(0, Math.min(maxX, gs.dx))
        x.setValue(val)
        if (val >= maxX - 4 && !doneRef.current) {
          doneRef.current = true
          setIsDone(true)
          x.setValue(maxX)
          setTimeout(() => onConfirmRef.current?.(), 200)
        }
      },
      onPanResponderRelease: () => {
        if (!doneRef.current) {
          Animated.spring(x, { toValue: 0, useNativeDriver: false, friction: 8 }).start()
        }
      },
    })
  ).current

  const bg = disabled ? '#9AA0B7' : color
  const progress = x.interpolate({ inputRange: [0, 300], outputRange: [0, 1], extrapolate: 'clamp' })

  return (
    <View
      style={[sc.track, { backgroundColor: bg }]}
      onLayout={e => { trackWidthRef.current = e.nativeEvent.layout.width }}
    >
      <Animated.View style={[sc.progressOverlay, { width: progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) as any }]} />
      <Text style={[sc.label, { color: color === C.jade ? C.jadeInk : '#fff', paddingLeft: KNOB + 12 }]}>
        {label}
      </Text>
      <Animated.View
        style={[sc.knob, { transform: [{ translateX: x }] }]}
        {...panResponder.panHandlers}
      >
        {isDone
          ? <Icon d={ICON_PATHS.check} size={24} stroke={bg} sw={3} />
          : <Icon d={ICON_PATHS.arrowR} size={22} stroke={bg} sw={2.6} />
        }
      </Animated.View>
    </View>
  )
}
const sc = StyleSheet.create({
  track: {
    width: '100%', height: TRACK_H, borderRadius: TRACK_H / 2,
    overflow: 'hidden', position: 'relative',
    justifyContent: 'center', alignItems: 'center',
  },
  progressOverlay: {
    position: 'absolute', left: 0, top: 0, bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  label: { fontSize: 16, fontWeight: '700', letterSpacing: -0.2, textAlign: 'center', flex: 1 },
  knob: {
    position: 'absolute', left: 4, top: 4,
    width: KNOB, height: KNOB, borderRadius: KNOB / 2,
    backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 6, shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
})

// ── GpsMap ─────────────────────────────────────────────────────────────────
function GpsMap({ distanceM, canCheckin }: { distanceM: number | null; canCheckin: boolean }) {
  const distText = distanceM === null ? 'Obtendo GPS…'
    : distanceM < 1000 ? `${Math.round(distanceM)} m do local`
    : `${(distanceM / 1000).toFixed(1)} km do local`

  return (
    <View style={gm.container}>
      <Svg width="100%" height="100%" viewBox="0 0 360 210">
        <Defs>
          <Pattern id="mapgrid" width="22" height="22" patternUnits="userSpaceOnUse">
            <Path d="M22 0H0v22" fill="none" stroke="#E1E5F0" strokeWidth="1" />
          </Pattern>
        </Defs>
        <Rect width="360" height="210" fill="#F1F3F9" />
        <Rect width="360" height="210" fill="url(#mapgrid)" />
        {/* Streets */}
        <Path d="M0 130 L360 115" stroke="#fff" strokeWidth="20" />
        <Path d="M125 -10 L140 220" stroke="#fff" strokeWidth="14" />
        <Path d="M235 -5 L248 220" stroke="#fff" strokeWidth="10" />
        <Path d="M-5 42 L370 50" stroke="#fff" strokeWidth="8" />
        {/* Building */}
        <Rect x="150" y="22" width="60" height="42" rx="6" fill="#DCEFE0" />
        {/* Venue pin */}
        <G transform="translate(195, 82)">
          <Circle r="24" fill="#1B3FA0" fillOpacity="0.10" />
          <Circle r="16" fill="#1B3FA0" fillOpacity="0.20" />
          <Path d="M0 -14C5-14 9-10 9-6C9-2 0 7 0 7C0 7-9-2-9-6C-9-10-5-14 0-14Z" fill="#1B3FA0" />
          <Circle cy="-8" r="3" fill="#fff" />
        </G>
        {/* GPS dot */}
        <G transform={canCheckin ? 'translate(178, 94)' : 'translate(110, 155)'}>
          <Circle r="18" fill="#00C48C" fillOpacity="0.15" />
          <Circle r="9" fill="#fff" stroke="#fff" strokeWidth="2" />
          <Circle r="6" fill="#00C48C" />
        </G>
      </Svg>

      {/* Distance badge */}
      <View style={[gm.badge, { borderColor: canCheckin ? C.jade : C.orange }]}>
        <View style={[gm.dot, { backgroundColor: canCheckin ? C.jade : C.orange }]} />
        <Text style={[gm.badgeText, { color: canCheckin ? C.jadeDeep : C.orange }]}>{distText}</Text>
      </View>

      {/* Recenter */}
      <View style={gm.recenter}>
        <Icon d={ICON_PATHS.pin} size={16} stroke={C.navy} sw={2} />
      </View>
    </View>
  )
}
const gm = StyleSheet.create({
  container: { height: 210, borderRadius: 22, overflow: 'hidden', borderWidth: 1, borderColor: C.line, position: 'relative' },
  badge: {
    position: 'absolute', top: 12, left: 12,
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#fff', borderWidth: 1, borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 7,
    shadowColor: C.navy, shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  recenter: {
    position: 'absolute', bottom: 12, right: 12,
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: C.navy, shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
})

// ── VagaStrip ──────────────────────────────────────────────────────────────
function VagaStrip({ app }: { app: Application }) {
  const color = companyColor(app.shift.business.trade_name)
  const val = (app.shift.worker_amount ?? app.shift.total_value * 0.82)
    .toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <View style={vs.card}>
      <View style={[vs.mark, { backgroundColor: color }]}>
        <Text style={vs.markLetter}>{app.shift.business.trade_name[0]?.toUpperCase()}</Text>
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={vs.company} numberOfLines={1}>{app.shift.business.trade_name}</Text>
        <Text style={vs.role} numberOfLines={1}>{specialtyLabel(app.shift.specialty)} · R$ {val}</Text>
      </View>
    </View>
  )
}
const vs = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.surface, borderRadius: 16, padding: 12, paddingRight: 14, borderWidth: 1, borderColor: C.line },
  mark: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  markLetter: { fontSize: 20, fontWeight: '700', color: '#fff' },
  company: { fontSize: 11.5, fontWeight: '600', color: C.textMute },
  role: { fontSize: 15, fontWeight: '700', color: C.text, letterSpacing: -0.3, marginTop: 1 },
})

// ── Phase 0: Awaiting check-in ─────────────────────────────────────────────
function PhaseCheckIn({ app, distanceM, canCheckin, onCheckin, loading }: {
  app: Application; distanceM: number | null; canCheckin: boolean
  onCheckin: () => void; loading: boolean
}) {
  const statusOk = canCheckin && distanceM !== null

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={p0.content} showsVerticalScrollIndicator={false}>
      <VagaStrip app={app} />
      <GpsMap distanceM={distanceM} canCheckin={canCheckin} />

      {/* GPS status card */}
      <View style={p0.statusCard}>
        <View style={[p0.statusIcon, { backgroundColor: statusOk ? C.jadeSoft : '#FFF1E9' }]}>
          <Icon d={ICON_PATHS.pin} size={20} stroke={statusOk ? C.jadeDeep : C.orange} sw={2} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={p0.statusTitle}>{statusOk ? 'GPS validado' : 'Aproxime-se do local'}</Text>
          <Text style={p0.statusSub}>
            {statusOk
              ? `Você está a ${Math.round(distanceM!)} m · pode fazer check-in`
              : distanceM === null
                ? 'Obtendo sua localização…'
                : `Você precisa estar a menos de 500 m (atual: ${Math.round(distanceM)} m)`}
          </Text>
        </View>
      </View>

      {/* Selfie row */}
      <TouchableOpacity style={p0.selfieRow} activeOpacity={0.8}>
        <Icon d={ICON_PATHS.camera} size={18} stroke={C.textMute} sw={2} />
        <View style={{ flex: 1 }}>
          <Text style={p0.selfieTitle}>Adicionar selfie</Text>
          <Text style={p0.selfieSub}>Opcional · ajuda a confirmar sua presença</Text>
        </View>
        <Icon d={ICON_PATHS.chevR} size={14} stroke={C.textSoft} sw={2} />
      </TouchableOpacity>

      <View style={{ height: 20 }} />

      {loading ? (
        <View style={p0.loadingRow}>
          <ActivityIndicator color={C.jade} size="small" />
          <Text style={p0.loadingText}>Registrando check-in…</Text>
        </View>
      ) : (
        <SlideConfirm
          label={statusOk ? 'Deslize para fazer check-in' : 'Aguardando GPS…'}
          color={statusOk ? C.jade : '#9AA0B7'}
          onConfirm={statusOk ? onCheckin : undefined}
          disabled={!statusOk}
        />
      )}
    </ScrollView>
  )
}
const p0 = StyleSheet.create({
  content: { padding: 20, gap: 16, paddingBottom: 32 },
  statusCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, backgroundColor: C.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.line },
  statusIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  statusTitle: { fontSize: 15, fontWeight: '700', color: C.text, letterSpacing: -0.2 },
  statusSub: { fontSize: 12.5, color: C.textMute, marginTop: 3 },
  selfieRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.surface2, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: C.line, borderStyle: 'dashed' },
  selfieTitle: { fontSize: 13, fontWeight: '600', color: C.text },
  selfieSub: { fontSize: 11.5, color: C.textSoft, marginTop: 1 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: TRACK_H },
  loadingText: { fontSize: 14, color: C.textMute },
})

// ── Phase 1: In progress ───────────────────────────────────────────────────
function PhaseInProgress({ app, onCheckout, loading }: {
  app: Application; onCheckout: () => void; loading: boolean
}) {
  const checkinTs = app.checkin_at ? new Date(app.checkin_at).getTime() : Date.now()
  const [elapsed, setElapsed] = useState(Math.floor((Date.now() - checkinTs) / 1000))

  useEffect(() => {
    const iv = setInterval(() => setElapsed(Math.floor((Date.now() - checkinTs) / 1000)), 1000)
    return () => clearInterval(iv)
  }, [checkinTs])

  const hh = Math.floor(elapsed / 3600)
  const mm = Math.floor((elapsed % 3600) / 60)
  const ss = elapsed % 60
  const pad = (n: number) => String(n).padStart(2, '0')

  const durationSec = (new Date(app.shift.ends_at).getTime() - new Date(app.shift.starts_at).getTime()) / 1000
  const progress = Math.min(1, elapsed / durationSec)
  const workerAmt = app.shift.worker_amount ?? app.shift.total_value * 0.82
  const accumulated = (workerAmt * progress).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const remaining = Math.max(0, durationSec - elapsed)
  const remH = Math.floor(remaining / 3600)
  const remM = Math.floor((remaining % 3600) / 60)

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={p1.content} showsVerticalScrollIndicator={false}>
      <VagaStrip app={app} />

      {/* Live timer card */}
      <View style={p1.timerCard}>
        <View style={p1.timerGlow} pointerEvents="none" />
        <View style={{ zIndex: 1 }}>
          <View style={p1.liveBadge}>
            <View style={p1.pulseDot} />
            <Text style={p1.liveBadgeText}>Turno em andamento</Text>
          </View>
          <View style={p1.timerRow}>
            <Text style={p1.timerMain}>{pad(hh)}:{pad(mm)}</Text>
            <Text style={p1.timerSec}>:{pad(ss)}</Text>
          </View>
          <Text style={p1.timerSub}>
            Check-in: {formatTime(app.checkin_at ?? '')} · Previsto até {formatTime(app.shift.ends_at)}
          </Text>

          <View style={p1.progressBg}>
            <View style={[p1.progressFill, { width: `${Math.floor(progress * 100)}%` as any }]} />
          </View>
          <View style={p1.progressLabels}>
            <Text style={p1.progressText}>{Math.round(progress * 100)}% concluído</Text>
            <Text style={p1.progressText}>resta {remH}h{pad(remM)}</Text>
          </View>
        </View>
      </View>

      {/* Accumulated value */}
      <View style={p1.accCard}>
        <View style={p1.accIcon}>
          <Icon d={ICON_PATHS.lock} size={20} stroke={C.jadeDeep} sw={2} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={p1.accLabel}>Acumulado · escrow</Text>
          <Text style={p1.accValue}>R$ {accumulated}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={p1.accSubLabel}>de</Text>
          <Text style={p1.accTotal}>
            R$ {workerAmt.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
        </View>
      </View>

      <TouchableOpacity style={p1.problemBtn} activeOpacity={0.8}>
        <Text style={p1.problemText}>Reportar problema</Text>
      </TouchableOpacity>

      {loading ? (
        <View style={[p0.loadingRow]}>
          <ActivityIndicator color={C.navy} size="small" />
          <Text style={p0.loadingText}>Registrando check-out…</Text>
        </View>
      ) : (
        <SlideConfirm
          label="Deslize para fazer check-out"
          color={C.navy}
          onConfirm={onCheckout}
        />
      )}
    </ScrollView>
  )
}
const p1 = StyleSheet.create({
  content: { padding: 20, gap: 16, paddingBottom: 32 },
  timerCard: { backgroundColor: C.navy, borderRadius: 22, padding: 22, overflow: 'hidden', position: 'relative' },
  timerGlow: { position: 'absolute', top: -80, right: -60, width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(0,196,140,0.22)' },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', backgroundColor: 'rgba(0,196,140,0.18)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  pulseDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.jade },
  liveBadgeText: { fontSize: 11, fontWeight: '700', color: '#7FE6C5', letterSpacing: 0.6, textTransform: 'uppercase' },
  timerRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 12 },
  timerMain: { fontSize: 64, fontWeight: '800', color: '#fff', letterSpacing: -2.5, lineHeight: 72 },
  timerSec: { fontSize: 64, fontWeight: '800', color: 'rgba(255,255,255,0.4)', letterSpacing: -2.5, lineHeight: 72 },
  timerSub: { fontSize: 13, fontWeight: '500', color: 'rgba(255,255,255,0.7)', marginTop: 6 },
  progressBg: { marginTop: 18, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.10)', overflow: 'hidden' },
  progressFill: { height: '100%' as any, borderRadius: 3, backgroundColor: C.jade },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  progressText: { fontSize: 11.5, color: 'rgba(255,255,255,0.6)' },
  accCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: C.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.line },
  accIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: C.jadeSoft, alignItems: 'center', justifyContent: 'center' },
  accLabel: { fontSize: 11.5, fontWeight: '700', color: C.textSoft, letterSpacing: 0.6, textTransform: 'uppercase' },
  accValue: { fontSize: 22, fontWeight: '800', color: C.jadeDeep, letterSpacing: -0.7, marginTop: 2 },
  accSubLabel: { fontSize: 11, color: C.textMute },
  accTotal: { fontSize: 13, fontWeight: '700', color: C.text, marginTop: 2 },
  problemBtn: { alignSelf: 'center' },
  problemText: { fontSize: 12.5, fontWeight: '600', color: C.orange },
})

// ── Phase 2: Payment released ──────────────────────────────────────────────
function PhasePaid({ app, onRate, onClose }: { app: Application; onRate: () => void; onClose: () => void }) {
  const workerAmt = app.shift.worker_amount ?? app.shift.total_value * 0.82
  const val = workerAmt.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const hours = app.hours_worked ? Number(app.hours_worked).toFixed(1) : '—'

  return (
    <View style={p2.container}>
      {/* Check circle */}
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
        <View style={p2.circle}>
          <View style={p2.ring1} />
          <View style={p2.ring2} />
          <Icon d={ICON_PATHS.check} size={68} stroke="#fff" sw={3.2} />
        </View>

        <Text style={p2.title}>Pagamento liberado!</Text>
        <Text style={p2.sub}>
          O escrow foi liberado e o valor caiu na sua chave Pix em poucos segundos.
        </Text>

        {/* Value card */}
        <View style={p2.valueCard}>
          <Text style={p2.valueLabel}>Você recebeu</Text>
          <Text style={p2.valueAmt}>R$ {val}</Text>
          <View style={p2.valueDivider} />
          <View style={p2.valueFooter}>
            <View>
              <Text style={p2.valueFooterLabel}>Horas trabalhadas</Text>
              <Text style={p2.valueFooterValue}>{hours}h</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={p2.greenDot} />
              <Text style={p2.receivedText}>Recebido agora</Text>
            </View>
          </View>
        </View>
      </View>

      {/* CTA buttons */}
      <View style={p2.btns}>
        <TouchableOpacity style={p2.btnPrimary} onPress={onRate} activeOpacity={0.88}>
          <Svg width={17} height={17} viewBox="0 0 24 24" fill="#fff">
            <Path d={ICON_PATHS.star} stroke="#fff" strokeWidth={2} fill="#fff" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
          <Text style={p2.btnPrimaryText}>Avaliar a empresa</Text>
        </TouchableOpacity>
        <TouchableOpacity style={p2.btnSecondary} onPress={onClose} activeOpacity={0.8}>
          <Text style={p2.btnSecondaryText}>Ver minha carteira</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}
const p2 = StyleSheet.create({
  container: { flex: 1, paddingBottom: 32 },
  circle: {
    width: 140, height: 140, borderRadius: 70,
    backgroundColor: C.jade, alignItems: 'center', justifyContent: 'center',
    shadowColor: C.jade, shadowOpacity: 0.5, shadowRadius: 30, shadowOffset: { width: 0, height: 12 },
    elevation: 12, position: 'relative',
  },
  ring1: {
    position: 'absolute', top: -16, left: -16, right: -16, bottom: -16, borderRadius: 86,
    borderWidth: 2, borderColor: `${C.jade}40`,
  },
  ring2: {
    position: 'absolute', top: -32, left: -32, right: -32, bottom: -32, borderRadius: 102,
    borderWidth: 2, borderColor: `${C.jade}22`,
  },
  title: { fontSize: 30, fontWeight: '800', color: C.text, letterSpacing: -1, marginTop: 30, textAlign: 'center' },
  sub: { fontSize: 14.5, color: C.textMute, marginTop: 8, textAlign: 'center', lineHeight: 20 },
  valueCard: {
    marginTop: 26, width: '100%',
    backgroundColor: C.surface, borderRadius: 18,
    padding: 16, borderWidth: 1, borderColor: `${C.jade}44`,
    shadowColor: C.jade, shadowOpacity: 0.12, shadowRadius: 16, shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  valueLabel: { fontSize: 11.5, fontWeight: '700', color: C.textSoft, letterSpacing: 0.6, textTransform: 'uppercase', textAlign: 'center' },
  valueAmt: { fontSize: 42, fontWeight: '800', color: C.jadeDeep, letterSpacing: -1.6, marginTop: 4, textAlign: 'center', lineHeight: 50 },
  valueDivider: { height: 1, borderStyle: 'dashed', borderWidth: 1, borderColor: C.line, marginTop: 14 },
  valueFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 },
  valueFooterLabel: { fontSize: 11, color: C.textMute },
  valueFooterValue: { fontSize: 14, fontWeight: '700', color: C.text, marginTop: 2 },
  greenDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.jade },
  receivedText: { fontSize: 12.5, fontWeight: '700', color: C.jadeDeep },
  btns: { paddingHorizontal: 20, gap: 10 },
  btnPrimary: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: C.navy, borderRadius: 16, paddingVertical: 15,
  },
  btnPrimaryText: { fontSize: 15, fontWeight: '700', color: '#fff' },
  btnSecondary: { alignItems: 'center', paddingVertical: 12 },
  btnSecondaryText: { fontSize: 14, fontWeight: '600', color: C.text },
})

// ── Main Screen ────────────────────────────────────────────────────────────
export default function CheckinScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const queryClient = useQueryClient()
  const [distanceM, setDistanceM] = useState<number | null>(null)
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number; accuracy?: number } | null>(null)

  const { data: application, isLoading } = useQuery({
    queryKey: ['application', id],
    queryFn: () => api.get<Application>(`/shifts/${id}/my-application`),
    refetchInterval: (data: any) => {
      if (!data) return false
      if (data.checkin_at && !data.checkout_at) return false
      return false
    },
  })

  const checkinMutation = useMutation({
    mutationFn: () => api.post(`/shifts/${id}/checkin`, {
      lat: userCoords!.lat, lng: userCoords!.lng, accuracy: userCoords!.accuracy,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application', id] })
      queryClient.invalidateQueries({ queryKey: ['my-applications'] })
    },
    onError: (e: any) => {
      Toast.show({ type: 'error', text1: 'Erro no check-in', text2: e.message })
    },
  })

  const checkoutMutation = useMutation({
    mutationFn: () => api.post(`/shifts/${id}/checkout`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application', id] })
      queryClient.invalidateQueries({ queryKey: ['my-applications'] })
      queryClient.invalidateQueries({ queryKey: ['payment-history'] })
    },
    onError: (e: any) => {
      Toast.show({ type: 'error', text1: 'Erro no check-out', text2: e.message })
    },
  })

  useEffect(() => {
    ;(async () => {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') return

      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High })
      setUserCoords({
        lat: loc.coords.latitude,
        lng: loc.coords.longitude,
        accuracy: loc.coords.accuracy ?? undefined,
      })
    })()
  }, [])

  useEffect(() => {
    if (!userCoords || !application?.shift.business.address) return
    const addr = application.shift.business.address
    if (!addr.lat || !addr.lng) return
    const dist = haversine(userCoords.lat, userCoords.lng, addr.lat, addr.lng)
    setDistanceM(dist)
  }, [userCoords, application])

  const isCheckedIn = !!(application?.checkin_at)
  const isCheckedOut = !!(application?.checkout_at)
  const canCheckin = distanceM !== null && distanceM <= 500
  const phase: 'checkin' | 'inprogress' | 'paid' =
    isCheckedOut ? 'paid' : isCheckedIn ? 'inprogress' : 'checkin'

  const phaseLabel = {
    checkin: { sub: 'Próximo turno', title: 'Fazer check-in' },
    inprogress: { sub: 'Turno em andamento', title: application?.shift.business.trade_name ?? '…' },
    paid: { sub: 'Turno concluído', title: application?.shift.business.trade_name ?? '…' },
  }[phase]

  if (isLoading) {
    return (
      <SafeAreaView style={s.root} edges={['top']}>
        <ActivityIndicator style={{ marginTop: 80 }} color={C.navy} size="large" />
      </SafeAreaView>
    )
  }

  if (!application) return null

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      {/* Top bar */}
      <View style={s.topBar}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
          <Icon d={ICON_PATHS.chevL} size={18} stroke={C.text} sw={2.2} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.topSub}>{phaseLabel.sub}</Text>
          <Text style={s.topTitle} numberOfLines={1}>{phaseLabel.title}</Text>
        </View>
      </View>

      {phase === 'checkin' && (
        <PhaseCheckIn
          app={application}
          distanceM={distanceM}
          canCheckin={canCheckin}
          onCheckin={() => checkinMutation.mutate()}
          loading={checkinMutation.isPending}
        />
      )}
      {phase === 'inprogress' && (
        <PhaseInProgress
          app={application}
          onCheckout={() => checkoutMutation.mutate()}
          loading={checkoutMutation.isPending}
        />
      )}
      {phase === 'paid' && (
        <PhasePaid
          app={application}
          onRate={() => router.replace(`/rating/${id}`)}
          onClose={() => router.replace('/(tabs)/history')}
        />
      )}
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.surface2 },
  topBar: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 20, paddingBottom: 8, paddingTop: 4,
    backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.lineSoft,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: C.surface3, alignItems: 'center', justifyContent: 'center',
  },
  topSub: { fontSize: 11.5, fontWeight: '700', color: C.textSoft, letterSpacing: 0.8, textTransform: 'uppercase' },
  topTitle: { fontSize: 18, fontWeight: '700', color: C.text, letterSpacing: -0.4, marginTop: 1 },
})
