import { ScrollView, View, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "../ui/Text";
import { Card } from "../ui/Card";
import { BOTTOM_ORB_RESERVED } from "./orbConfig";

interface MenuItemProps {
  icon: string;
  label: string;
  description: string;
  soon?: boolean;
}

function MenuItem({ icon, label, description, soon }: MenuItemProps) {
  return (
    <TouchableOpacity disabled={soon}>
      <Card className="mb-3 flex-row items-center">
        <Text className="text-2xl mr-3">{icon}</Text>
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Text className="text-base font-semibold">{label}</Text>
            {soon && (
              <View className="bg-mocha-100 rounded-full px-2 py-0.5">
                <Text className="text-xs text-mocha-500 font-medium">Soon</Text>
              </View>
            )}
          </View>
          <Text className="text-sm text-mocha-400">{description}</Text>
        </View>
        <Text className="text-mocha-300 text-lg">›</Text>
      </Card>
    </TouchableOpacity>
  );
}

export function YouWorld() {
  return (
    <View className="flex-1 bg-mocha-50">
      <SafeAreaView className="flex-1" edges={["top", "left", "right"]}>
        <ScrollView
          className="flex-1 px-4"
          contentContainerStyle={{ paddingBottom: BOTTOM_ORB_RESERVED }}
          showsVerticalScrollIndicator={false}
        >
          <View className="mt-4 mb-6">
            <Text className="text-3xl font-bold">You</Text>
            <Text className="text-sm text-mocha-500 mt-1">
              Settings, sync, and customization.
            </Text>
          </View>

          <Text className="text-xs font-bold text-mocha-400 uppercase tracking-widest mb-2 ml-1">
            Coming Soon
          </Text>
          <MenuItem icon="🎯" label="Goals" description="Long-term targets and milestones" soon />
          <MenuItem icon="📝" label="Notes" description="Freeform notes and quick capture" soon />
          <MenuItem icon="📅" label="Calendar" description="Events and scheduling" soon />
          <MenuItem icon="❤️" label="Health" description="Sleep, steps, and wellness" soon />

          <Text className="text-xs font-bold text-mocha-400 uppercase tracking-widest mb-2 ml-1 mt-4">
            Future
          </Text>
          <MenuItem icon="🤖" label="AI Briefing" description="Daily summary and suggestions" soon />
          <MenuItem icon="⌚" label="Watch App" description="Apple Watch companion" soon />
          <MenuItem icon="📿" label="Hardware" description="Mocha pendant integration" soon />

          <Text className="text-xs font-bold text-mocha-400 uppercase tracking-widest mb-2 ml-1 mt-4">
            Settings
          </Text>
          <MenuItem icon="🔔" label="Notifications" description="Reminders and alerts" soon />
          <MenuItem icon="☁️" label="Sync" description="Connect Supabase account" soon />
          <MenuItem icon="🎨" label="Appearance" description="Theme and display" soon />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
