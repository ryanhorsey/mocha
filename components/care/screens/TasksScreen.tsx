import { useEffect, useState } from "react";
import { ScrollView, View, TouchableOpacity, TextInput, Modal, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "../../ui/Text";
import { Card } from "../../ui/Card";
import { Button } from "../../ui/Button";
import { useTasksStore } from "../../../lib/store/tasks";
import { PRIORITY_COLORS, Priority } from "../../../types";

type Task = { id: string; title: string; priority: string };

const PRIORITIES: Priority[] = ["low", "medium", "high", "urgent"];

export function TasksScreen() {
  const { tasks, load, addTask, updateTask, completeTask, deleteTask } = useTasksStore();
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");

  useEffect(() => {
    load();
  }, []);

  function handleAddPress() {
    setEditingTask(null);
    setTitle("");
    setPriority("medium");
    setShowModal(true);
  }

  function handleEditPress(task: Task) {
    setEditingTask(task);
    setTitle(task.title);
    setPriority((task.priority as Priority) ?? "medium");
    setShowModal(true);
  }

  function handleDeletePress(task: Task) {
    Alert.alert("Delete task", `Delete "${task.title}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteTask(task.id) },
    ]);
  }

  const handleSave = async () => {
    if (!title.trim()) return;
    if (editingTask) {
      await updateTask(editingTask.id, { title: title.trim(), priority });
    } else {
      await addTask({ title: title.trim(), description: null, priority, dueDate: null });
    }
    setShowModal(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-mocha-50" edges={["left", "right"]}>
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center justify-between mt-4 mb-1">
          <Text className="text-3xl font-bold">Missions ✓</Text>
          <TouchableOpacity
            onPress={handleAddPress}
            className="bg-mocha-600 rounded-full w-9 h-9 items-center justify-center"
          >
            <Text className="text-white text-xl font-light">+</Text>
          </TouchableOpacity>
        </View>
        <Text className="text-xs text-mocha-400 mb-5">+15 XP per completed mission</Text>

        {tasks.length === 0 && (
          <Card>
            <Text className="text-sm text-mocha-400 text-center">
              No open missions. Tap + to add one.
            </Text>
          </Card>
        )}

        {tasks.map((task) => (
          <Card key={task.id} className="mb-3">
            <View className="flex-row items-center">
              <TouchableOpacity
                onPress={() => completeTask(task.id)}
                className="w-6 h-6 rounded border-2 border-mocha-300 items-center justify-center mr-3"
              />
              <View className="flex-1">
                <Text className="text-base font-medium">{task.title}</Text>
                <View className="flex-row items-center mt-1 gap-2">
                  <View
                    className="rounded-full px-2 py-0.5"
                    style={{ backgroundColor: `${PRIORITY_COLORS[task.priority as Priority]}20` }}
                  >
                    <Text
                      className="text-xs font-semibold capitalize"
                      style={{ color: PRIORITY_COLORS[task.priority as Priority] }}
                    >
                      {task.priority}
                    </Text>
                  </View>
                  {task.dueDate && (
                    <Text className="text-xs text-mocha-400">Due {task.dueDate}</Text>
                  )}
                </View>
                <View className="flex-row items-center gap-4 mt-2">
                  <TouchableOpacity onPress={() => handleEditPress(task)}>
                    <Text className="text-xs font-semibold text-mocha-500">Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeletePress(task)}>
                    <Text className="text-xs font-semibold text-red-400">Delete</Text>
                  </TouchableOpacity>
                  <View className="ml-auto">
                    <Text className="text-xs text-mocha-300 font-medium">+15 XP</Text>
                  </View>
                </View>
              </View>
            </View>
          </Card>
        ))}
      </ScrollView>

      <Modal visible={showModal} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-mocha-50 rounded-t-3xl p-6">
            <Text className="text-xl font-bold mb-4">
              {editingTask ? "Edit Mission" : "New Mission"}
            </Text>
            <TextInput
              className="bg-white border border-mocha-200 rounded-xl px-4 py-3 text-mocha-900 mb-4"
              placeholder="Mission title"
              placeholderTextColor="#c6b29a"
              value={title}
              onChangeText={setTitle}
              autoFocus
            />
            <Text className="text-sm font-semibold text-mocha-600 mb-2">Priority</Text>
            <View className="flex-row gap-2 mb-6">
              {PRIORITIES.map((p) => (
                <TouchableOpacity
                  key={p}
                  onPress={() => setPriority(p)}
                  className={`flex-1 py-2 rounded-lg items-center border ${
                    priority === p ? "border-mocha-600 bg-mocha-100" : "border-mocha-200 bg-white"
                  }`}
                >
                  <Text
                    className={`text-xs font-semibold capitalize ${
                      priority === p ? "text-mocha-800" : "text-mocha-400"
                    }`}
                  >
                    {p}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Button label={editingTask ? "Save" : "Add Mission"} onPress={handleSave} className="mb-3" />
            <Button label="Cancel" variant="ghost" onPress={() => setShowModal(false)} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
