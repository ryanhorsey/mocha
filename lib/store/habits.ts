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
  streaks: Record<string, number>;
  load: (today: string) => Promise<void>;
  addHabit: (data: Pick<Habit, "name" | "description" | "color" | "icon" | "frequency">) => Promise<void>;
  updateHabit: (id: string, data: Pick<Habit, "name" | "description">) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  toggleHabit: (habitId: string, date: string) => Promise<void>;
  isCompletedToday: (habitId: string) => boolean;
  getStreak: (habitId: string) => number;
}

function shiftDate(dateStr: string, n: number): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0];
}

function computeStreaks(allHabits: Habit[], completedLogs: HabitLog[], today: string): Record<string, number> {
  const byHabit: Record<string, Set<string>> = {};
  for (const log of completedLogs) {
    if (!byHabit[log.habitId]) byHabit[log.habitId] = new Set();
    byHabit[log.habitId].add(log.date);
  }

  const streaks: Record<string, number> = {};
  for (const habit of allHabits) {
    const dates = byHabit[habit.id] ?? new Set<string>();
    let cursor = dates.has(today) ? today : shiftDate(today, -1);
    let count = 0;
    while (dates.has(cursor)) {
      count++;
      cursor = shiftDate(cursor, -1);
    }
    streaks[habit.id] = count;
  }
  return streaks;
}

export const useHabitsStore = create<HabitsStore>((set, get) => ({
  habits: [],
  todayLogs: [],
  streaks: {},

  load: async (today) => {
    if (!db) return;
    const allHabits = await db.query.habits.findMany({
      where: (h, { isNull }) => isNull(h.archivedAt),
    });
    const logs = await db.query.habitLogs.findMany({
      where: (l, { eq }) => eq(l.date, today),
    });
    const completedLogs = await db.query.habitLogs.findMany({
      where: (l, { isNotNull }) => isNotNull(l.completedAt),
    });
    set({ habits: allHabits, todayLogs: logs, streaks: computeStreaks(allHabits, completedLogs, today) });
  },

  addHabit: async (data) => {
    const now = new Date();
    const newHabit: Habit = {
      id: randomUUID(),
      name: data.name,
      description: data.description ?? null,
      color: data.color ?? "#c67332",
      icon: data.icon ?? "circle",
      frequency: data.frequency ?? "daily",
      targetDays: '["mon","tue","wed","thu","fri","sat","sun"]',
      createdAt: now,
      updatedAt: now,
      archivedAt: null,
    };
    set((s) => ({ habits: [...s.habits, newHabit] }));
    if (db) await db.insert(habits).values(newHabit);
  },

  updateHabit: async (id, data) => {
    const now = new Date();
    set((s) => ({
      habits: s.habits.map((h) =>
        h.id === id ? { ...h, name: data.name, description: data.description, updatedAt: now } : h
      ),
    }));
    if (db) await db.update(habits).set({ name: data.name, description: data.description, updatedAt: now }).where(eq(habits.id, id));
  },

  deleteHabit: async (id) => {
    const now = new Date();
    set((s) => ({ habits: s.habits.filter((h) => h.id !== id) }));
    if (db) await db.update(habits).set({ archivedAt: now }).where(eq(habits.id, id));
  },

  toggleHabit: async (habitId, date) => {
    const existing = get().todayLogs.find((l) => l.habitId === habitId);
    const completedAt = existing?.completedAt ? null : new Date();

    if (existing) {
      set((s) => ({
        todayLogs: s.todayLogs.map((l) =>
          l.id === existing.id ? { ...l, completedAt } : l
        ),
      }));
      if (db) await db.update(habitLogs).set({ completedAt }).where(eq(habitLogs.id, existing.id));
    } else {
      const newLog: HabitLog = {
        id: randomUUID(),
        habitId,
        date,
        completedAt: new Date(),
        note: null,
      };
      set((s) => ({ todayLogs: [...s.todayLogs, newLog] }));
      if (db) await db.insert(habitLogs).values(newLog);
    }
    await get().load(date);
  },

  isCompletedToday: (habitId) => {
    const log = get().todayLogs.find((l) => l.habitId === habitId);
    return !!log?.completedAt;
  },

  getStreak: (habitId) => get().streaks[habitId] ?? 0,
}));
