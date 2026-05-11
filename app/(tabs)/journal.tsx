import { useState, useCallback } from "react";
import { ScrollView, View, TextInput, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { Text } from "../../components/ui/Text";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { useJournalStore } from "../../lib/store/journal";
import { MOOD_EMOJIS, MOOD_LABELS } from "../../types";

const MOODS = [1, 2, 3, 4, 5] as const;

const PROMPTS = [
  "What's on your mind today?",
  "What are you grateful for?",
  "What went well today?",
  "What would make today great?",
  "How are you really feeling?",
];

export default function JournalScreen() {
  const { entries, load, addEntry, updateEntry, deleteEntry } = useJournalStore();
  const [today, setToday] = useState(() => new Date().toISOString().split("T")[0]);
  const [content, setContent] = useState("");
  const [mood, setMood] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const dailyPrompt = PROMPTS[new Date().getDay() % PROMPTS.length];

  useFocusEffect(
    useCallback(() => {
      const newToday = new Date().toISOString().split("T")[0];
      setToday(newToday);
      load(newToday);
    }, [])
  );

  function startEdit(entry: (typeof entries)[0]) {
    setEditingId(entry.id);
    setContent(entry.content);
    setMood(entry.mood);
  }

  function cancelEdit() {
    setEditingId(null);
    setContent("");
    setMood(null);
  }

  const handleSave = async () => {
    if (!content.trim()) return;
    if (editingId) {
      await updateEntry(editingId, content.trim(), mood ?? undefined);
    } else {
      await addEntry(today, content.trim(), mood ?? undefined);
    }
    setContent("");
    setMood(null);
    setEditingId(null);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  function confirmDelete(id: string) {
    Alert.alert("Delete entry", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteEntry(id) },
    ]);
  }

  const todayEntries = entries.filter((e) => e.date === today);
  const pastEntries = entries.filter((e) => e.date !== today);

  return (
    <SafeAreaView className="flex-1 bg-mocha-50">
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false} keyboardDismissMode="on-drag">
        <View className="mt-4 mb-4">
          <Text className="text-3xl font-bold">Wellness Log 📓</Text>
          <Text className="text-sm text-mocha-400 mt-1">{today}</Text>
          <Text className="text-xs text-mocha-400 mt-0.5">+20 XP for each new entry</Text>
        </View>

        {/* Mood */}
        <Card className="mb-4">
          <Text className="text-sm font-semibold text-mocha-600 mb-3">How are you feeling?</Text>
          <View className="flex-row justify-between">
            {MOODS.map((m) => (
              <TouchableOpacity
                key={m}
                onPress={() => setMood(mood === m ? null : m)}
                className={`items-center flex-1 py-2 rounded-xl ${mood === m ? "bg-mocha-100" : ""}`}
              >
                <Text className="text-2xl">{MOOD_EMOJIS[m]}</Text>
                <Text className="text-xs text-mocha-500 mt-1">{MOOD_LABELS[m]}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Write box */}
        <Card className="mb-3">
          <Text className="text-sm text-mocha-400 italic mb-3">
            {editingId ? "Editing entry" : dailyPrompt}
          </Text>
          <TextInput
            className="text-mocha-900 text-base min-h-[160px]"
            multiline
            placeholder="Start writing..."
            placeholderTextColor="#c6b29a"
            value={content}
            onChangeText={setContent}
            textAlignVertical="top"
          />
        </Card>

        <View className="flex-row gap-3 mb-6">
          {editingId && (
            <Button label="Cancel" variant="ghost" onPress={cancelEdit} className="flex-1" />
          )}
          <Button
            label={saved ? "Saved ✓  +20 XP" : editingId ? "Save changes" : "Log Entry"}
            onPress={handleSave}
            className={editingId ? "flex-1" : ""}
          />
        </View>

        {/* Today's entries */}
        {todayEntries.length > 0 && (
          <>
            <Text className="text-base font-bold mb-3">
              {todayEntries.length === 1 ? "1 entry today" : `${todayEntries.length} entries today`}
            </Text>
            {todayEntries.map((entry) => (
              <Card key={entry.id} className="mb-3">
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center gap-2">
                    {entry.mood && <Text className="text-lg">{MOOD_EMOJIS[entry.mood]}</Text>}
                    <Text className="text-xs text-mocha-400">
                      {new Date(entry.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </Text>
                  </View>
                  <View className="flex-row gap-3">
                    <TouchableOpacity onPress={() => startEdit(entry)}>
                      <Text className="text-xs font-semibold text-mocha-500">Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => confirmDelete(entry.id)}>
                      <Text className="text-xs font-semibold text-red-400">Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <Text className="text-sm text-mocha-700">{entry.content}</Text>
              </Card>
            ))}
          </>
        )}

        {/* Past entries */}
        {pastEntries.length > 0 && (
          <>
            <Text className="text-base font-bold mb-3 mt-2">Past Entries</Text>
            {pastEntries.slice(0, 20).map((entry) => (
              <Card key={entry.id} className="mb-3">
                <View className="flex-row items-center justify-between mb-1">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-sm font-semibold text-mocha-600">{entry.date}</Text>
                    {entry.mood && <Text className="text-lg">{MOOD_EMOJIS[entry.mood]}</Text>}
                  </View>
                  <View className="flex-row gap-3">
                    <TouchableOpacity onPress={() => startEdit(entry)}>
                      <Text className="text-xs font-semibold text-mocha-500">Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => confirmDelete(entry.id)}>
                      <Text className="text-xs font-semibold text-red-400">Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <Text className="text-sm text-mocha-700" numberOfLines={3}>
                  {entry.content}
                </Text>
              </Card>
            ))}
          </>
        )}

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
