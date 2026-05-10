import { useEffect, useState } from "react";
import { ScrollView, View, TextInput, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "../../components/ui/Text";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { useJournalStore } from "../../lib/store/journal";
import { MOOD_EMOJIS, MOOD_LABELS } from "../../types";

const TODAY = new Date().toISOString().split("T")[0];
const MOODS = [1, 2, 3, 4, 5] as const;

const PROMPTS = [
  "What's on your mind today?",
  "What are you grateful for?",
  "What went well today?",
  "What would make today great?",
  "How are you really feeling?",
];

const dailyPrompt = PROMPTS[new Date().getDay() % PROMPTS.length];

export default function JournalScreen() {
  const { todayEntry, entries, load, saveEntry } = useJournalStore();
  const [content, setContent] = useState("");
  const [mood, setMood] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    load(TODAY);
  }, []);

  useEffect(() => {
    if (todayEntry) {
      setContent(todayEntry.content);
      setMood(todayEntry.mood);
    }
  }, [todayEntry]);

  const handleSave = async () => {
    if (!content.trim()) return;
    await saveEntry(TODAY, content.trim(), mood ?? undefined);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const pastEntries = entries.filter((e) => e.date !== TODAY);

  return (
    <SafeAreaView className="flex-1 bg-mocha-50">
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false} keyboardDismissMode="on-drag">
        <View className="mt-4 mb-6">
          <Text className="text-3xl font-bold">Journal 📓</Text>
          <Text className="text-sm text-mocha-400 mt-1">{TODAY}</Text>
        </View>

        {/* Mood */}
        <Card className="mb-4">
          <Text className="text-sm font-semibold text-mocha-600 mb-3">How are you feeling?</Text>
          <View className="flex-row justify-between">
            {MOODS.map((m) => (
              <TouchableOpacity
                key={m}
                onPress={() => setMood(m)}
                className={`items-center flex-1 py-2 rounded-xl ${
                  mood === m ? "bg-mocha-100" : ""
                }`}
              >
                <Text className="text-2xl">{MOOD_EMOJIS[m]}</Text>
                <Text className="text-xs text-mocha-500 mt-1">{MOOD_LABELS[m]}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Entry */}
        <Card className="mb-4">
          <Text className="text-sm text-mocha-400 italic mb-3">{dailyPrompt}</Text>
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

        <Button
          label={saved ? "Saved ✓" : "Save Entry"}
          onPress={handleSave}
          className="mb-8"
        />

        {/* Past entries */}
        {pastEntries.length > 0 && (
          <>
            <Text className="text-base font-bold mb-3">Past Entries</Text>
            {pastEntries.slice(0, 10).map((entry) => (
              <Card key={entry.id} className="mb-3">
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-sm font-semibold text-mocha-600">{entry.date}</Text>
                  {entry.mood && (
                    <Text className="text-lg">{MOOD_EMOJIS[entry.mood]}</Text>
                  )}
                </View>
                <Text className="text-sm text-mocha-700" numberOfLines={3}>
                  {entry.content}
                </Text>
              </Card>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
