import { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView, ActivityIndicator } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { SafeAreaView } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'
import { api } from '../../lib/api'

const TAGS = [
  { value: 'pontual', label: '⏰ Pontual' },
  { value: 'trabalhou_bem', label: '💪 Trabalhou bem' },
  { value: 'boa_apresentacao', label: '👔 Boa apresentação' },
  { value: 'voltaria', label: '✅ Voltaria a contratar' },
  { value: 'atrasou', label: '⏱ Atrasou' },
  { value: 'sumiu', label: '🚪 Sumiu sem avisar' },
  { value: 'nao_voltaria', label: '❌ Não contrataria novamente' },
]

export default function RatingScreen() {
  // workerId passed as query param: /rating/[shiftId]?workerId=xxx
  const { shiftId, workerId } = useLocalSearchParams<{ shiftId: string; workerId: string }>()
  const queryClient = useQueryClient()
  const [score, setScore] = useState(0)
  const [tags, setTags] = useState<string[]>([])
  const [comment, setComment] = useState('')

  const submitMutation = useMutation({
    mutationFn: () =>
      api.post('/ratings', {
        shift_id: shiftId,
        to_id: workerId,
        score,
        tags,
        comment: comment.trim() || undefined,
      }),
    onSuccess: () => {
      Toast.show({ type: 'success', text1: 'Avaliação enviada! ⭐' })
      queryClient.invalidateQueries({ queryKey: ['shift-detail', shiftId] })
      router.back()
    },
    onError: (e: any) => Toast.show({ type: 'error', text1: 'Erro', text2: e.message }),
  })

  function toggleTag(tag: string) {
    setTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag])
  }

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        <Text style={s.title}>Avalie o trabalhador</Text>
        <Text style={s.subtitle}>Sua avaliação ajuda outros negócios a contratar com mais segurança.</Text>

        <View style={s.starsRow}>
          {[1, 2, 3, 4, 5].map((n) => (
            <TouchableOpacity key={n} onPress={() => setScore(n)}>
              <Text style={[s.star, n <= score && s.starActive]}>★</Text>
            </TouchableOpacity>
          ))}
        </View>

        {score > 0 && (
          <Text style={s.scoreLabel}>
            {score === 1 ? 'Péssimo' : score === 2 ? 'Ruim' : score === 3 ? 'Regular' : score === 4 ? 'Bom' : 'Excelente!'}
          </Text>
        )}

        <Text style={s.sectionLabel}>O que se destacou?</Text>
        <View style={s.tags}>
          {TAGS.map((t) => (
            <TouchableOpacity key={t.value} style={[s.tag, tags.includes(t.value) && s.tagActive]} onPress={() => toggleTag(t.value)}>
              <Text style={[s.tagText, tags.includes(t.value) && s.tagTextActive]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={s.sectionLabel}>Comentário (opcional)</Text>
        <TextInput
          style={s.textArea}
          value={comment}
          onChangeText={setComment}
          multiline
          numberOfLines={4}
          placeholder="Descreva sua experiência com este trabalhador..."
          placeholderTextColor="#9CA3AF"
          maxLength={300}
          textAlignVertical="top"
        />

        <TouchableOpacity
          style={[s.btn, (score === 0 || !workerId || submitMutation.isPending) && s.btnDisabled]}
          onPress={() => submitMutation.mutate()}
          disabled={score === 0 || !workerId || submitMutation.isPending}
        >
          {submitMutation.isPending ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Enviar avaliação ⭐</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={s.skip} onPress={() => router.back()}>
          <Text style={s.skipText}>Avaliar depois</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 24 },
  title: { fontSize: 26, fontWeight: '800', color: '#111827', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#6B7280', marginBottom: 32, lineHeight: 22 },
  starsRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 8 },
  star: { fontSize: 48, color: '#E5E7EB' },
  starActive: { color: '#F59E0B' },
  scoreLabel: { textAlign: 'center', fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 32 },
  sectionLabel: { fontSize: 14, fontWeight: '700', color: '#374151', marginBottom: 12 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  tag: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: '#E5E7EB', backgroundColor: '#F9FAFB' },
  tagActive: { backgroundColor: '#ECFDF5', borderColor: '#065F46' },
  tagText: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  tagTextActive: { color: '#065F46', fontWeight: '700' },
  textArea: { borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12, padding: 14, fontSize: 15, color: '#111827', minHeight: 100, marginBottom: 24 },
  btn: { backgroundColor: '#065F46', borderRadius: 14, padding: 18, alignItems: 'center', marginBottom: 12 },
  btnDisabled: { backgroundColor: '#6EE7B7' },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  skip: { alignItems: 'center', padding: 12 },
  skipText: { color: '#9CA3AF', fontSize: 15 },
})
