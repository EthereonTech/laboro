import { useEffect } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native'
import { router } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Svg, Path, Rect, Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg'
import { useAuthStore } from '../store/auth'
import { C } from '../lib/theme'

function LaboroMark({ size = 56 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <Defs>
        <SvgGradient id="lm-stem" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#FFFFFF" />
          <Stop offset="100%" stopColor="#E6ECFF" />
        </SvgGradient>
      </Defs>
      <Rect x="8" y="6" width="14" height="44" rx="3" fill="url(#lm-stem)" />
      <Rect x="8" y="44" width="48" height="14" rx="3" fill="#FFFFFF" fillOpacity={0.16} />
      <Rect x="8" y="44" width="34" height="14" rx="3" fill="#FFFFFF" />
      <Circle cx="50" cy="51" r="7" fill={C.jade} />
      <Circle cx="50" cy="51" r="7" stroke="#FFFFFF" strokeOpacity={0.25} strokeWidth={1.5} />
    </Svg>
  )
}

export default function SplashScreen() {
  const { user, isLoading } = useAuthStore()

  useEffect(() => {
    if (!isLoading && user) {
      router.replace('/(tabs)')
    }
  }, [isLoading, user])

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: C.navy, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={C.jade} size="large" />
      </View>
    )
  }

  return (
    <View style={s.root}>
      <LinearGradient
        colors={[C.navyLight, C.navy, C.navyDeep]}
        style={StyleSheet.absoluteFillObject}
      />
      {/* Top-right glow */}
      <View style={s.glowTR} pointerEvents="none" />

      <SafeAreaView style={s.safe}>
        {/* Brand block */}
        <View style={s.brandRow}>
          <LaboroMark size={56} />
          <View style={s.wordmark}>
            <Text style={s.wordmarkText}>laboro</Text>
            <Text style={s.wordmarkDot}>.</Text>
          </View>
        </View>

        <Text style={s.tagline}>
          Seu próximo{'\n'}turno começa{'\n'}
          <Text style={{ color: C.jade }}>agora.</Text>
        </Text>

        <Text style={s.sub}>
          Marketplace de trabalho por turno com pagamento retido em escrow — você trabalha, recebe na hora.
        </Text>

        <View style={{ flex: 1 }} />

        {/* Trust pill */}
        <View style={s.trustPill}>
          <Svg width="14" height="16" viewBox="0 0 14 16" fill="none">
            <Path d="M3 7V5a4 4 0 1 1 8 0v2" stroke={C.jade} strokeWidth={1.6} strokeLinecap="round" />
            <Rect x="1.5" y="7" width="11" height="8" rx="2" stroke={C.jade} strokeWidth={1.6} />
            <Circle cx="7" cy="11" r="1.2" fill={C.jade} />
          </Svg>
          <Text style={s.trustText}>Pagamento garantido via Pix</Text>
        </View>

        {/* Profile picker */}
        <View style={s.cards}>
          <TouchableOpacity
            style={s.workerCard}
            onPress={() => router.push('/(auth)/phone')}
            activeOpacity={0.88}
          >
            <View style={s.cardIcon}>
              <Svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <Path d="M3 18h18v2H3v-2Zm2-2c0-4 3-7 7-7s7 3 7 7H5Z" stroke={C.jadeInk} strokeWidth={1.8} strokeLinejoin="round" />
                <Path d="M10 9V6h4v3" stroke={C.jadeInk} strokeWidth={1.8} strokeLinecap="round" />
                <Path d="M9 13h6" stroke={C.jadeInk} strokeWidth={1.8} strokeLinecap="round" />
              </Svg>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.workerCardTitle}>Sou trabalhador</Text>
              <Text style={s.workerCardSub}>Encontre turnos perto de você</Text>
            </View>
            <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <Path d="M9 6l6 6-6 6" stroke={C.jadeInk} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </TouchableOpacity>

          {/* Empresa — glass card (opens business app deeplink or same auth) */}
          <TouchableOpacity
            style={s.bizCard}
            onPress={() => router.push('/(auth)/phone')}
            activeOpacity={0.88}
          >
            <View style={s.bizCardIcon}>
              <Svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <Path d="M4 9l1-4h14l1 4v1a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0V9Z" stroke="#fff" strokeWidth={1.8} strokeLinejoin="round" />
                <Path d="M5 12v8h14v-8" stroke="#fff" strokeWidth={1.8} strokeLinejoin="round" />
                <Path d="M10 20v-4h4v4" stroke="#fff" strokeWidth={1.8} strokeLinejoin="round" />
              </Svg>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.bizCardTitle}>Sou empresa</Text>
              <Text style={s.bizCardSub}>Contrate turno por diária ou hora</Text>
            </View>
            <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <Path d="M9 6l6 6-6 6" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </TouchableOpacity>
        </View>

        <Text style={s.footer}>
          Já tem conta?{'  '}
          <Text style={s.footerLink} onPress={() => router.push('/(auth)/phone')}>
            Entrar
          </Text>
        </Text>
      </SafeAreaView>
    </View>
  )
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.navy,
  },
  safe: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
  },
  glowTR: {
    position: 'absolute',
    top: -140,
    right: -120,
    width: 420,
    height: 420,
    borderRadius: 210,
    backgroundColor: 'rgba(0,196,140,0.14)',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 26,
  },
  wordmark: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  wordmarkText: {
    fontSize: 48,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -2,
  },
  wordmarkDot: {
    fontSize: 48,
    fontWeight: '800',
    color: C.jade,
  },
  tagline: {
    marginTop: 28,
    fontSize: 34,
    fontWeight: '700',
    lineHeight: 40,
    letterSpacing: -1.2,
    color: '#fff',
  },
  sub: {
    marginTop: 14,
    fontSize: 15,
    lineHeight: 22,
    color: 'rgba(248,249,252,0.62)',
    maxWidth: 300,
  },
  trustPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: 'rgba(0,196,140,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(0,196,140,0.28)',
    borderRadius: 999,
    alignSelf: 'center',
    marginBottom: 16,
  },
  trustText: {
    color: '#7FE6C5',
    fontSize: 12.5,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  cards: {
    gap: 12,
  },
  workerCard: {
    backgroundColor: C.jade,
    borderRadius: 22,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    shadowColor: C.jade,
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  workerCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: C.jadeInk,
    letterSpacing: -0.3,
  },
  workerCardSub: {
    fontSize: 13.5,
    color: 'rgba(10,42,30,0.72)',
    marginTop: 2,
  },
  bizCard: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 22,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  bizCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  bizCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: -0.3,
  },
  bizCardSub: {
    fontSize: 13.5,
    color: 'rgba(248,249,252,0.62)',
    marginTop: 2,
  },
  footer: {
    marginTop: 18,
    textAlign: 'center',
    fontSize: 13.5,
    color: 'rgba(248,249,252,0.62)',
  },
  footerLink: {
    color: '#fff',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
})
