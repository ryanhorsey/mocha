import { useEffect } from "react";
import { View } from "react-native";
import Animated, { useSharedValue, withSpring, useAnimatedStyle } from "react-native-reanimated";

export type MascotExpression = "sleepy" | "neutral" | "happy" | "excited";

interface MascotProps {
  expression?: MascotExpression;
  size?: number;
}

const EYE_HEIGHTS: Record<MascotExpression, number> = {
  sleepy: 3,
  neutral: 8,
  happy: 10,
  excited: 13,
};

const MOUTH_WIDTHS: Record<MascotExpression, number> = {
  sleepy: 12,
  neutral: 18,
  happy: 22,
  excited: 26,
};

const MOUTH_BORDER_RADII: Record<MascotExpression, number> = {
  sleepy: 1,
  neutral: 1,
  happy: 4,
  excited: 6,
};

const GLOW_OPACITY: Record<MascotExpression, number> = {
  sleepy: 0,
  neutral: 0,
  happy: 0.08,
  excited: 0.18,
};

export function Mascot({ expression = "neutral", size = 1 }: MascotProps) {
  const scale = useSharedValue(1);
  const headW = Math.round(72 * size);
  const headH = Math.round(66 * size);
  const bodyW = Math.round(90 * size);
  const bodyH = Math.round(78 * size);
  const eyeW = Math.round(10 * size);
  const eyeGap = Math.round(16 * size);
  const eyeH = Math.round(EYE_HEIGHTS[expression] * size);
  const mouthW = Math.round(MOUTH_WIDTHS[expression] * size);
  const mouthBR = MOUTH_BORDER_RADII[expression];

  useEffect(() => {
    scale.value = withSpring(1.08, { damping: 4, stiffness: 200 }, () => {
      scale.value = withSpring(1, { damping: 8, stiffness: 120 });
    });
  }, [expression]);

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={[{ alignItems: "center" }, animStyle]}>
      {/* Glow halo for excited/happy */}
      <View
        style={{
          position: "absolute",
          top: 0,
          width: bodyW + 30,
          height: headH + bodyH + 20,
          borderRadius: (bodyW + 30) / 2,
          backgroundColor: "#c67332",
          opacity: GLOW_OPACITY[expression],
        }}
      />

      {/* Head */}
      <View
        style={{
          width: headW,
          height: headH,
          borderRadius: headW / 2,
          backgroundColor: "#f5f5f5",
          alignItems: "center",
          justifyContent: "center",
          elevation: 4,
          shadowColor: "#888",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 6,
        }}
      >
        {/* Eyes */}
        <View style={{ flexDirection: "row", gap: eyeGap, marginBottom: Math.round(5 * size) }}>
          <View
            style={{
              width: eyeW,
              height: eyeH,
              borderRadius: eyeW / 2,
              backgroundColor: "#222",
            }}
          />
          <View
            style={{
              width: eyeW,
              height: eyeH,
              borderRadius: eyeW / 2,
              backgroundColor: "#222",
            }}
          />
        </View>
        {/* Mouth */}
        <View
          style={{
            width: mouthW,
            height: Math.round(2.5 * size),
            borderRadius: mouthBR,
            backgroundColor: "#444",
          }}
        />
      </View>

      {/* Neck connector */}
      <View
        style={{
          width: Math.round(10 * size),
          height: Math.round(5 * size),
          backgroundColor: "#e8e8e8",
        }}
      />

      {/* Body */}
      <View
        style={{
          width: bodyW,
          height: bodyH,
          borderRadius: Math.round(45 * size),
          backgroundColor: "#f5f5f5",
          alignItems: "center",
          justifyContent: "center",
          elevation: 4,
          shadowColor: "#888",
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.12,
          shadowRadius: 8,
        }}
      >
        {/* Belly divider line */}
        <View
          style={{
            width: Math.round(44 * size),
            height: Math.round(2 * size),
            borderRadius: 2,
            backgroundColor: "#ddd",
          }}
        />
      </View>
    </Animated.View>
  );
}
