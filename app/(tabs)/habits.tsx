import { useEffect, useState } from "react";
import { ScrollView, View, TouchableOpacity, TextInput, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "../../components/ui/Text";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { useHabitsStore } from "../../lib/store/habits";

const TODAY = new Date().toISOString().split("T")[0];

export default function HabitsScreen() {
  const { habits, load, toggleHabit, addHabit, isCompletedToday } = useHabitsStore();
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
    load(TODAY);
  }, []);

  const handleAdd = async () => {
    if (!name.trim()) return;
    await addHabit({ name: name.trim(), description: null, color: "#c67332", icon: "circle", frequency: "daily" });
    setName("");
    setShowAdd(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-mocha-50">
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center justify-between mt-4 mb-6">
          <Text className="text-3xl font-bold">Habits 🔥</Text>
          <TouchableOpacity
            onPress={() => setShowAdd(true)}
            className="bg-mocha-600 rounded-full w-9 h-9 items-center justify-center"
          >
            <Text className="text-white text-xl font-light">+</Text>
          </TouchableOpacity>
        </View>

        {habits.length === 0 && (
          <Card>
            <Text className="text-sm text-mocha-400 text-center">
              No habits yet. Tap + to add your first one.
            </Text>
          </Card>
        )}

        {habits.map((habit) => {
          const done = isCompletedToday(habit.id);
          return (
            <Card key={habit.id} className="mb-3">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-base font-semibold">{habit.name}</Text>
                  {habit.description && (
                    <Text className="text-sm text-mocha-400 mt-0.5">{habit.description}</Text>
                  )}
                </View>
                <TouchableOpacity
                  onPress={() => toggleHabit(habit.id, TODAY)}
                  className={`w-10 h-10 rounded-full border-2 items-center justify-center ${
                    done ? "bg-mocha-600 border-mocha-600" : "border-mocha-300"
                  }`}
                >
                  {done && <Text className="text-white font-bold">✓</Text>}
                </TouchableOpacity>
              </View>
            </Card>
          );
        })}
      </ScrollView>

      <Modal visible={showAdd} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-mocha-50 rounded-t-3xl p-6">
            <Text className="text-xl font-bold mb-4">New Habit</Text>
            <TextInput
              className="bg-white border border-mocha-200 rounded-xl px-4 py-3 text-mocha-900 mb-4"
              placeholder="Habit name"
              placeholderTextColor="#c6b29a"
              value={name}
              onChangeText={setName}
              autoFocus
            />
            <Button label="Add Habit" onPress={handleAdd} className="mb-3" />
            <Button label="Cancel" variant="ghost" onPress={() => setShowAdd(false)} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
