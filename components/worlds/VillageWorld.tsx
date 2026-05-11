import { useEffect } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "../ui/Text";
import { Card } from "../ui/Card";
import { Mascot } from "../mascot/Mascot";
import { useGameStore } from "../../lib/store/game";
import { useHabitsStore } from "../../lib/store/habits";
import { useJournalStore } from "../../lib/store/journal";
import { computeWellbeing } from "../../lib/store/game";
import { BOTTOM_ORB_RESERVED } from "./orbConfig";

export function VillageWorld() {
  const { level, levelName, xp, load: loadGame } = useGameStore();
  const { habits, load: loadHabits, isCompletedToday } = useHabitsStore();
  const { entries } = useJournalStore();

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    loadGame();
    loadHabits(today);
  }, []);

  const today = new Date().toISOString().split("T")[0];
  const completed = habits.filter((h) => isCompletedToday(h.id)).length;
  const todayEntries = entries.filter((e) => e.date === today);
  const todayMood = todayEntries.find((e) => e.mood != null)?.mood ?? null;
  const wellbeing = computeWellbeing(completed, habits.length, todayEntries.length > 0, todayMood);

  const groundTint =
    wellbeing >= 76 ? "bg-green-100" : wellbeing >= 51 ? "bg-mocha-100" : wellbeing >= 26 ? "bg-mocha-200" : "bg-mocha-300";

  return (
    <View className="flex-1 bg-mocha-50">
      <SafeAreaView className="flex-1" edges={["top", "left", "right"]}>
        <View style={{ flex: 1, paddingBottom: BOTTOM_ORB_RESERVED }} className="px-5">
          <View className="mt-4 mb-4">
            <Text className="text-3xl font-bold">Mocha Village</Text>
            <Text className="text-sm text-mocha-500 mt-1">
              Take care of yourself — and your village grows.
            </Text>
          </View>

          <View className={`rounded-3xl flex-1 ${groundTint} items-center justify-center`}>
            <Mascot expression={wellbeing >= 51 ? "happy" : "neutral"} size={1.4} />
            <Text className="text-base font-bold text-mocha-700 mt-6">
              Wellbeing {wellbeing}%
            </Text>
            <Text className="text-xs text-mocha-500 mt-1">
              Lv.{level} {levelName} · {xp} XP
            </Text>
          </View>

          <Card className="mt-4">
            <Text className="text-sm font-semibold text-mocha-700 mb-1">Coming soon</Text>
            <Text className="text-xs text-mocha-500 leading-5">
              A living scene of buildings tied to your habits — they bloom as you keep up with
              your routine and weather their seasons with you.
            </Text>
          </Card>
        </View>
      </SafeAreaView>
    </View>
  );
}
