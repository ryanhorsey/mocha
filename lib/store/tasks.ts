import { create } from "zustand";
import { db } from "../db";
import { tasks } from "../db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "expo-crypto";

type Task = typeof tasks.$inferSelect;

interface TasksStore {
  tasks: Task[];
  load: () => Promise<void>;
  addTask: (data: Pick<Task, "title" | "description" | "priority" | "dueDate">) => Promise<void>;
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
    if (!db) return;
    const now = new Date();
    await db.insert(tasks).values({
      id: randomUUID(),
      title: data.title,
      description: data.description ?? null,
      priority: data.priority ?? "medium",
      dueDate: data.dueDate ?? null,
      createdAt: now,
      updatedAt: now,
    });
    await get().load();
  },

  completeTask: async (id) => {
    if (!db) return;
    await db.update(tasks).set({ completedAt: new Date(), updatedAt: new Date() }).where(eq(tasks.id, id));
    await get().load();
  },

  deleteTask: async (id) => {
    if (!db) return;
    await db.delete(tasks).where(eq(tasks.id, id));
    await get().load();
  },
}));
