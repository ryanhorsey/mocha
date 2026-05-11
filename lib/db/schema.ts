import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const habits = sqliteTable("habits", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  color: text("color").default("#c67332"),
  icon: text("icon").default("circle"),
  frequency: text("frequency").notNull().default("daily"),
  targetDays: text("target_days").default('["mon","tue","wed","thu","fri","sat","sun"]'),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  archivedAt: integer("archived_at", { mode: "timestamp" }),
});

export const habitLogs = sqliteTable("habit_logs", {
  id: text("id").primaryKey(),
  habitId: text("habit_id")
    .notNull()
    .references(() => habits.id, { onDelete: "cascade" }),
  date: text("date").notNull(),
  completedAt: integer("completed_at", { mode: "timestamp" }),
  note: text("note"),
});

export const tasks = sqliteTable("tasks", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  priority: text("priority").default("medium"),
  dueDate: text("due_date"),
  completedAt: integer("completed_at", { mode: "timestamp" }),
  projectId: text("project_id"),
  tags: text("tags").default("[]"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const projects = sqliteTable("projects", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  color: text("color").default("#c67332"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const journalEntries = sqliteTable("journal_entries", {
  id: text("id").primaryKey(),
  date: text("date").notNull(),
  content: text("content").notNull(),
  mood: integer("mood"),
  tags: text("tags").default("[]"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const recommendations = sqliteTable("recommendations", {
  id: text("id").primaryKey(),
  date: text("date").notNull(),
  type: text("type").notNull(), // 'habit' | 'task'
  title: text("title").notNull(),
  description: text("description"),
  reasoning: text("reasoning"),
  status: text("status").notNull().default("pending"), // 'pending' | 'accepted' | 'dismissed'
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const playerStats = sqliteTable("player_stats", {
  id: text("id").primaryKey(), // always 'singleton'
  xp: integer("xp").notNull().default(0),
  lastBonusDate: text("last_bonus_date"),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});
