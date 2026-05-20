import { Tabs } from 'expo-router'
import { View, StyleSheet } from 'react-native'
import { Svg, Path } from 'react-native-svg'
import { C, ICON_PATHS } from '../../lib/theme'

function TabIcon({ path, focused }: { path: string; focused: boolean }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path
        d={path}
        stroke={focused ? C.navy : C.textSoft}
        strokeWidth={focused ? 2.2 : 1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: C.navy,
        tabBarInactiveTintColor: C.textSoft,
        tabBarStyle: s.tabBar,
        tabBarLabelStyle: s.tabLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Vagas',
          tabBarIcon: ({ focused }) => <TabIcon path={ICON_PATHS.home} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="applications"
        options={{
          title: 'Turnos',
          tabBarIcon: ({ focused }) => <TabIcon path={ICON_PATHS.calendar} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Carteira',
          tabBarIcon: ({ focused }) => <TabIcon path={ICON_PATHS.wallet} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ focused }) => <TabIcon path={ICON_PATHS.user} focused={focused} />,
        }}
      />
    </Tabs>
  )
}

const s = StyleSheet.create({
  tabBar: {
    borderTopWidth: 1,
    borderTopColor: C.lineSoft,
    paddingBottom: 8,
    paddingTop: 8,
    height: 70,
    backgroundColor: C.surface,
  },
  tabLabel: {
    fontSize: 10.5,
    fontWeight: '600',
  },
})
