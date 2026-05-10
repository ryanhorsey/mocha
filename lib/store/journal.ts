import { create } from "zustand";
import { db } from "../db";
import { journalEntries } from "../db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "expo-crypto";

type JournalEntry = typeof journalEntries.$inferSelect;

interface JournalStore {
  entries: JournalEntry[];
  todayEntry: JournalEntry | null;
  load: (today: string) => Promise<void>;
  saveEntry: (date: string, content: string, mood?: number) => Promise<void>;
}

export const useJournalStore = create<JournalStore>((set, get) => ({
  entries: [],
  todayEntry: null,

  load: async (today) => {
    if (!db) return;
    const all = await db.query.journalEntries.findMany({
      orderBy: (e, { desc }) => [desc(e.date)],
    });
    const todayEntry = all.find((e) => e.date === today) ?? null;
    set({ entries: all, todayEntry });
  },

  saveEntry: async (date, content, mood) => {
    if (!db) return;
    const existing = get().todayEntry;
    const now = new Date();
    if (existing) {
      await db
        .update(journalEntries)
        .set({ content, mood: mood ?? existing.mood, updatedAt: now })
        .where(eq(journalEntries.id, existing.id));
    } else {
      await db.insert(journalEntries).values({
        id: randomUUID(),
        date,
        content,
        mood: mood ?? null,
        createdAt: now,
        updatedAt: now,
      });
    }
    await get().load(date);
  },
}));
