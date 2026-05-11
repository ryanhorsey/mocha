import { create } from "zustand";
import { db } from "../db";
import { recommendations } from "../db/schema";
import { eq, and, gte } from "drizzle-orm";
import { randomUUID } from "expo-crypto";

type Recommendation = typeof recommendations.$inferSelect;

interface GenerateParams {
  today: string;
  habits: { name: string; description: string | null }[];
  tasks: { title: string }[];
  recentMoods: (number | null)[];
}

interface RecommendationsStore {
  items: Recommendation[];
  loading: boolean;
  error: string | null;
  load: (today: string) => Promise<void>;
  generate: (params: GenerateParams) => Promise<void>;
  accept: (id: string) => Promise<void>;
  dismiss: (id: string) => Promise<void>;
}

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

// 30-day cutoff for feedback history
function thirtyDaysAgo() {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().split("T")[0];
}

async function callGemini(prompt: string): Promise<string> {
  const res = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" },
    }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg = body?.error?.message ?? `HTTP ${res.status}`;
    throw new Error(`Gemini: ${msg}`);
  }
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "[]";
}

function buildPrompt(params: GenerateParams, history: Recommendation[], existingTitles: string[]): string {
  const habitList = params.habits.length
    ? params.habits.map((h) => `- ${h.name}${h.description ? `: ${h.description}` : ""}`).join("\n")
    : "None yet";

  const taskList = params.tasks.length
    ? params.tasks.map((t) => `- ${t.title}`).join("\n")
    : "None";

  const moodSummary = params.recentMoods.filter(Boolean).join(", ") || "No data";

  const accepted = history.filter((r) => r.status === "accepted").map((r) => `- "${r.title}" (${r.type})`).join("\n") || "None";
  const dismissed = history.filter((r) => r.status === "dismissed").map((r) => `- "${r.title}" (${r.type})`).join("\n") || "None";

  const avoid = existingTitles.length
    ? `\nDo NOT suggest any of these (already shown today): ${existingTitles.join(", ")}`
    : "";

  return `You are a personal wellness coach helping someone build better habits and manage their life.

Current habits being tracked:
${habitList}

Open tasks:
${taskList}

Recent journal moods (1=terrible, 5=great, last 7 days): ${moodSummary}

Recommendations the user has ACCEPTED (they liked these):
${accepted}

Recommendations the user has DISMISSED (they didn't like these):
${dismissed}
${avoid}

Based on this context, suggest exactly 3 new habits or one-off tasks that would genuinely complement their life. Learn from their accept/dismiss history — if they keep dismissing a category, avoid it. If they accept things in a category, lean into it. Be specific and practical, not generic.

Return ONLY a valid JSON array:
[
  {
    "type": "habit",
    "title": "Short title (max 5 words)",
    "description": "What to do and how (1-2 sentences)",
    "reasoning": "Why this suits them specifically based on their data (1 sentence)"
  }
]`;
}

export const useRecommendationsStore = create<RecommendationsStore>((set, get) => ({
  items: [],
  loading: false,
  error: null,

  load: async (today) => {
    if (!db) return;
    const rows = await db.query.recommendations.findMany({
      where: (r, { eq }) => eq(r.date, today),
      orderBy: (r, { asc }) => [asc(r.createdAt)],
    });
    set({ items: rows });
  },

  generate: async (params) => {
    if (!db) return;
    if (!GEMINI_API_KEY || GEMINI_API_KEY === "your_gemini_api_key_here") {
      set({ error: "Add your Gemini API key to .env to enable suggestions." });
      return;
    }

    set({ loading: true, error: null });
    try {
      const cutoff = thirtyDaysAgo();
      const history = await db.query.recommendations.findMany({
        where: (r, { gte, ne }) => and(gte(r.date, cutoff), ne(r.status, "pending")),
      });

      const existingTitles = get().items.map((r) => r.title);
      const prompt = buildPrompt(params, history as Recommendation[], existingTitles);
      const raw = await callGemini(prompt);

      let suggestions: { type: string; title: string; description: string; reasoning: string }[] = [];
      try {
        suggestions = JSON.parse(raw);
      } catch {
        throw new Error("Invalid response from Gemini");
      }

      const now = new Date();
      const newItems: Recommendation[] = suggestions.slice(0, 3).map((s) => ({
        id: randomUUID(),
        date: params.today,
        type: s.type === "task" ? "task" : "habit",
        title: s.title,
        description: s.description ?? null,
        reasoning: s.reasoning ?? null,
        status: "pending",
        createdAt: now,
      }));

      for (const item of newItems) {
        await db.insert(recommendations).values(item);
      }

      set((state) => ({ items: [...state.items, ...newItems], loading: false }));
    } catch (e: any) {
      set({ loading: false, error: e.message ?? "Failed to generate suggestions" });
    }
  },

  accept: async (id) => {
    if (!db) return;
    await db.update(recommendations).set({ status: "accepted" }).where(eq(recommendations.id, id));
    set((s) => ({ items: s.items.map((r) => (r.id === id ? { ...r, status: "accepted" } : r)) }));
  },

  dismiss: async (id) => {
    if (!db) return;
    await db.update(recommendations).set({ status: "dismissed" }).where(eq(recommendations.id, id));
    set((s) => ({ items: s.items.map((r) => (r.id === id ? { ...r, status: "dismissed" } : r)) }));
  },
}));
