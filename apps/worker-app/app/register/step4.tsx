import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native'
import { router } from 'expo-router'

export default function RegisterStep4() {
  return (
    <View style={s.container}>
      <StepIndicator current={4} total={4} />

      <View style={s.center}>
        <Text style={s.emoji}>🎉</Text>
        <Text style={s.title}>Perfil criado!</Text>
        <Text style={s.subtitle}>
          Seu perfil está pronto. Agora você pode buscar vagas perto de você e garantir uma renda extra.
        </Text>

        <View style={s.highlights}>
          <Highlight icon="🔒" text="Pagamento garantido via Pix escrow — você recebe sempre" />
          <Highlight icon="⭐" text="Construa seu score e chegue ao nível Top Pro" />
          <Highlight icon="📍" text="Vagas perto de você, por diária ou turno" />
        </View>
      </View>

      <TouchableOpacity style={s.btn} onPress={() => router.replace('/(tabs)')}>
        <Text style={s.btnText}>Ver vagas disponíveis 🚀</Text>
      </TouchableOpacity>
    </View>
  )
}

function Highlight({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={h.row}>
      <Text style={h.icon}>{icon}</Text>
      <Text style={h.text}>{text}</Text>
    </View>
  )
}

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 8, marginBottom: 32 }}>
      {Array.from({ length: total }, (_, i) => (
        <View key={i} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: i < current ? '#1D4ED8' : '#E5E7EB' }} />
      ))}
    </View>
  )
}

const h = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  icon: { fontSize: 22, marginRight: 12, marginTop: 2 },
  text: { flex: 1, fontSize: 15, color: '#374151', lineHeight: 22 },
})

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24, paddingTop: 60 },
  center: { flex: 1, justifyContent: 'center' },
  emoji: { fontSize: 64, textAlign: 'center', marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: 12 },
  subtitle: { fontSize: 16, color: '#6B7280', textAlign: 'center', lineHeight: 24, marginBottom: 32 },
  highlights: { gap: 0 },
  btn: { backgroundColor: '#1D4ED8', borderRadius: 12, padding: 18, alignItems: 'center', marginBottom: 16 },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
})
