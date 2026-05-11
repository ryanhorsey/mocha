import { useState, useCallback } from "react";
import { ScrollView, View, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { Text } from "../../components/ui/Text";
import { Card } from "../../components/ui/Card";
import { Mascot } from "../../components/mascot/Mascot";
import { WellbeingBar } from "../../components/game/WellbeingBar";
import { XPToast } from "../../components/game/XPToast";
import { useHabitsStore } from "../../lib/store/habits";
import { useTasksStore } from "../../lib/store/tasks";
import { useJournalStore } from "../../lib/store/journal";
import { useRecommendationsStore } from "../../lib/store/recommendations";
import { useGameStore, getMascotMessage, computeWellbeing } from "../../lib/store/game";
import type { MascotExpression } from "../../components/mascot/Mascot";

function expressionFromWellbeing(score: number): MascotExpression {
  if (score >= 76) return "excited";
  if (score >= 51) return "happy";
  if (score >= 26) return "neutral";
  return "sleepy";
}

export default function TodayScreen() {
  const { habits, load: loadHabits, toggleHabit, isCompletedToday, addHabit } = useHabitsStore();
  const { tasks, load: loadTasks, completeTask, addTask } = useTasksStore();
  const { entries } = useJournalStore();
  const { items: recs, loading: recsLoading, error: recsError, load: loadRecs, generate, accept, dismiss } = useRecommendationsStore();
  const { xp, level, levelName, lastXpGain, load: loadGame } = useGameStore();
  const [today, setToday] = useState(() => new Date().toISOString().split("T")[0]);

  useFocusEffect(
    useCallback(() => {
      const newToday = new Date().toISOString().split("T")[0];
      setToday(newToday);
      loadHabits(newToday);
      loadTasks();
      loadGame();
      loadRecs(newToday).then(() => {
        const pending = useRecommendationsStore.getState().items.filter((r) => r.status === "pending");
        if (pending.length === 0) {
          triggerGenerate(newToday);
        }
      });
    }, [])
  );

  function triggerGenerate(date: string) {
    const recentMoods = entries.slice(0, 7).map((e) => e.mood);
    generate({
      today: date,
      habits: habits.map((h) => ({ name: h.name, description: h.description })),
      tasks: tasks.map((t) => ({ title: t.title })),
      recentMoods,
    });
  }

  async function handleAccept(id: string) {
    const rec = recs.find((r) => r.id === id);
    if (!rec) return;

    if (rec.type === "habit") {
      const completedCount = habits.filter((h) => isCompletedToday(h.id)).length;
      const canAdd = habits.length === 0 || completedCount / habits.length >= 0.5;
      if (!canAdd) {
        Alert.alert(
          "Finish what you started",
          `Complete at least ${Math.ceil(habits.length / 2)} of today's habits before adding a new one.`
        );
        return;
      }
    }

    await accept(id);
    if (rec.type === "habit") {
      await addHabit({ name: rec.title, description: rec.description, color: "#c67332", icon: "circle", frequency: "daily" });
    } else {
      await addTask({ title: rec.title, description: rec.description, priority: "medium", dueDate: null });
    }
  }

  const completedHabits = habits.filter((h) => isCompletedToday(h.id)).length;
  const todayTasks = tasks.filter((t) => t.dueDate === today || !t.dueDate).slice(0, 5);
  const todayEntries = entries.filter((e) => e.date === today);
  const pendingRecs = recs.filter((r) => r.status === "pending");

  const todayMood = todayEntries.find((e) => e.mood != null)?.mood ?? null;
  const wellbeing = computeWellbeing(completedHabits, habits.length, todayEntries.length > 0, todayMood);
  const expression = expressionFromWellbeing(wellbeing);
  const mascotMessage = getMascotMessage(completedHabits, habits.length, todayEntries.length > 0, wellbeing);

  return (
    <SafeAreaView className="flex-1 bg-mocha-50">
      <View style={{ flex: 1, position: "relative" }}>
        <XPToast amount={lastXpGain} />
        <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        {/* Mascot header */}
        <View className="mt-6 mb-5 items-center">
          <Mascot expression={expression} size={1} />

          {/* Speech bubble */}
          <View
            className="bg-white rounded-2xl px-4 py-3 mt-3 mx-4"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.08,
              shadowRadius: 4,
              elevation: 2,
              maxWidth: 300,
            }}
          >
            <Text className="text-sm text-mocha-700 text-center leading-5">{mascotMessage}</Text>
          </View>

          {/* Wellbeing bar */}
          <View className="mt-4 w-full">
            <WellbeingBar score={wellbeing} />
          </View>

          {/* Level badge */}
          <View className="flex-row items-center gap-2 mt-3">
            <View className="bg-mocha-100 rounded-full px-3 py-1">
              <Text className="text-xs font-bold text-mocha-700">
                Lv.{level} {levelName}
              </Text>
            </View>
            <Text className="text-xs text-mocha-400 font-medium">{xp} XP</Text>
          </View>
        </View>

        {/* Active Protocols (habits) */}
        <Card className="mb-4">
          <View className="flex-row items-center justify-between mb-3">
            <View>
              <Text className="text-base font-bold">Active Protocols</Text>
              <Text className="text-xs text-mocha-400">+10 XP per habit · +25 XP all done</Text>
            </View>
            <Text className="text-sm text-mocha-400">
              {completedHabits}/{habits.length}
            </Text>
          </View>
          {habits.length === 0 ? (
            <Text className="text-sm text-mocha-400">No protocols yet. Add one in the Protocols tab.</Text>
          ) : (
            habits.map((habit) => {
              const done = isCompletedToday(habit.id);
              return (
                <TouchableOpacity
                  key={habit.id}
                  onPress={() => toggleHabit(habit.id, today)}
                  className="flex-row items-center py-2"
                >
                  <View
                    className={`w-6 h-6 rounded-full border-2 items-center justify-center mr-3 ${
                      done ? "bg-mocha-600 border-mocha-600" : "border-mocha-300"
                    }`}
                  >
                    {done && <Text className="text-white text-xs font-bold">✓</Text>}
                  </View>
                  <Text className={`text-sm font-medium flex-1 ${done ? "text-mocha-400 line-through" : "text-mocha-900"}`}>
                    {habit.name}
                  </Text>
                  {done && (
                    <View className="bg-green-100 rounded-full px-2 py-0.5">
                      <Text className="text-xs font-bold text-green-600">+10 XP</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })
          )}
        </Card>

        {/* Daily Missions (tasks) */}
        <Card className="mb-4">
          <View className="flex-row items-center justify-between mb-3">
            <View>
              <Text className="text-base font-bold">Daily Missions</Text>
              <Text className="text-xs text-mocha-400">+15 XP per mission</Text>
            </View>
            <Text className="text-sm text-mocha-400">{todayTasks.length} open</Text>
          </View>
          {todayTasks.length === 0 ? (
            <Text className="text-sm text-mocha-400">No open missions. Add one in the Missions tab.</Text>
          ) : (
            todayTasks.map((task) => (
              <TouchableOpacity
                key={task.id}
                onPress={() => completeTask(task.id)}
                className="flex-row items-center py-2"
              >
                <View className="w-6 h-6 rounded border-2 border-mocha-300 items-center justify-center mr-3" />
                <View className="flex-1">
                  <Text className="text-sm font-medium">{task.title}</Text>
                  {task.dueDate && (
                    <Text className="text-xs text-mocha-400 mt-0.5">Due {task.dueDate}</Text>
                  )}
                </View>
                <Text className="text-xs text-mocha-300 font-medium">+15 XP</Text>
              </TouchableOpacity>
            ))
          )}
        </Card>

        {/* Wellness Log (journal) */}
        <Card className="mb-4">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-base font-bold">Wellness Log</Text>
            <Text className="text-xs text-mocha-400">+20 XP for logging</Text>
          </View>
          {todayEntries.length > 0 ? (
            <>
              <Text className="text-xs text-mocha-400 mb-1">
                {todayEntries.length} {todayEntries.length === 1 ? "entry" : "entries"} today
              </Text>
              <Text className="text-sm text-mocha-600" numberOfLines={3}>
                {todayEntries[0].content}
              </Text>
            </>
          ) : (
            <Text className="text-sm text-mocha-400">
              No log entry yet. Head to the Wellness Log tab to reflect.
            </Text>
          )}
        </Card>

        {/* Care Advisor (recommendations) */}
        <View className="mb-8">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-base font-bold">Care Advisor</Text>
            {recsLoading && <ActivityIndicator size="small" color="#c67332" />}
          </View>

          {recsError ? (
            <Card>
              <Text className="text-sm text-mocha-400 text-center">{recsError}</Text>
            </Card>
          ) : pendingRecs.length === 0 && !recsLoading ? (
            <Card>
              <Text className="text-sm text-mocha-400 text-center mb-3">
                All suggestions reviewed for today.
              </Text>
              <TouchableOpacity
                onPress={() => triggerGenerate(today)}
                className="bg-mocha-100 rounded-xl py-2 px-4 self-center"
              >
                <Text className="text-sm font-semibold text-mocha-700">Request new suggestions</Text>
              </TouchableOpacity>
            </Card>
          ) : (
            <>
              {pendingRecs.map((rec) => (
                <Card key={rec.id} className="mb-3">
                  <View className="flex-row items-start justify-between mb-1">
                    <View className="flex-1 mr-3">
                      <View className="flex-row items-center gap-2 mb-1">
                        <View className="bg-mocha-100 rounded-full px-2 py-0.5">
                          <Text className="text-xs font-semibold text-mocha-600 capitalize">{rec.type}</Text>
                        </View>
                        <Text className="text-sm font-bold text-mocha-900 flex-1">{rec.title}</Text>
                      </View>
                      {rec.description && (
                        <Text className="text-sm text-mocha-700 mb-1">{rec.description}</Text>
                      )}
                      {rec.reasoning && (
                        <Text className="text-xs text-mocha-400 italic">{rec.reasoning}</Text>
                      )}
                    </View>
                  </View>
                  <View className="flex-row gap-2 mt-3">
                    <TouchableOpacity
                      onPress={() => handleAccept(rec.id)}
                      className="flex-1 bg-mocha-600 rounded-xl py-2 items-center"
                    >
                      <Text className="text-white text-sm font-semibold">Accept</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => dismiss(rec.id)}
                      className="flex-1 bg-mocha-100 rounded-xl py-2 items-center"
                    >
                      <Text className="text-mocha-600 text-sm font-semibold">Dismiss</Text>
                    </TouchableOpacity>
                  </View>
                </Card>
              ))}

              {!recsLoading && (
                <TouchableOpacity
                  onPress={() => triggerGenerate(today)}
                  className="items-center py-3"
                >
                  <Text className="text-sm font-semibold text-mocha-500">Request more suggestions</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </ScrollView>
      </View>
    </SafeAreaView>
  );
}
