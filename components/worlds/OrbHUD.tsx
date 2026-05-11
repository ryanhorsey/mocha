import { useMemo } from "react";
import { View, Pressable, useWindowDimensions } from "react-native";
import Animated, {
  type SharedValue,
  useAnimatedStyle,
  useDerivedValue,
  interpolate,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { Text } from "../ui/Text";
import { Orb } from "./Orb";
import {
  ORB_SIZE,
  ORB_TOP_INSET,
  ORB_SIDE_INSET,
  ORB_BOTTOM_INSET,
  WORLD_ORDER,
  WORLD_META,
  type WorldKey,
} from "./orbConfig";

interface Props {
  rotationSV: SharedValue<number>;
  rotationInt: number;
  onTapWorld: (world: WorldKey) => void;
}

// Build a table of slot index values [-9..9]. For each, the corresponding slot
// (mod 3) determines whether the orb is at TL (0), BM (1), or TR (2). The X/Y
// values for each table row are the screen coordinates for that slot. Using a
// wide enough range lets a spring overshoot freely without wrapping.
const SLOT_RANGE = 9;

function buildSlotTable(
  TLx: number,
  TLy: number,
  BMx: number,
  BMy: number,
  TRx: number,
  TRy: number,
) {
  const points: number[] = [];
  const xs: number[] = [];
  const ys: number[] = [];
  const acts: number[] = [];
  for (let i = -SLOT_RANGE; i <= SLOT_RANGE; i++) {
    const m = ((i % 3) + 3) % 3;
    points.push(i);
    if (m === 0) {
      xs.push(TLx);
      ys.push(TLy);
      acts.push(0);
    } else if (m === 1) {
      xs.push(BMx);
      ys.push(BMy);
      acts.push(1);
    } else {
      xs.push(TRx);
      ys.push(TRy);
      acts.push(0);
    }
  }
  return { points, xs, ys, acts };
}

export function OrbHUD({ rotationSV, rotationInt, onTapWorld }: Props) {
  const insets = useSafeAreaInsets();
  const { width: screenW, height: screenH } = useWindowDimensions();

  const table = useMemo(() => {
    const TLx = insets.left + ORB_SIDE_INSET;
    const TLy = insets.top + ORB_TOP_INSET;
    const TRx = screenW - insets.right - ORB_SIDE_INSET - ORB_SIZE;
    const TRy = insets.top + ORB_TOP_INSET;
    const BMx = (screenW - ORB_SIZE) / 2;
    const BMy = screenH - insets.bottom - ORB_SIZE - ORB_BOTTOM_INSET;
    return buildSlotTable(TLx, TLy, BMx, BMy, TRx, TRy);
  }, [insets.left, insets.right, insets.top, insets.bottom, screenW, screenH]);

  return (
    <View
      pointerEvents="box-none"
      style={{ position: "absolute", left: 0, top: 0, right: 0, bottom: 0 }}
    >
      {WORLD_ORDER.map((world, worldIdx) => (
        <OrbSlot
          key={world}
          world={world}
          worldIdx={worldIdx}
          rotationSV={rotationSV}
          rotationInt={rotationInt}
          table={table}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            onTapWorld(world);
          }}
        />
      ))}
    </View>
  );
}

interface SlotProps {
  world: WorldKey;
  worldIdx: number;
  rotationSV: SharedValue<number>;
  rotationInt: number;
  table: ReturnType<typeof buildSlotTable>;
  onPress: () => void;
}

function OrbSlot({ world, worldIdx, rotationSV, rotationInt, table, onPress }: SlotProps) {
  const slotContinuous = useDerivedValue(() => worldIdx + rotationSV.value);
  const activeness = useDerivedValue(() =>
    interpolate(slotContinuous.value, table.points, table.acts),
  );

  const positionStyle = useAnimatedStyle(() => ({
    position: "absolute",
    left: interpolate(slotContinuous.value, table.points, table.xs),
    top: interpolate(slotContinuous.value, table.points, table.ys),
  }));

  // Determine current discrete slot for accessibility state
  const discreteSlot = ((worldIdx + rotationInt) % 3 + 3) % 3;
  const isActive = discreteSlot === 1;
  const meta = WORLD_META[world];

  return (
    <Animated.View style={positionStyle} pointerEvents="box-none">
      <Pressable
        onPress={onPress}
        hitSlop={{ top: 12, left: 12, right: 12, bottom: 12 }}
        accessibilityRole="button"
        accessibilityLabel={meta.a11y}
        accessibilityState={{ selected: isActive }}
        style={{ alignItems: "center" }}
      >
        <Orb color={meta.color} activeness={activeness} />
        <Text
          className={`text-[11px] font-bold mt-1 ${isActive ? "text-mocha-800" : "text-mocha-500"}`}
        >
          {meta.label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}
