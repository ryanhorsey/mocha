export type Priority = "low" | "medium" | "high" | "urgent";
export type Frequency = "daily" | "weekly" | "custom";
export type Mood = 1 | 2 | 3 | 4 | 5;

export const MOOD_LABELS: Record<number, string> = {
  1: "Rough",
  2: "Meh",
  3: "Okay",
  4: "Good",
  5: "Great",
};

export const MOOD_EMOJIS: Record<number, string> = {
  1: "😞",
  2: "😕",
  3: "😐",
  4: "🙂",
  5: "😄",
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  low: "#6b7280",
  medium: "#c67332",
  high: "#ef4444",
  urgent: "#7c3aed",
};
