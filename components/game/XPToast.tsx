import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from "react-native-reanimated";

interface XPToastProps {
  amount: number | null;
}

export function XPToast({ amount }: XPToastProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(0);

  useEffect(() => {
    if (amount == null) return;
    opacity.value = 0;
    translateY.value = 0;
    opacity.value = withSequence(
      withTiming(1, { duration: 200, easing: Easing.out(Easing.quad) }),
      withDelay(1200, withTiming(0, { duration: 600 }))
    );
    translateY.value = withSequence(
      withTiming(-32, { duration: 900, easing: Easing.out(Easing.quad) }),
      withDelay(300, withTiming(-48, { duration: 600 }))
    );
  }, [amount]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  if (amount == null) return null;

  return (
    <View
      style={{
        position: "absolute",
        top: 80,
        left: 0,
        right: 0,
        alignItems: "center",
        zIndex: 100,
        pointerEvents: "none",
      }}
    >
      <Animated.View
        style={[
          {
            backgroundColor: "#fff8f0",
            borderColor: "#c67332",
            borderWidth: 1.5,
            borderRadius: 20,
            paddingHorizontal: 16,
            paddingVertical: 6,
          },
          containerStyle,
        ]}
      >
        <Animated.Text style={{ color: "#c67332", fontWeight: "700", fontSize: 15 }}>
          +{amount} XP
        </Animated.Text>
      </Animated.View>
    </View>
  );
}
