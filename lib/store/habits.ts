import { create } from "zustand";
import { db } from "../db";
import { habits, habitLogs } from "../db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "expo-crypto";

type Habit = typeof habits.$inferSelect;
type HabitLog = typeof habitLogs.$inferSelect;

interface HabitsStore {
  habits: Habit[];
  todayLogs: HabitLog[];
  load: (today: string) => Promise<void>;
  addHabit: (data: Pick<Habit, "name" | "description" | "color" | "icon" | "frequency">) => Promise<void>;
  toggleHabit: (habitId: string, date: string) => Promise<void>;
  isCompletedToday: (habitId: string) => boolean;
}

export const useHabitsStore = create<HabitsStore>((set, get) => ({
  habits: [],
  todayLogs: [],

  load: async (today) => {
    if (!db) return;
    const allHabits = await db.query.habits.findMany({
      where: (h, { isNull }) => isNull(h.archivedAt),
    });
    const logs = await db.query.habitLogs.findMany({
      where: (l, { eq }) => eq(l.date, today),
    });
    set({ habits: allHabits, todayLogs: logs });
  },

  addHabit: async (data) => {
    if (!db) return;
    const now = new Date();
    await db.insert(habits).values({
      id: randomUUID(),
      name: data.name,
      description: data.description ?? null,
      color: data.color ?? "#c67332",
      icon: data.icon ?? "circle",
      frequency: data.frequency ?? "daily",
      createdAt: now,
      updatedAt: now,
    });
    await get().load(new Date().toISOString().split("T")[0]);
  },

  toggleHabit: async (habitId, date) => {
    if (!db) return;
    const existing = get().todayLogs.find((l) => l.habitId === habitId);
    if (existing?.completedAt) {
      await db.update(habitLogs).set({ completedAt: null }).where(eq(habitLogs.id, existing.id));
    } else if (existing) {
      await db.update(habitLogs).set({ completedAt: new Date() }).where(eq(habitLogs.id, existing.id));
    } else {
      await db.insert(habitLogs).values({
        id: randomUUID(),
        habitId,
        date,
        completedAt: new Date(),
      });
    }
    await get().load(date);
  },

  isCompletedToday: (habitId) => {
    const log = get().todayLogs.find((l) => l.habitId === habitId);
    return !!log?.completedAt;
  },
}));
