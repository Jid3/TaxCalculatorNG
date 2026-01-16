import { Tabs } from "expo-router"
import { View, Text } from 'react-native'
import { Ionicons, } from "@expo/vector-icons"
import useTheme from "@/hooks/userTheme"

const TabsLayout = () => {
  const { colors } = useTheme();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: 70,
          paddingBottom: 8,
          paddingTop: 2,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "bold",
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name='home'
              size={size}
              color={color}
            />
          )
        }}
      />
      <Tabs.Screen
        name="calculator"
        options={{
          title: "Calculator",
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name='calculator'
              size={size}
              color={color}
            />
          )
        }}
      />
      <Tabs.Screen
        name="mytaxes"
        options={{
          title: "My Taxes",
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name='document-text'
              size={size}
              color={color}
            />
          )
        }}
      />
      <Tabs.Screen
        name="education"
        options={{
          title: "Education",
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name='book-outline'
              size={size}
              color={color}
            />
          )
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name='settings-outline'
              size={size}
              color={color}
            />
          )
        }}
      />



    </Tabs>
  )

}

export default TabsLayout