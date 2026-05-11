import { Tabs } from "expo-router";
import { Text } from "react-native";

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: 20 }}>{label}</Text>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#c67332",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarStyle: {
          backgroundColor: "#fdf8f3",
          borderTopColor: "#f7ead9",
          paddingBottom: 8,
          paddingTop: 4,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ focused }) => <TabIcon label="🤖" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="habits"
        options={{
          title: "Protocols",
          tabBarIcon: ({ focused }) => <TabIcon label="🔬" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: "Missions",
          tabBarIcon: ({ focused }) => <TabIcon label="🎯" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: "Wellness Log",
          tabBarIcon: ({ focused }) => <TabIcon label="📋" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: "More",
          tabBarIcon: ({ focused }) => <TabIcon label="⋯" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
