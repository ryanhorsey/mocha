import { useState, useCallback } from "react";
import { ScrollView, View, TouchableOpacity, TextInput, Modal, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { Text } from "../../components/ui/Text";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { useHabitsStore } from "../../lib/store/habits";

type Habit = { id: string; name: string; description: string | null };

export default function HabitsScreen() {
  const { habits, load, toggleHabit, addHabit, updateHabit, deleteHabit, isCompletedToday, getStreak } = useHabitsStore();
  const [today, setToday] = useState(() => new Date().toISOString().split("T")[0]);
  const [showModal, setShowModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useFocusEffect(
    useCallback(() => {
      const newToday = new Date().toISOString().split("T")[0];
      setToday(newToday);
      load(newToday);
    }, [])
  );

  const completedCount = habits.filter((h) => isCompletedToday(h.id)).length;
  const canAddHabit = habits.length === 0 || completedCount / habits.length >= 0.5;

  function handleAddPress() {
    if (!canAddHabit) {
      Alert.alert(
        "Finish what you started",
        `Complete at least ${Math.ceil(habits.length / 2)} of today's habits before adding a new one.`
      );
      return;
    }
    setEditingHabit(null);
    setName("");
    setDescription("");
    setShowModal(true);
  }

  function handleEditPress(habit: Habit) {
    setEditingHabit(habit);
    setName(habit.name);
    setDescription(habit.description ?? "");
    setShowModal(true);
  }

  function handleDeletePress(habit: Habit) {
    Alert.alert("Remove protocol", `Remove "${habit.name}"? This can't be undone.`, [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => deleteHabit(habit.id) },
    ]);
  }

  const handleSave = async () => {
    if (!name.trim()) return;
    if (editingHabit) {
      await updateHabit(editingHabit.id, { name: name.trim(), description: description.trim() || null });
    } else {
      await addHabit({ name: name.trim(), description: description.trim() || null, color: "#c67332", icon: "circle", frequency: "daily" });
    }
    setShowModal(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-mocha-50">
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center justify-between mt-4 mb-1">
          <Text className="text-3xl font-bold">Protocols 🤖</Text>
          <TouchableOpacity
            onPress={handleAddPress}
            className="bg-mocha-600 rounded-full w-9 h-9 items-center justify-center"
          >
            <Text className="text-white text-xl font-light">+</Text>
          </TouchableOpacity>
        </View>
        <Text className="text-xs text-mocha-400 mb-5">+10 XP per completion · +25 XP bonus when all done</Text>

        {habits.length === 0 && (
          <Card>
            <Text className="text-sm text-mocha-400 text-center">
              No protocols yet. Tap + to add your first one.
            </Text>
          </Card>
        )}

        {habits.map((habit) => {
          const done = isCompletedToday(habit.id);
          return (
            <Card key={habit.id} className="mb-3">
              <View className="flex-row items-center justify-between">
                <View className="flex-1 mr-3">
                  <Text className="text-base font-semibold">{habit.name}</Text>
                  {habit.description && (
                    <Text className="text-sm text-mocha-400 mt-0.5">{habit.description}</Text>
                  )}
                  <View className="flex-row items-center gap-3 mt-1">
                    {getStreak(habit.id) > 0 && (
                      <Text className="text-xs text-mocha-500 font-semibold">
                        🔥 {getStreak(habit.id)} day streak
                      </Text>
                    )}
                    {done && (
                      <View className="bg-green-100 rounded-full px-2 py-0.5">
                        <Text className="text-xs font-bold text-green-600">+10 XP</Text>
                      </View>
                    )}
                  </View>
                  <View className="flex-row gap-4 mt-2">
                    <TouchableOpacity onPress={() => handleEditPress(habit)}>
                      <Text className="text-xs font-semibold text-mocha-500">Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeletePress(habit)}>
                      <Text className="text-xs font-semibold text-red-400">Remove</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => toggleHabit(habit.id, today)}
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

      <Modal visible={showModal} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-mocha-50 rounded-t-3xl p-6">
            <Text className="text-xl font-bold mb-4">
              {editingHabit ? "Edit Protocol" : "New Protocol"}
            </Text>
            <TextInput
              className="bg-white border border-mocha-200 rounded-xl px-4 py-3 text-mocha-900 mb-3"
              placeholder="Protocol name"
              placeholderTextColor="#c6b29a"
              value={name}
              onChangeText={setName}
              autoFocus
            />
            <TextInput
              className="bg-white border border-mocha-200 rounded-xl px-4 py-3 text-mocha-900 mb-4"
              placeholder="Description (optional)"
              placeholderTextColor="#c6b29a"
              value={description}
              onChangeText={setDescription}
            />
            <Button label={editingHabit ? "Save" : "Add Protocol"} onPress={handleSave} className="mb-3" />
            <Button label="Cancel" variant="ghost" onPress={() => setShowModal(false)} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
