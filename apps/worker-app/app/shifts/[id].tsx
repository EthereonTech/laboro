import { useState } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  ActivityIndicator, Modal,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Svg, Path, Rect, Circle, G } from 'react-native-svg'
import Toast from 'react-native-toast-message'
import { api } from '../../lib/api'
import { formatCurrency, formatDateTime, formatTime, specialtyLabel } from '../../lib/format'
import { C, ICON_PATHS } from '../../lib/theme'

type ShiftDetail = {
  id: string
  specialty: string
  starts_at: string
  ends_at: string
  rate_per_hour: number
  total_value: number
  laboro_fee: number
  slots: number
  is_urgent: boolean
  status: string
  instructions: string | null
  address: { street?: string; neighborhood?: string; city: string; state: string } | null
  business: {
    trade_name: string
    segment: string
    score: number
    address: { street: string; neighborhood: string; city: string; state: string }
  }
  my_application?: { status: string } | null
}

const COMPANY_COLORS = [
  '#1B3FA0', '#FF6B35', '#00A372', '#7C2D12', '#6D28D9', '#0369A1',
]

function getCompanyColor(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return COMPANY_COLORS[Math.abs(hash) % COMPANY_COLORS.length]
}

function IconBox({ path, size = 16, color = C.navy, bgColor = C.surface3 }: {
  path: string; size?: number; color?: string; bgColor?: string
}) {
  return (
    <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: bgColor, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d={path} stroke={color} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    </View>
  )
}

function AcceptedSheet({ shift, value, onClose }: { shift: ShiftDetail; value: string; onClose: () => void }) {
  const companyColor = getCompanyColor(shift.business.trade_name)
  return (
    <Modal visible animationType="slide" transparent>
      <View style={sheet.overlay}>
        <View style={sheet.card}>
          <View style={sheet.grabber} />

          {/* Lock icon */}
          <View style={sheet.iconWrap}>
            <Svg width="48" height="56" viewBox="0 0 48 56" fill="none">
              <Rect x="6" y="24" width="36" height="28" rx="6" fill={C.jadeDeep} />
              <Path d="M14 24 V16 a10 10 0 0 1 20 0 V24" stroke={C.jadeDeep} strokeWidth="4" fill="none" strokeLinecap="round" />
              <Path d="M16 38 l6 6 l12 -12" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </View>

          <Text style={sheet.title}>Turno garantido!</Text>
          <Text style={sheet.sub}>
            A empresa já reservou <Text style={{ color: C.jadeDeep, fontWeight: '700' }}>R$ {value}</Text> no escrow.{'\n'}
            Você recebe via Pix logo após o check-out.
          </Text>

          {/* Recap */}
          <View style={sheet.recap}>
            <View style={[sheet.companyMark, { backgroundColor: companyColor }]}>
              <Text style={sheet.companyLetter}>{shift.business.trade_name[0]}</Text>
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={sheet.recapBiz}>{shift.business.trade_name}</Text>
              <Text style={sheet.recapRole}>{specialtyLabel(shift.specialty)}</Text>
              <Text style={sheet.recapDate}>
                {formatDateTime(shift.starts_at)} · {formatTime(shift.starts_at)}–{formatTime(shift.ends_at)}
              </Text>
            </View>
          </View>

          {/* Actions */}
          <View style={sheet.actions}>
            <TouchableOpacity
              style={sheet.secondaryBtn}
              onPress={onClose}
            >
              <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <Path d={ICON_PATHS.calendar} stroke={C.text} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
              <Text style={sheet.secondaryBtnText}>Ver meus turnos</Text>
            </TouchableOpacity>
            <TouchableOpacity style={sheet.primaryBtn} onPress={onClose}>
              <Text style={sheet.primaryBtnText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const sheet = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(8,16,30,0.55)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: C.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    paddingBottom: 36,
  },
  grabber: {
    width: 40,
    height: 4,
    borderRadius: 4,
    backgroundColor: C.line,
    alignSelf: 'center',
    marginBottom: 20,
  },
  iconWrap: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: C.jadeSoft,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    textAlign: 'center',
    fontSize: 26,
    fontWeight: '800',
    color: C.text,
    letterSpacing: -0.7,
    lineHeight: 30,
    marginBottom: 8,
  },
  sub: {
    textAlign: 'center',
    fontSize: 14.5,
    color: C.textMute,
    lineHeight: 20,
    paddingHorizontal: 20,
    marginBottom: 22,
  },
  recap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: C.surface2,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: C.line,
    marginBottom: 16,
  },
  companyMark: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  companyLetter: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  recapBiz: { fontSize: 12.5, fontWeight: '600', color: C.textMute },
  recapRole: { fontSize: 16, fontWeight: '700', color: C.text, letterSpacing: -0.3, marginTop: 1 },
  recapDate: { fontSize: 12, color: C.textMute, marginTop: 2 },
  actions: { flexDirection: 'row', gap: 10 },
  secondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: C.surface3,
    borderRadius: 14,
    paddingVertical: 14,
  },
  secondaryBtnText: { fontSize: 14, fontWeight: '700', color: C.text },
  primaryBtn: {
    flex: 1,
    backgroundColor: C.navy,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
})

export default function ShiftDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const queryClient = useQueryClient()
  const [showAccepted, setShowAccepted] = useState(false)

  const { data: shift, isLoading } = useQuery({
    queryKey: ['shift', id],
    queryFn: () => api.get<ShiftDetail>(`/shifts/${id}`),
  })

  const apply = useMutation({
    mutationFn: () => api.post(`/shifts/${id}/apply`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shift', id] })
      queryClient.invalidateQueries({ queryKey: ['my-applications'] })
      setShowAccepted(true)
    },
    onError: (e: any) => {
      Toast.show({ type: 'error', text1: 'Erro', text2: e.message })
    },
  })

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: C.surface2, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={C.navy} size="large" />
      </View>
    )
  }

  if (!shift) return null

  const addr = shift.address ?? shift.business.address
  const hours = (new Date(shift.ends_at).getTime() - new Date(shift.starts_at).getTime()) / 3600000
  const workerAmount = Number(shift.total_value) - Number(shift.laboro_fee)
  const hasApplied = !!shift.my_application
  const isConfirmed = shift.my_application?.status === 'CONFIRMED'
  const companyColor = getCompanyColor(shift.business.trade_name)
  const companyLetter = shift.business.trade_name[0].toUpperCase()

  const valueStr = formatCurrency(workerAmount).replace('R$ ', '').replace('R$ ', '')

  return (
    <View style={{ flex: 1, backgroundColor: C.surface2 }}>
      <SafeAreaView edges={['top']} style={{ flex: 0, backgroundColor: C.navy }} />

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Hero */}
        <View style={hero.wrap}>
          <View style={hero.glowTR} pointerEvents="none" />

          {/* Controls */}
          <View style={hero.controls}>
            <TouchableOpacity style={hero.iconBtn} onPress={() => router.back()}>
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                <Path d={ICON_PATHS.chevL} stroke="#fff" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {[ICON_PATHS.x, ICON_PATHS.arrowR].map((p, i) => (
                <TouchableOpacity key={i} style={hero.iconBtn}>
                  <Svg width={17} height={17} viewBox="0 0 24 24" fill="none">
                    <Path d={p} stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Company block */}
          <View style={hero.companyRow}>
            <View style={[hero.companyMark, { backgroundColor: companyColor }]}>
              <Text style={hero.companyLetter}>{companyLetter}</Text>
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={hero.companyLabel}>Empresa</Text>
              <Text style={hero.companyName}>{shift.business.trade_name}</Text>
              <View style={hero.ratingRow}>
                <Svg width={11} height={11} viewBox="0 0 24 24" fill="#FFC04C">
                  <Path d={ICON_PATHS.star} fill="#FFC04C" />
                </Svg>
                <Text style={hero.ratingScore}>{Number(shift.business.score).toFixed(1)}</Text>
                <Text style={hero.ratingMeta}> · {shift.business.segment}</Text>
              </View>
            </View>
          </View>

          {/* Role headline */}
          <View style={{ marginTop: 24 }}>
            {shift.is_urgent && (
              <View style={hero.urgentTag}>
                <Text style={hero.urgentText}>Urgente</Text>
              </View>
            )}
            <Text style={hero.role}>{specialtyLabel(shift.specialty)}</Text>
            <Text style={hero.dateTime}>
              {formatDateTime(shift.starts_at)} · {formatTime(shift.starts_at)}–{formatTime(shift.ends_at)} · {hours.toFixed(0)}h de turno
            </Text>
          </View>
        </View>

        {/* Pay card overlapping hero */}
        <View style={pay.card}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
            <View>
              <Text style={pay.label}>Você recebe</Text>
              <Text style={pay.value}>{formatCurrency(workerAmount)}</Text>
              <Text style={pay.sub}>Diária bruta · sem descontos</Text>
            </View>
            <View style={pay.rateBox}>
              <Text style={pay.rateLabel}>por hora</Text>
              <Text style={pay.rateValue}>{formatCurrency(Number(shift.rate_per_hour))}</Text>
            </View>
          </View>

          {/* Escrow strip */}
          <View style={pay.escrowStrip}>
            <View style={pay.lockBox}>
              <Svg width={15} height={15} viewBox="0 0 24 24" fill="none">
                <Path d={ICON_PATHS.lock} stroke={C.jadeDeep} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={pay.escrowTitle}>Pagamento garantido em escrow</Text>
              <Text style={pay.escrowSub}>
                A empresa reservou {formatCurrency(workerAmount)} · liberamos via Pix em até 1h após o turno
              </Text>
            </View>
          </View>
        </View>

        {/* Content sections */}
        <View style={{ padding: 20, gap: 22 }}>
          {/* Meta cards */}
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <MetaCard
              icon={ICON_PATHS.calendar}
              label="Quando"
              primary={formatDateTime(shift.starts_at)}
              secondary={`${formatTime(shift.starts_at)}–${formatTime(shift.ends_at)}`}
            />
            <MetaCard
              icon={ICON_PATHS.pin}
              label="Onde"
              primary={addr.neighborhood ?? addr.city}
              secondary={`${addr.city}, ${addr.state}`}
            />
          </View>

          {/* Instructions */}
          {shift.instructions && (
            <View>
              <Text style={sec.title}>Instruções</Text>
              <View style={sec.card}>
                <Text style={sec.body}>{shift.instructions}</Text>
              </View>
            </View>
          )}

          {/* Location */}
          <View>
            <Text style={sec.title}>Localização</Text>
            <View style={sec.card}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <Path d={ICON_PATHS.pin} stroke={C.navy} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
                <View style={{ flex: 1 }}>
                  <Text style={sec.locPrimary}>
                    {addr.street ? `${addr.street}` : addr.neighborhood ?? addr.city}
                  </Text>
                  <Text style={sec.locSub}>{addr.city} · {addr.state}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Cancel policy */}
          <View>
            <Text style={sec.title}>Política de cancelamento</Text>
            <View style={[sec.card, { backgroundColor: C.surface3 }]}>
              <Text style={sec.body}>
                Cancele até <Text style={{ color: C.text, fontWeight: '700' }}>6h antes</Text> sem afetar seu score.
                Cancelamentos próximos ao turno reduzem sua reputação na plataforma.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky CTA */}
      <View style={cta.wrap} pointerEvents="box-none">
        {isConfirmed ? (
          <TouchableOpacity
            style={cta.btn}
            onPress={() => router.push(`/checkin/${id}`)}
            activeOpacity={0.88}
          >
            <View>
              <Text style={cta.btnTitle}>Fazer check-in</Text>
              <Text style={cta.btnSub}>Turno confirmado — chegou a hora!</Text>
            </View>
            <View style={cta.btnArrow}>
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                <Path d={ICON_PATHS.chevR} stroke={C.jadeInk} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </View>
          </TouchableOpacity>
        ) : hasApplied ? (
          <View style={[cta.btn, { backgroundColor: C.surface3 }]}>
            <Text style={[cta.btnTitle, { color: C.textMute }]}>Candidatura enviada</Text>
          </View>
        ) : shift.status !== 'OPEN' ? (
          <View style={[cta.btn, { backgroundColor: C.surface3 }]}>
            <Text style={[cta.btnTitle, { color: C.textMute }]}>Vaga encerrada</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={cta.btn}
            onPress={() => apply.mutate()}
            disabled={apply.isPending}
            activeOpacity={0.88}
          >
            {apply.isPending ? (
              <ActivityIndicator color={C.jadeInk} />
            ) : (
              <>
                <View>
                  <Text style={cta.btnTitle}>Aceitar turno</Text>
                  <Text style={cta.btnSub}>{formatCurrency(workerAmount)} reservado no seu nome</Text>
                </View>
                <View style={cta.btnArrow}>
                  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                    <Path d={ICON_PATHS.chevR} stroke={C.jadeInk} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                </View>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      {showAccepted && shift && (
        <AcceptedSheet
          shift={shift}
          value={valueStr}
          onClose={() => {
            setShowAccepted(false)
            router.push('/(tabs)/applications')
          }}
        />
      )}
    </View>
  )
}

function MetaCard({ icon, label, primary, secondary }: {
  icon: string; label: string; primary: string; secondary: string
}) {
  return (
    <View style={mc.card}>
      <View style={mc.iconWrap}>
        <Svg width={15} height={15} viewBox="0 0 24 24" fill="none">
          <Path d={icon} stroke={C.navy} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </View>
      <Text style={mc.label}>{label}</Text>
      <Text style={mc.primary}>{primary}</Text>
      <Text style={mc.secondary}>{secondary}</Text>
    </View>
  )
}

const mc = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: C.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: C.line,
  },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: C.surface3,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 11.5,
    fontWeight: '600',
    color: C.textSoft,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  primary: {
    fontSize: 15,
    fontWeight: '700',
    color: C.text,
    marginTop: 3,
    letterSpacing: -0.2,
  },
  secondary: { fontSize: 12.5, color: C.textMute, marginTop: 1 },
})

const hero = StyleSheet.create({
  wrap: {
    backgroundColor: C.navy,
    paddingTop: 56,
    paddingBottom: 28,
    paddingHorizontal: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  glowTR: {
    position: 'absolute',
    top: -100,
    right: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(0,196,140,0.18)',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 1,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  companyRow: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 22,
    alignItems: 'center',
    zIndex: 1,
  },
  companyMark: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  companyLetter: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.5,
  },
  companyLabel: {
    fontSize: 12.5,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.55)',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  companyName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginTop: 2,
    letterSpacing: -0.4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  ratingScore: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  ratingMeta: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  urgentTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,107,53,0.18)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  urgentText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#FFB89A',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  role: {
    fontSize: 34,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -1.3,
    lineHeight: 38,
  },
  dateTime: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.6)',
    marginTop: 6,
  },
})

const pay = StyleSheet.create({
  card: {
    margin: 20,
    marginTop: -22,
    backgroundColor: C.surface,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: C.line,
    shadowColor: C.navy,
    shadowOpacity: 0.10,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
    zIndex: 2,
  },
  label: {
    fontSize: 11.5,
    fontWeight: '700',
    color: C.textSoft,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 38,
    fontWeight: '800',
    color: C.jadeDeep,
    letterSpacing: -1.5,
    lineHeight: 44,
    marginTop: 4,
  },
  sub: { fontSize: 12.5, color: C.textMute, marginTop: 6 },
  rateBox: {
    backgroundColor: C.jadeSoft,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
    gap: 2,
  },
  rateLabel: {
    fontSize: 10,
    color: C.jadeDeep,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  rateValue: {
    fontSize: 16,
    fontWeight: '700',
    color: C.jadeDeep,
    letterSpacing: -0.3,
  },
  escrowStrip: {
    marginTop: 14,
    padding: 12,
    backgroundColor: '#F7FFFB',
    borderWidth: 1,
    borderColor: `${C.jade}33`,
    borderRadius: 12,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  lockBox: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: `${C.jade}33`,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  escrowTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: C.jadeInk,
    letterSpacing: -0.1,
  },
  escrowSub: {
    fontSize: 11.5,
    color: C.textMute,
    marginTop: 1,
    lineHeight: 16,
  },
})

const sec = StyleSheet.create({
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: C.text,
    letterSpacing: -0.2,
    marginBottom: 8,
  },
  card: {
    backgroundColor: C.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: C.line,
  },
  body: {
    fontSize: 14,
    color: C.textMute,
    lineHeight: 20,
  },
  locPrimary: {
    fontSize: 14,
    fontWeight: '600',
    color: C.text,
  },
  locSub: {
    fontSize: 12,
    color: C.textMute,
    marginTop: 1,
  },
})

const cta = StyleSheet.create({
  wrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 12,
    backgroundColor: 'rgba(248,249,252,0)',
  },
  btn: {
    backgroundColor: C.jade,
    borderRadius: 18,
    padding: 16,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: C.jade,
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  btnTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: C.jadeInk,
    letterSpacing: -0.3,
  },
  btnSub: {
    fontSize: 11.5,
    fontWeight: '600',
    color: 'rgba(10,42,30,0.6)',
    marginTop: 1,
  },
  btnArrow: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(10,42,30,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
