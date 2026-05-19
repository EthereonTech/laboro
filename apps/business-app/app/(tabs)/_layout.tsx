import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#065F46',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: { borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingBottom: 8, paddingTop: 8, height: 64 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Dashboard', tabBarIcon: ({ color, size }) => <Ionicons name="grid-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="shifts" options={{ title: 'Vagas', tabBarIcon: ({ color, size }) => <Ionicons name="briefcase-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="history" options={{ title: 'Histórico', tabBarIcon: ({ color, size }) => <Ionicons name="receipt-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Empresa', tabBarIcon: ({ color, size }) => <Ionicons name="business-outline" size={size} color={color} /> }} />
    </Tabs>
  )
}
