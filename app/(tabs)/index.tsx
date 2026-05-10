import { useEffect } from "react";
import { ScrollView, View, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "../../components/ui/Text";
import { Card } from "../../components/ui/Card";
import { useHabitsStore } from "../../lib/store/habits";
import { useTasksStore } from "../../lib/store/tasks";
import { useJournalStore } from "../../lib/store/journal";
import { MOOD_EMOJIS } from "../../types";

const TODAY = new Date().toISOString().split("T")[0];

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
  const { habits, todayLogs, load: loadHabits, toggleHabit, isCompletedToday } = useHabitsStore();
  const { tasks, load: loadTasks, completeTask } = useTasksStore();
  const { todayEntry } = useJournalStore();

  useEffect(() => {
    loadHabits(TODAY);
    loadTasks();
  }, []);

  const completedHabits = habits.filter((h) => isCompletedToday(h.id)).length;
  const todayTasks = tasks.filter((t) => t.dueDate === TODAY || !t.dueDate).slice(0, 5);

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
            habits.slice(0, 4).map((habit) => {
              const done = isCompletedToday(habit.id);
              return (
                <TouchableOpacity
                  key={habit.id}
                  onPress={() => toggleHabit(habit.id, TODAY)}
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
        <Card className="mb-8">
          <Text className="text-base font-bold mb-2">Journal</Text>
          {todayEntry ? (
            <Text className="text-sm text-mocha-600" numberOfLines={3}>
              {todayEntry.content}
            </Text>
          ) : (
            <Text className="text-sm text-mocha-400">
              You haven't written today. Head to the Journal tab to reflect.
            </Text>
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
