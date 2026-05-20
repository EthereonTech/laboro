import { useState } from 'react'
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, ActivityIndicator,
} from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Svg, Path } from 'react-native-svg'
import { api } from '../../lib/api'
import { C, ICON_PATHS } from '../../lib/theme'
import { specialtyLabel } from '../../lib/format'

type FavoriteWorker = {
  id: string
  worker: {
    id: string
    level: string
    score: number
    total_shifts: number
    specialties: { specialty: string }[]
    user: {
      full_name: string
      photo_url?: string
    }
  }
  shift_count_together: number
  last_shift_date?: string
}

function Icon({ d, size = 18, stroke = C.text, sw = 1.8 }: { d: string; size?: number; stroke?: string; sw?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d={d} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  )
}

function WorkerAvatar({ name, size = 48, ring }: { name: string; size?: number; ring?: string }) {
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  const hue = [...name].reduce((a, c) => a + c.charCodeAt(0), 0) % 360
  const colors = ['#E74C3C','#3498DB','#2ECC71','#9B59B6','#F39C12','#1ABC9C','#E67E22','#E91E63']
  const bg = colors[hue % colors.length]

  return (
    <View style={[
      { width: size, height: size, borderRadius: size / 2, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' },
      ring ? { borderWidth: 2, borderColor: ring } : {},
    ]}>
      <Text style={{ fontSize: size * 0.36, fontWeight: '700', color: '#fff' }}>{initials}</Text>
    </View>
  )
}

function LevelBadge({ level }: { level: string }) {
  const isTopPro = level === 'TOP_PRO'
  return (
    <View style={[lb.wrap, isTopPro ? lb.topPro : lb.verified]}>
      <Icon d={ICON_PATHS.check} size={9} stroke={isTopPro ? C.orange : C.jadeDeep} sw={3} />
      <Text style={[lb.text, isTopPro ? lb.topProText : lb.verifiedText]}>
        {isTopPro ? 'Top Pro' : level === 'VERIFIED' ? 'Verificado' : 'Iniciante'}
      </Text>
    </View>
  )
}

const lb = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 999 },
  topPro: { backgroundColor: '#FFF1E9' },
  verified: { backgroundColor: C.jadeSoft },
  text: { fontSize: 10, fontWeight: '700', letterSpacing: 0.4, textTransform: 'uppercase' },
  topProText: { color: C.orange },
  verifiedText: { color: C.jadeDeep },
})

const FILTER_CHIPS = ['Todos', 'Garçom', 'Bartender', 'Top Pro', 'Recentes']

function FavCard({ fav }: { fav: FavoriteWorker }) {
  const w = fav.worker
  const name = w.user.full_name
  const ring = w.level === 'TOP_PRO' ? C.orange : C.jade
  const specs = w.specialties.slice(0, 2).map(s => specialtyLabel(s.specialty))

  return (
    <View style={card.wrap}>
      <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
        <WorkerAvatar name={name} size={48} ring={ring} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <Text style={card.name}>{name}</Text>
            <LevelBadge level={w.level} />
          </View>
          <View style={card.meta}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
              <Svg width={11} height={11} viewBox="0 0 24 24" fill="#F5B400">
                <Path d={ICON_PATHS.star} stroke="#F5B400" strokeWidth={1.5} />
              </Svg>
              <Text style={[card.metaText, { color: C.text, fontWeight: '700' }]}>{Number(w.score).toFixed(1).replace('.', ',')}</Text>
            </View>
            <Text style={card.metaDot}>·</Text>
            <Text style={card.metaText}><Text style={{ color: C.text, fontWeight: '700' }}>{w.total_shifts}</Text> turnos</Text>
            <Text style={card.metaDot}>·</Text>
            <Text style={[card.metaText, { color: C.navy, fontWeight: '700' }]}>{fav.shift_count_together}× aqui</Text>
          </View>
          <View style={card.tags}>
            {specs.map(s => (
              <View key={s} style={card.tag}>
                <Text style={card.tagText}>{s}</Text>
              </View>
            ))}
          </View>
        </View>
        <TouchableOpacity style={{ padding: 4 }}>
          <Icon d={ICON_PATHS.star} size={20} stroke={C.orange} sw={2} />
        </TouchableOpacity>
      </View>

      <View style={card.footer}>
        {fav.last_shift_date && (
          <Text style={card.lastDate}>Último turno: <Text style={{ color: C.text, fontWeight: '700' }}>{fav.last_shift_date}</Text></Text>
        )}
        <TouchableOpacity style={card.inviteBtn} activeOpacity={0.8}>
          <Icon d={ICON_PATHS.msg} size={12} stroke="#fff" sw={2} />
          <Text style={card.inviteBtnText}>Convidar</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const card = StyleSheet.create({
  wrap: { backgroundColor: '#fff', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: C.line },
  name: { fontSize: 16, fontWeight: '700', color: C.text, letterSpacing: -0.3 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 5, flexWrap: 'wrap' },
  metaText: { fontSize: 12, color: C.textMute },
  metaDot: { fontSize: 12, color: C.textMute },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 6 },
  tag: { backgroundColor: C.surface3, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  tagText: { fontSize: 10.5, fontWeight: '600', color: C.textMute },
  footer: { marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: C.lineSoft, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  lastDate: { fontSize: 11.5, color: C.textMute },
  inviteBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: C.navy, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 9 },
  inviteBtnText: { fontSize: 12, fontWeight: '700', color: '#fff' },
})

export default function EquipeScreen() {
  const insets = useSafeAreaInsets()
  const [activeFilter, setActiveFilter] = useState(0)

  const { data: favorites, isLoading, refetch, isRefetching } = useQuery<FavoriteWorker[]>({
    queryKey: ['business-favorites'],
    queryFn: () => api.get('/businesses/me/favorites'),
  })

  const count = favorites?.length ?? 0

  return (
    <View style={{ flex: 1, backgroundColor: C.surface2 }}>
      <FlatList
        data={favorites ?? []}
        keyExtractor={f => f.id}
        contentContainerStyle={{ paddingTop: 18, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={C.navy} />}
        ListHeaderComponent={
          <>
            {/* Header */}
            <View style={[hdr.wrap, { paddingTop: insets.top + 16 }]}>
              <View>
                <Text style={hdr.sub}>Equipe favorita</Text>
                <Text style={hdr.title}>{count} trabalhador{count !== 1 ? 'es' : ''}</Text>
              </View>
              <TouchableOpacity style={hdr.addBtn}>
                <Icon d={ICON_PATHS.plus} size={14} stroke="#fff" sw={2.4} />
                <Text style={hdr.addBtnText}>Adicionar</Text>
              </TouchableOpacity>
            </View>

            {/* Tip */}
            <View style={tip.card}>
              <View style={tip.icon}>
                <Icon d={ICON_PATHS.star} size={16} stroke={C.orange} sw={2} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={tip.title}>Convide direto sem postar vaga aberta</Text>
                <Text style={tip.sub}>Favoritos têm prioridade ao receber sua proposta.</Text>
              </View>
            </View>

            {/* Filter chips */}
            <FlatList
              data={FILTER_CHIPS}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={i => i}
              style={{ marginTop: 14 }}
              contentContainerStyle={{ paddingHorizontal: 20, gap: 6 }}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  style={[fltr.chip, activeFilter === index && fltr.chipActive]}
                  onPress={() => setActiveFilter(index)}
                >
                  <Text style={[fltr.chipText, activeFilter === index && fltr.chipTextActive]}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </>
        }
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator color={C.navy} style={{ marginTop: 60 }} />
          ) : (
            <View style={{ alignItems: 'center', paddingTop: 60 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: C.text }}>Nenhum favorito ainda</Text>
              <Text style={{ fontSize: 14, color: C.textMute, marginTop: 6, textAlign: 'center', paddingHorizontal: 40 }}>
                Favorite trabalhadores após um turno para convidá-los diretamente
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <View style={{ paddingHorizontal: 20, marginTop: 10 }}>
            <FavCard fav={item} />
          </View>
        )}
      />
    </View>
  )
}

const hdr = StyleSheet.create({
  wrap: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 16,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: C.lineSoft,
  },
  sub: { fontSize: 11.5, fontWeight: '700', color: C.textSoft, letterSpacing: 0.6, textTransform: 'uppercase' },
  title: { fontSize: 22, fontWeight: '800', color: C.text, letterSpacing: -0.6, marginTop: 2 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: C.navy, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 9 },
  addBtnText: { fontSize: 12.5, fontWeight: '700', color: '#fff' },
})

const tip = StyleSheet.create({
  card: {
    marginHorizontal: 20, marginTop: 14,
    backgroundColor: '#FFF5EF', borderWidth: 1, borderColor: `${C.orange}33`,
    borderRadius: 14, padding: 12,
    flexDirection: 'row', gap: 10, alignItems: 'center',
  },
  icon: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#fff', borderWidth: 1, borderColor: `${C.orange}33`, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 13, fontWeight: '700', color: C.text },
  sub: { fontSize: 11.5, color: C.textMute, marginTop: 1, lineHeight: 16 },
})

const fltr = StyleSheet.create({
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: C.line, backgroundColor: '#fff' },
  chipActive: { backgroundColor: C.navy, borderColor: C.navy },
  chipText: { fontSize: 12, fontWeight: '600', color: C.text },
  chipTextActive: { color: '#fff' },
})
