import { create } from "zustand";
import { db } from "../db";
import { tasks } from "../db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "expo-crypto";
import { useGameStore } from "./game";

type Task = typeof tasks.$inferSelect;

interface TasksStore {
  tasks: Task[];
  load: () => Promise<void>;
  addTask: (data: Pick<Task, "title" | "description" | "priority" | "dueDate">) => Promise<void>;
  updateTask: (id: string, data: Pick<Task, "title" | "priority">) => Promise<void>;
  completeTask: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
}

export const useTasksStore = create<TasksStore>((set, get) => ({
  tasks: [],

  load: async () => {
    if (!db) return;
    const all = await db.query.tasks.findMany({
      where: (t, { isNull }) => isNull(t.completedAt),
      orderBy: (t, { asc }) => [asc(t.dueDate)],
    });
    set({ tasks: all });
  },

  addTask: async (data) => {
    const now = new Date();
    const newTask: Task = {
      id: randomUUID(),
      title: data.title,
      description: data.description ?? null,
      priority: data.priority ?? "medium",
      dueDate: data.dueDate ?? null,
      completedAt: null,
      projectId: null,
      tags: "[]",
      createdAt: now,
      updatedAt: now,
    };
    set((s) => ({ tasks: [...s.tasks, newTask] }));
    if (db) await db.insert(tasks).values(newTask);
  },

  updateTask: async (id, data) => {
    const now = new Date();
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === id ? { ...t, title: data.title, priority: data.priority, updatedAt: now } : t
      ),
    }));
    if (db) await db.update(tasks).set({ title: data.title, priority: data.priority, updatedAt: now }).where(eq(tasks.id, id));
  },

  completeTask: async (id) => {
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }));
    if (db) await db.update(tasks).set({ completedAt: new Date(), updatedAt: new Date() }).where(eq(tasks.id, id));
    await useGameStore.getState().addXP(15);
  },

  deleteTask: async (id) => {
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }));
    if (db) await db.delete(tasks).where(eq(tasks.id, id));
  },
}));
