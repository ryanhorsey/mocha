import { useState, useCallback } from "react";
import { ScrollView, View, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { Text } from "../../components/ui/Text";
import { Card } from "../../components/ui/Card";
import { useHabitsStore } from "../../lib/store/habits";
import { useTasksStore } from "../../lib/store/tasks";
import { useJournalStore } from "../../lib/store/journal";
import { useRecommendationsStore } from "../../lib/store/recommendations";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function todayLabel() {
  const d = new Date();
  return `${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

function greeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Good morning ☕";
  if (hour >= 12 && hour < 17) return "Good afternoon ☀️";
  if (hour >= 17 && hour < 21) return "Good evening 🌆";
  return "Good night 🌙";
}

export default function TodayScreen() {
  const { habits, load: loadHabits, toggleHabit, isCompletedToday, addHabit } = useHabitsStore();
  const { tasks, load: loadTasks, completeTask, addTask } = useTasksStore();
  const { entries } = useJournalStore();
  const { items: recs, loading: recsLoading, error: recsError, load: loadRecs, generate, accept, dismiss } = useRecommendationsStore();
  const [today, setToday] = useState(() => new Date().toISOString().split("T")[0]);

  useFocusEffect(
    useCallback(() => {
      const newToday = new Date().toISOString().split("T")[0];
      setToday(newToday);
      loadHabits(newToday);
      loadTasks();
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

  return (
    <SafeAreaView className="flex-1 bg-mocha-50">
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="mt-4 mb-6">
          <Text className="text-sm text-mocha-400 font-medium uppercase tracking-widest">
            {todayLabel()}
          </Text>
          <Text className="text-3xl font-bold text-mocha-900 mt-1">{greeting()}</Text>
        </View>

        {/* Habit summary */}
        <Card className="mb-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-base font-bold">Habits</Text>
            <Text className="text-sm text-mocha-400">
              {completedHabits}/{habits.length} done
            </Text>
          </View>
          {habits.length === 0 ? (
            <Text className="text-sm text-mocha-400">No habits yet. Add one in the Habits tab.</Text>
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
                  <Text className={`text-sm font-medium ${done ? "text-mocha-400 line-through" : "text-mocha-900"}`}>
                    {habit.name}
                  </Text>
                </TouchableOpacity>
              );
            })
          )}
        </Card>

        {/* Tasks for today */}
        <Card className="mb-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-base font-bold">Tasks</Text>
            <Text className="text-sm text-mocha-400">{todayTasks.length} open</Text>
          </View>
          {todayTasks.length === 0 ? (
            <Text className="text-sm text-mocha-400">No open tasks. Add one in the Tasks tab.</Text>
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
              </TouchableOpacity>
            ))
          )}
        </Card>

        {/* Journal prompt */}
        <Card className="mb-4">
          <Text className="text-base font-bold mb-2">Journal</Text>
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
              You haven't written today. Head to the Journal tab to reflect.
            </Text>
          )}
        </Card>

        {/* Recommendations */}
        <View className="mb-8">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-base font-bold">Suggested for you</Text>
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
                <Text className="text-sm font-semibold text-mocha-700">Get more suggestions</Text>
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
                      <Text className="text-white text-sm font-semibold">Add</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => dismiss(rec.id)}
                      className="flex-1 bg-mocha-100 rounded-xl py-2 items-center"
                    >
                      <Text className="text-mocha-600 text-sm font-semibold">Skip</Text>
                    </TouchableOpacity>
                  </View>
                </Card>
              ))}

              {!recsLoading && (
                <TouchableOpacity
                  onPress={() => triggerGenerate(today)}
                  className="items-center py-3"
                >
                  <Text className="text-sm font-semibold text-mocha-500">Give me more suggestions</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
