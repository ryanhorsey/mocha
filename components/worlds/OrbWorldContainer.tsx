import { useEffect, useMemo, useState } from "react";
import { View, useWindowDimensions } from "react-native";
import Animated, {
  type SharedValue,
  useSharedValue,
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
  withTiming,
  interpolate,
  useReducedMotion,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import * as SecureStore from "expo-secure-store";
import { CareWorld } from "./CareWorld";
import { VillageWorld } from "./VillageWorld";
import { YouWorld } from "./YouWorld";
import { OrbHUD } from "./OrbHUD";
import { OrbCoachmark } from "./OrbCoachmark";
import { WORLD_ORDER, type WorldKey } from "./orbConfig";

const COACHMARK_KEY = "mocha.coachmarkDismissed";
const SWIPE_THRESHOLD = 60;

function worldIndex(key: WorldKey): number {
  return WORLD_ORDER.indexOf(key);
}

function rotationForActiveWorld(active: WorldKey): number {
  // active world's slot should equal 1 (BM): (worldIdx + rotation) mod 3 === 1
  // We use rotation = 1 - worldIdx so the math holds for the initial state.
  return 1 - worldIndex(active);
}

export function OrbWorldContainer() {
  const reducedMotion = useReducedMotion();
  const { width: screenW } = useWindowDimensions();

  // Care is default active; rotation = 0 puts Care at BM since Care's index is 1.
  const [rotationInt, setRotationInt] = useState(0);
  const rotationSV = useSharedValue(0);

  const [coachmarkVisible, setCoachmarkVisible] = useState(false);

  useEffect(() => {
    SecureStore.getItemAsync(COACHMARK_KEY)
      .then((v) => {
        if (v !== "1") setCoachmarkVisible(true);
      })
      .catch(() => setCoachmarkVisible(true));
  }, []);

  function dismissCoachmark() {
    setCoachmarkVisible(false);
    SecureStore.setItemAsync(COACHMARK_KEY, "1").catch(() => {});
  }

  useEffect(() => {
    if (reducedMotion) {
      rotationSV.value = withTiming(rotationInt, { duration: 150 });
    } else {
      rotationSV.value = withSpring(rotationInt, { damping: 14, stiffness: 130, mass: 1 });
    }
  }, [rotationInt, reducedMotion]);

  function commitRotation(delta: number) {
    if (delta === 0) return;
    setRotationInt((r) => r + delta);
  }

  function handleTapWorld(world: WorldKey) {
    const slot = ((worldIndex(world) + rotationInt) % 3 + 3) % 3;
    if (slot === 1) return;
    // slot 0 = TL → +1 (clockwise); slot 2 = TR → -1 (counter-clockwise)
    commitRotation(slot === 0 ? +1 : -1);
  }

  const swipe = Gesture.Pan()
    .activeOffsetX([-20, 20])
    .failOffsetY([-30, 30])
    .onEnd((e) => {
      "worklet";
      if (e.translationX < -SWIPE_THRESHOLD) {
        runOnJS(commitRotation)(-1); // swipe left → next world (counter-clockwise)
      } else if (e.translationX > SWIPE_THRESHOLD) {
        runOnJS(commitRotation)(+1);
      }
    });

  const activeIdx = ((1 - rotationInt) % 3 + 3) % 3;
  const activeWorld: WorldKey = WORLD_ORDER[activeIdx];

  return (
    <GestureDetector gesture={swipe}>
      <View style={{ flex: 1, backgroundColor: "#fdf8f3" }}>
        {WORLD_ORDER.map((world, idx) => (
          <WorldLayer
            key={world}
            worldIdx={idx}
            rotationSV={rotationSV}
            screenW={screenW}
            isActive={world === activeWorld}
            reducedMotion={reducedMotion}
          >
            {world === "village" && <VillageWorld />}
            {world === "care" && <CareWorld />}
            {world === "you" && <YouWorld />}
          </WorldLayer>
        ))}

        <OrbHUD
          rotationSV={rotationSV}
          rotationInt={rotationInt}
          onTapWorld={handleTapWorld}
        />

        {coachmarkVisible && <OrbCoachmark onDismiss={dismissCoachmark} />}
      </View>
    </GestureDetector>
  );
}

interface WorldLayerProps {
  worldIdx: number;
  rotationSV: SharedValue<number>;
  screenW: number;
  isActive: boolean;
  reducedMotion: boolean;
  children: React.ReactNode;
}

function WorldLayer({
  worldIdx,
  rotationSV,
  screenW,
  isActive,
  reducedMotion,
  children,
}: WorldLayerProps) {
  // slot 1 (BM) = visible at x=0; slot 0 (TL) = slid left; slot 2 (TR) = slid right.
  // During spring, slot is continuous. We map slot mod 3 → offset relative to BM.
  const slotContinuous = useDerivedValue(() => worldIdx + rotationSV.value);

  const { points, xs, ops } = useMemo(() => {
    const p: number[] = [];
    const x: number[] = [];
    const o: number[] = [];
    for (let i = -9; i <= 9; i++) {
      const m = ((i % 3) + 3) % 3;
      p.push(i);
      x.push(m === 0 ? -screenW : m === 2 ? screenW : 0);
      o.push(m === 1 ? 1 : 0);
    }
    return { points: p, xs: x, ops: o };
  }, [screenW]);

  const style = useAnimatedStyle(() => {
    if (reducedMotion) {
      const slot = ((slotContinuous.value % 3) + 3) % 3;
      const dist = Math.min(Math.abs(slot - 1), 3 - Math.abs(slot - 1));
      return { opacity: Math.max(0, 1 - dist * 1.5) };
    }
    return {
      transform: [{ translateX: interpolate(slotContinuous.value, points, xs) }],
      opacity: interpolate(slotContinuous.value, points, ops),
    };
  });

  return (
    <Animated.View
      pointerEvents={isActive ? "auto" : "none"}
      style={[
        { position: "absolute", left: 0, top: 0, right: 0, bottom: 0 },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}
