import { View } from "react-native";
import Animated, { type SharedValue, useAnimatedStyle, interpolate } from "react-native-reanimated";
import { ORB_SIZE, ORB_ACTIVE_SCALE } from "./orbConfig";

interface Props {
  color: string;
  // 0..1 representing how "active" this orb is (1 = at BM slot)
  activeness: SharedValue<number>;
}

export function Orb({ color, activeness }: Props) {
  const animStyle = useAnimatedStyle(() => {
    const scale = interpolate(activeness.value, [0, 1], [1, ORB_ACTIVE_SCALE]);
    return { transform: [{ scale }] };
  });

  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(activeness.value, [0, 1], [0.15, 0.45]),
  }));

  return (
    <Animated.View
      style={[
        {
          width: ORB_SIZE,
          height: ORB_SIZE,
          borderRadius: ORB_SIZE / 2,
          backgroundColor: color,
          shadowColor: color,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.45,
          shadowRadius: 14,
          elevation: 10,
        },
        animStyle,
      ]}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: ORB_SIZE / 2,
            backgroundColor: "white",
          },
          glowStyle,
        ]}
      />
      {/* top-left specular highlight */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: ORB_SIZE * 0.12,
          left: ORB_SIZE * 0.18,
          width: ORB_SIZE * 0.32,
          height: ORB_SIZE * 0.22,
          borderRadius: ORB_SIZE * 0.16,
          backgroundColor: "white",
          opacity: 0.55,
        }}
      />
      {/* bottom-right occlusion */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          bottom: -ORB_SIZE * 0.05,
          right: -ORB_SIZE * 0.05,
          width: ORB_SIZE * 0.7,
          height: ORB_SIZE * 0.7,
          borderRadius: ORB_SIZE * 0.5,
          backgroundColor: "black",
          opacity: 0.18,
        }}
      />
    </Animated.View>
  );
}
