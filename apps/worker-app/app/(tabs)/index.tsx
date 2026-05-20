import { useState, useCallback } from 'react'
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  RefreshControl, ScrollView, Dimensions,
} from 'react-native'
import { router } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import * as Location from 'expo-location'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Svg, Path, Circle } from 'react-native-svg'
import { api } from '../../lib/api'
import { formatCurrency, formatDateTime, specialtyLabel } from '../../lib/format'
import { C, ICON_PATHS } from '../../lib/theme'
import { useAuthStore } from '../../store/auth'

type Shift = {
  id: string
  specialty: string
  starts_at: string
  ends_at: string
  rate_per_hour: number
  total_value: number
  is_urgent: boolean
  slots: number
  business: { trade_name: string; address: { city: string; neighborhood?: string } }
  distance_km?: number
}

const SPECIALTIES = [
  { id: '', label: 'Todas' },
  { id: 'garcom', label: 'Garçom' },
  { id: 'bartender', label: 'Bartender' },
  { id: 'aux_cozinha', label: 'Aux. cozinha' },
  { id: 'promotor', label: 'Promotor' },
  { id: 'caixa', label: 'Caixa' },
]

const COMPANY_COLORS = [
  '#1B3FA0', '#FF6B35', '#00A372', '#7C2D12', '#6D28D9', '#0369A1',
]

function getCompanyColor(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return COMPANY_COLORS[Math.abs(hash) % COMPANY_COLORS.length]
}

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
}

function Avatar({ name, size = 44 }: { name: string; size?: number }) {
  const hue = [...name].reduce((a, c) => a + c.charCodeAt(0), 0) % 360
  return (
    <View style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: `hsl(${hue}, 45%, 45%)`,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: C.jade,
    }}>
      <Text style={{ color: '#fff', fontWeight: '700', fontSize: size * 0.36 }}>
        {getInitials(name)}
      </Text>
    </View>
  )
}

function Header({ name, score, totalShifts, monthEarnings }: {
  name: string
  score: number
  totalShifts: number
  monthEarnings: number
}) {
  return (
    <View style={hdr.wrap}>
      <View style={hdr.glowTR} pointerEvents="none" />
      <View style={hdr.dotGrid} pointerEvents="none" />

      <View style={hdr.inner}>
        <View style={hdr.topRow}>
          <View style={hdr.nameRow}>
            <Avatar name={name} size={44} />
            <View>
              <Text style={hdr.greet}>Boa tarde,</Text>
              <Text style={hdr.nameText}>{name.split(' ')[0]}</Text>
            </View>
          </View>
          <TouchableOpacity style={hdr.bellBtn} onPress={() => {}}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path d={ICON_PATHS.bell} stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
            <View style={hdr.bellDot} />
          </TouchableOpacity>
        </View>

        {/* Score card */}
        <View style={hdr.scoreCard}>
          <View style={hdr.scoreCardHeader}>
            <Text style={hdr.scoreLabel}>Seu score</Text>
            <View style={hdr.levelBadge}>
              <Text style={hdr.levelText}>✓ Verificado</Text>
            </View>
          </View>
          <View style={hdr.statsRow}>
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                <Svg width={13} height={13} viewBox="0 0 24 24" fill={C.jade}>
                  <Path d={ICON_PATHS.star} fill={C.jade} />
                </Svg>
                <Text style={hdr.statValue}>{score.toFixed(1).replace('.', ',')}</Text>
              </View>
              <Text style={hdr.statLabel}>nota</Text>
            </View>
            <View>
              <Text style={hdr.statValue}>{totalShifts}</Text>
              <Text style={hdr.statLabel}>turnos</Text>
            </View>
            <View>
              <Text style={[hdr.statValue, { fontSize: 18 }]}>{formatCurrency(monthEarnings)}</Text>
              <Text style={hdr.statLabel}>este mês</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  )
}

const hdr = StyleSheet.create({
  wrap: {
    backgroundColor: C.navy,
    paddingTop: 60,
    paddingBottom: 64,
    paddingHorizontal: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  glowTR: {
    position: 'absolute',
    top: -140,
    right: -100,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(0,196,140,0.18)',
  },
  dotGrid: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.05,
  },
  inner: { position: 'relative', zIndex: 1 },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  greet: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 0.1,
  },
  nameText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.5,
    marginTop: 1,
  },
  bellBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellDot: {
    position: 'absolute',
    top: 8,
    right: 9,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: C.orange,
    borderWidth: 2,
    borderColor: C.navy,
  },
  scoreCard: {
    marginTop: 22,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    borderRadius: 18,
    padding: 16,
  },
  scoreCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  scoreLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.55)',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  levelBadge: {
    backgroundColor: 'rgba(0,196,140,0.16)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
  },
  levelText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#7FE6C5',
    letterSpacing: 0.2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.7,
    lineHeight: 26,
  },
  statLabel: {
    fontSize: 11.5,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.55)',
    marginTop: 5,
    letterSpacing: 0.1,
  },
})

function MetaPill({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={mp.pill}>
      <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
        <Path d={icon} stroke={C.navy} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
      <Text style={mp.text}>{text}</Text>
    </View>
  )
}
const mp = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: C.surface3,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
  },
  text: { fontSize: 12, fontWeight: '500', color: C.textMute },
})

function ShiftCard({ shift }: { shift: Shift }) {
  const hours = (new Date(shift.ends_at).getTime() - new Date(shift.starts_at).getTime()) / 3600000
  const companyColor = getCompanyColor(shift.business.trade_name)
  const letter = shift.business.trade_name[0].toUpperCase()
  const dateStr = formatDateTime(shift.starts_at)
  const timeStr = `${new Date(shift.starts_at).getHours().toString().padStart(2, '0')}:${new Date(shift.starts_at).getMinutes().toString().padStart(2, '0')}–${new Date(shift.ends_at).getHours().toString().padStart(2, '0')}:${new Date(shift.ends_at).getMinutes().toString().padStart(2, '0')}`

  return (
    <TouchableOpacity
      style={card.wrap}
      onPress={() => router.push(`/shifts/${shift.id}`)}
      activeOpacity={0.92}
    >
      {shift.is_urgent && (
        <View style={card.urgentBadge}>
          <Text style={card.urgentText}>⚡ Urgente</Text>
        </View>
      )}

      <View style={card.topRow}>
        <View style={[card.companyMark, { backgroundColor: companyColor }]}>
          <Text style={card.companyLetter}>{letter}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={card.companyName} numberOfLines={1}>
            {shift.business.trade_name}
          </Text>
          <Text style={card.role}>{specialtyLabel(shift.specialty)}</Text>
        </View>
      </View>

      <View style={card.metaRow}>
        <MetaPill icon={ICON_PATHS.calendar} text={dateStr} />
        <MetaPill icon={ICON_PATHS.clock} text={timeStr} />
        {shift.distance_km != null && (
          <MetaPill icon={ICON_PATHS.pin} text={`${shift.distance_km.toFixed(1)} km`} />
        )}
      </View>

      <View style={card.footer}>
        <View>
          <Text style={card.value}>{formatCurrency(shift.total_value)}</Text>
          <View style={card.escrowRow}>
            <Svg width={10} height={11} viewBox="0 0 24 24" fill="none">
              <Path d={ICON_PATHS.lock} stroke={C.jadeDeep} strokeWidth={2} />
            </Svg>
            <Text style={card.escrowText}>Reservado em escrow · {hours.toFixed(0)}h</Text>
          </View>
        </View>
        <View style={card.ctaBtn}>
          <Text style={card.ctaText}>Ver vaga</Text>
          <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
            <Path d={ICON_PATHS.chevR} stroke={C.jadeInk} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const card = StyleSheet.create({
  wrap: {
    backgroundColor: C.surface,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: C.line,
    shadowColor: C.navy,
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  urgentBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: C.orange,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  urgentText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  topRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  companyMark: {
    width: 44,
    height: 44,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  companyLetter: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.5,
  },
  companyName: {
    fontSize: 12.5,
    fontWeight: '600',
    color: C.textMute,
    letterSpacing: 0.1,
  },
  role: {
    fontSize: 19,
    fontWeight: '700',
    color: C.text,
    letterSpacing: -0.5,
    marginTop: 1,
    lineHeight: 24,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: C.line,
    borderStyle: 'dashed',
  },
  value: {
    fontSize: 24,
    fontWeight: '800',
    color: C.jadeDeep,
    letterSpacing: -0.8,
    lineHeight: 28,
  },
  escrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  escrowText: {
    fontSize: 11,
    fontWeight: '500',
    color: C.textSoft,
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: C.jade,
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 12,
    shadowColor: C.jade,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  ctaText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: C.jadeInk,
    letterSpacing: -0.1,
  },
})

export default function HomeScreen() {
  const [specialty, setSpecialty] = useState('')
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const user = useAuthStore((s) => s.user)

  // Placeholder worker data — will be replaced by profile query
  const workerName = 'Trabalhador'
  const workerScore = 4.9
  const workerShifts = 0
  const workerMonthEarnings = 0

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['shifts', specialty, coords],
    queryFn: async () => {
      let qs = specialty ? `specialty=${specialty}` : ''
      if (coords) qs += `${qs ? '&' : ''}lat=${coords.lat}&lng=${coords.lng}`
      return api.get<Shift[]>(`/shifts${qs ? '?' + qs : ''}`)
    },
    enabled: !!user,
  })

  const requestLocation = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync()
    if (status !== 'granted') return
    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
    setCoords({ lat: loc.coords.latitude, lng: loc.coords.longitude })
  }, [])

  const urgentCount = data?.filter(s => s.is_urgent).length ?? 0

  return (
    <View style={{ flex: 1, backgroundColor: C.surface2 }}>
      <SafeAreaView edges={['top']} style={{ flex: 0, backgroundColor: C.navy }} />
      <FlatList
        data={data ?? []}
        keyExtractor={(s) => s.id}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={C.jade}
            colors={[C.jade]}
          />
        }
        ListHeaderComponent={
          <View>
            <Header
              name={workerName}
              score={workerScore}
              totalShifts={workerShifts}
              monthEarnings={workerMonthEarnings}
            />

            {/* Floating section */}
            <View style={list.floatSection}>
              {/* Section header */}
              <View style={list.sectionHeader}>
                <View>
                  <Text style={list.sectionTitle}>Vagas para você</Text>
                  <Text style={list.sectionSub}>
                    {urgentCount > 0 && (
                      <Text style={{ color: C.orange, fontWeight: '700' }}>
                        {urgentCount} urgente{urgentCount > 1 ? 's' : ''} ·{' '}
                      </Text>
                    )}
                    {data?.length ?? 0} disponíveis hoje
                  </Text>
                </View>
                <TouchableOpacity onPress={requestLocation}>
                  <Text style={list.sectionLink}>
                    {coords ? '📍 Perto de mim' : 'Ver mapa'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Filter chips */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={list.chips}
              >
                {SPECIALTIES.map((sp) => (
                  <TouchableOpacity
                    key={sp.id}
                    style={[list.chip, specialty === sp.id && list.chipActive]}
                    onPress={() => setSpecialty(sp.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={[list.chipText, specialty === sp.id && list.chipTextActive]}>
                      {sp.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        }
        contentContainerStyle={list.content}
        renderItem={({ item }) => <ShiftCard shift={item} />}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListEmptyComponent={
          isLoading ? null : (
            <View style={list.empty}>
              <Text style={list.emptyIcon}>🔍</Text>
              <Text style={list.emptyText}>Nenhuma vaga disponível agora</Text>
              <Text style={list.emptySub}>Tente mudar os filtros ou verificar mais tarde</Text>
            </View>
          )
        }
      />
    </View>
  )
}

const list = StyleSheet.create({
  floatSection: {
    marginTop: -32,
    backgroundColor: C.surface2,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 22,
    zIndex: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: C.text,
    letterSpacing: -0.6,
  },
  sectionSub: {
    fontSize: 12.5,
    fontWeight: '500',
    color: C.textSoft,
    marginTop: 2,
  },
  sectionLink: {
    fontSize: 13,
    fontWeight: '600',
    color: C.navy,
  },
  chips: {
    paddingHorizontal: 20,
    gap: 8,
    paddingBottom: 4,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.line,
  },
  chipActive: {
    backgroundColor: C.navy,
    borderColor: C.navy,
  },
  chipText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: C.text,
    letterSpacing: -0.1,
  },
  chipTextActive: {
    color: '#fff',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: {
    fontSize: 17,
    fontWeight: '600',
    color: C.text,
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 14,
    color: C.textMute,
    textAlign: 'center',
  },
})
