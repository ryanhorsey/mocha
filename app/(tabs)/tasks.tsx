import { useEffect, useState } from "react";
import { ScrollView, View, TouchableOpacity, TextInput, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "../../components/ui/Text";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { useTasksStore } from "../../lib/store/tasks";
import { PRIORITY_COLORS, Priority } from "../../types";

const PRIORITIES: Priority[] = ["low", "medium", "high", "urgent"];

export default function TasksScreen() {
  const { tasks, load, addTask, completeTask, deleteTask } = useTasksStore();
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async () => {
    if (!title.trim()) return;
    await addTask({ title: title.trim(), description: null, priority, dueDate: null });
    setTitle("");
    setPriority("medium");
    setShowAdd(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-mocha-50">
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center justify-between mt-4 mb-6">
          <Text className="text-3xl font-bold">Tasks ✓</Text>
          <TouchableOpacity
            onPress={() => setShowAdd(true)}
            className="bg-mocha-600 rounded-full w-9 h-9 items-center justify-center"
          >
            <Text className="text-white text-xl font-light">+</Text>
          </TouchableOpacity>
        </View>

        {tasks.length === 0 && (
          <Card>
            <Text className="text-sm text-mocha-400 text-center">
              No open tasks. Tap + to add one.
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
              </View>
              <TouchableOpacity onPress={() => deleteTask(task.id)} className="pl-2">
                <Text className="text-mocha-300 text-lg">×</Text>
              </TouchableOpacity>
            </View>
          </Card>
        ))}
      </ScrollView>

      <Modal visible={showAdd} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-mocha-50 rounded-t-3xl p-6">
            <Text className="text-xl font-bold mb-4">New Task</Text>
            <TextInput
              className="bg-white border border-mocha-200 rounded-xl px-4 py-3 text-mocha-900 mb-4"
              placeholder="Task title"
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
            <Button label="Add Task" onPress={handleAdd} className="mb-3" />
            <Button label="Cancel" variant="ghost" onPress={() => setShowAdd(false)} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
