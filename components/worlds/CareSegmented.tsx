import { View, Pressable } from "react-native";
import * as Haptics from "expo-haptics";
import { Text } from "../ui/Text";

export type CareSegment = "today" | "habits" | "tasks" | "journal";

const SEGMENTS: { key: CareSegment; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "habits", label: "Habits" },
  { key: "tasks", label: "Tasks" },
  { key: "journal", label: "Journal" },
];

interface Props {
  value: CareSegment;
  onChange: (next: CareSegment) => void;
}

export function CareSegmented({ value, onChange }: Props) {
  return (
    <View className="flex-row gap-1.5 px-4 pt-2 pb-3">
      {SEGMENTS.map((s) => {
        const active = s.key === value;
        return (
          <Pressable
            key={s.key}
            onPress={() => {
              if (!active) {
                Haptics.selectionAsync().catch(() => {});
                onChange(s.key);
              }
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            className={`flex-1 rounded-full py-2 items-center ${active ? "bg-mocha-500" : "bg-mocha-100"}`}
          >
            <Text className={`text-xs font-bold ${active ? "text-white" : "text-mocha-700"}`}>
              {s.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
