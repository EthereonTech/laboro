import { Tabs } from 'expo-router'
import { Svg, Path } from 'react-native-svg'
import { C } from '../../lib/theme'

function TabIcon({ d, focused }: { d: string; focused: boolean }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path
        d={d}
        stroke={focused ? C.navy : C.textSoft}
        strokeWidth={focused ? 2.2 : 1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

const PATHS = {
  home:      'M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-4v-7h-6v7H5a1 1 0 0 1-1-1v-9Z',
  briefcase: 'M4 8h16v12H4zM8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 14h18',
  users:     'M9 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm9 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-15 9a6 6 0 0 1 12 0M16 14a5 5 0 0 1 5 6',
  wallet:    'M3 7a2 2 0 0 1 2-2h13l3 4v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Zm14 5a1.5 1.5 0 1 0 0 3h4v-3h-4Z',
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: C.navy,
        tabBarInactiveTintColor: C.textSoft,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: C.lineSoft,
          paddingBottom: 8,
          paddingTop: 8,
          height: 64,
          backgroundColor: '#fff',
        },
        tabBarLabelStyle: { fontSize: 10.5, fontWeight: '500' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ focused }) => <TabIcon d={PATHS.home} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="shifts"
        options={{
          title: 'Vagas',
          tabBarIcon: ({ focused }) => <TabIcon d={PATHS.briefcase} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Financeiro',
          tabBarIcon: ({ focused }) => <TabIcon d={PATHS.wallet} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Equipe',
          tabBarIcon: ({ focused }) => <TabIcon d={PATHS.users} focused={focused} />,
        }}
      />
    </Tabs>
  )
}
