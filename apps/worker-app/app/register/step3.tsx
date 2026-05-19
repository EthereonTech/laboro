import { useState } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet,
  Image, ActivityIndicator, Alert,
} from 'react-native'
import { router } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import Toast from 'react-native-toast-message'
import { api } from '../../lib/api'

export default function RegisterStep3() {
  const [imageUri, setImageUri] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function pickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos acessar sua galeria para enviar a foto.')
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })

    if (!result.canceled) setImageUri(result.assets[0].uri)
  }

  async function handleUpload() {
    if (!imageUri) { router.push('/register/step4'); return }
    setLoading(true)
    try {
      const form = new FormData()
      form.append('photo', {
        uri: imageUri,
        name: 'photo.jpg',
        type: 'image/jpeg',
      } as any)
      await api.postForm('/workers/me/photo', form)
      router.push('/register/step4')
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Erro no upload', text2: e.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={s.container}>
      <StepIndicator current={3} total={4} />
      <Text style={s.title}>Foto de perfil</Text>
      <Text style={s.subtitle}>Uma boa foto aumenta suas chances de confirmação.</Text>

      <TouchableOpacity style={s.photoArea} onPress={pickImage}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={s.photo} />
        ) : (
          <View style={s.placeholder}>
            <Text style={s.placeholderIcon}>📷</Text>
            <Text style={s.placeholderText}>Toque para escolher</Text>
          </View>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={s.btn} onPress={handleUpload} disabled={loading}>
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={s.btnText}>{imageUri ? 'Salvar e continuar →' : 'Pular por enquanto →'}</Text>}
      </TouchableOpacity>
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

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24, paddingTop: 60 },
  title: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#6B7280', marginBottom: 32 },
  photoArea: { alignSelf: 'center', marginBottom: 32 },
  photo: { width: 160, height: 160, borderRadius: 80 },
  placeholder: {
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: '#F3F4F6', borderWidth: 2,
    borderColor: '#D1D5DB', borderStyle: 'dashed',
    justifyContent: 'center', alignItems: 'center',
  },
  placeholderIcon: { fontSize: 40, marginBottom: 8 },
  placeholderText: { fontSize: 13, color: '#9CA3AF' },
  btn: { backgroundColor: '#1D4ED8', borderRadius: 12, padding: 16, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
})
