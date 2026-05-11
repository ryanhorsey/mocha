import { View, Pressable } from "react-native";
import { Text } from "../ui/Text";

interface Props {
  onDismiss: () => void;
}

export function OrbCoachmark({ onDismiss }: Props) {
  return (
    <View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: "30%",
        alignItems: "center",
      }}
    >
      <View
        className="bg-white rounded-3xl px-5 py-4 mx-8 items-center"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.18,
          shadowRadius: 16,
          elevation: 8,
        }}
      >
        <Text className="text-base font-bold text-mocha-800 mb-1">Three worlds</Text>
        <Text className="text-sm text-mocha-600 text-center mb-3 leading-5">
          Tap an orb to swap worlds, or swipe sideways to cycle.
        </Text>
        <Pressable
          onPress={onDismiss}
          className="bg-mocha-500 rounded-full px-5 py-2"
          accessibilityRole="button"
        >
          <Text className="text-white text-sm font-bold">Got it</Text>
        </Pressable>
      </View>
    </View>
  );
}
