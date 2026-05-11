import { useEffect, useRef } from "react";
import { View, Animated } from "react-native";
import { Text } from "../ui/Text";

interface WellbeingBarProps {
  score: number;
}

function barColor(score: number): string {
  if (score >= 76) return "#22c55e";
  if (score >= 51) return "#eab308";
  if (score >= 26) return "#f97316";
  return "#ef4444";
}

export function WellbeingBar({ score }: WellbeingBarProps) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: score / 100,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [score]);

  return (
    <View style={{ width: "100%" }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
        <Text className="text-xs font-semibold text-mocha-500 uppercase tracking-wider">Health</Text>
        <Text className="text-xs font-bold text-mocha-700">{score}/100</Text>
      </View>
      <View
        style={{
          height: 10,
          backgroundColor: "#f0e6d8",
          borderRadius: 6,
          overflow: "hidden",
        }}
      >
        <Animated.View
          style={{
            height: "100%",
            borderRadius: 6,
            backgroundColor: barColor(score),
            width: anim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }),
          }}
        />
      </View>
    </View>
  );
}
