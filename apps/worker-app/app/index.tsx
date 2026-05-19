import { Redirect } from 'expo-router'
import { View, ActivityIndicator } from 'react-native'
import { useAuthStore } from '../store/auth'

export default function Index() {
  const { user, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1D4ED8' }}>
        <ActivityIndicator color="#fff" size="large" />
      </View>
    )
  }

  if (!user) return <Redirect href="/(auth)/phone" />

  return <Redirect href="/(tabs)" />
}
