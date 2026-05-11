import { create } from "zustand";
import { db } from "../db";
import { journalEntries } from "../db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "expo-crypto";
import { useGameStore } from "./game";

type JournalEntry = typeof journalEntries.$inferSelect;

interface JournalStore {
  entries: JournalEntry[];
  load: (today: string) => Promise<void>;
  addEntry: (date: string, content: string, mood?: number) => Promise<void>;
  updateEntry: (id: string, content: string, mood?: number) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
}

export const useJournalStore = create<JournalStore>((set, get) => ({
  entries: [],

  load: async (_today) => {
    if (!db) return;
    const all = await db.query.journalEntries.findMany({
      orderBy: (e, { desc }) => [desc(e.createdAt)],
    });
    set({ entries: all });
  },

  addEntry: async (date, content, mood) => {
    const now = new Date();
    const newEntry: JournalEntry = {
      id: randomUUID(),
      date,
      content,
      mood: mood ?? null,
      tags: "[]",
      createdAt: now,
      updatedAt: now,
    };
    set((s) => ({ entries: [newEntry, ...s.entries] }));
    if (db) await db.insert(journalEntries).values(newEntry);
    await useGameStore.getState().addXP(20);
  },

  updateEntry: async (id, content, mood) => {
    const now = new Date();
    set((s) => ({
      entries: s.entries.map((e) =>
        e.id === id ? { ...e, content, mood: mood ?? e.mood, updatedAt: now } : e
      ),
    }));
    if (db) {
      await db
        .update(journalEntries)
        .set({ content, mood: mood ?? undefined, updatedAt: now })
        .where(eq(journalEntries.id, id));
    }
  },

  deleteEntry: async (id) => {
    set((s) => ({ entries: s.entries.filter((e) => e.id !== id) }));
    if (db) await db.delete(journalEntries).where(eq(journalEntries.id, id));
  },
}));
