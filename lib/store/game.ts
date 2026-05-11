import { create } from "zustand";
import { db } from "../db";
import { playerStats } from "../db/schema";

const LEVELS = [
  { name: "Resting", threshold: 0 },
  { name: "Stirring", threshold: 100 },
  { name: "Active", threshold: 300 },
  { name: "Thriving", threshold: 600 },
  { name: "Flourishing", threshold: 1000 },
];

function getLevelInfo(xp: number): { level: number; levelName: string; nextThreshold: number | null } {
  let level = 1;
  let levelName = LEVELS[0].name;
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].threshold) {
      level = i + 1;
      levelName = LEVELS[i].name;
      break;
    }
  }
  const nextThreshold = level < LEVELS.length ? LEVELS[level].threshold : null;
  return { level, levelName, nextThreshold };
}

interface GameStore {
  xp: number;
  lastBonusDate: string | null;
  lastXpGain: number | null;
  level: number;
  levelName: string;
  nextThreshold: number | null;
  load: () => Promise<void>;
  addXP: (amount: number) => Promise<void>;
  checkAllHabitsBonus: (completedCount: number, totalCount: number, today: string) => Promise<void>;
}

export const useGameStore = create<GameStore>((set, get) => ({
  xp: 0,
  lastBonusDate: null,
  lastXpGain: null,
  level: 1,
  levelName: "Resting",
  nextThreshold: 100,

  load: async () => {
    if (!db) return;
    const rows = await db.query.playerStats.findMany();
    if (rows.length === 0) return;
    const row = rows[0];
    const { level, levelName, nextThreshold } = getLevelInfo(row.xp);
    set({ xp: row.xp, lastBonusDate: row.lastBonusDate ?? null, level, levelName, nextThreshold });
  },

  addXP: async (amount) => {
    const newXp = get().xp + amount;
    const { level, levelName, nextThreshold } = getLevelInfo(newXp);
    set({ xp: newXp, lastXpGain: amount, level, levelName, nextThreshold });
    setTimeout(() => set({ lastXpGain: null }), 2000);

    if (!db) return;
    const now = new Date();
    await db
      .insert(playerStats)
      .values({ id: "singleton", xp: newXp, lastBonusDate: get().lastBonusDate, updatedAt: now })
      .onConflictDoUpdate({ target: playerStats.id, set: { xp: newXp, updatedAt: now } });
  },

  checkAllHabitsBonus: async (completedCount, totalCount, today) => {
    if (totalCount === 0 || completedCount < totalCount) return;
    if (get().lastBonusDate === today) return;

    set({ lastBonusDate: today });
    if (db) {
      await db
        .insert(playerStats)
        .values({ id: "singleton", xp: get().xp, lastBonusDate: today, updatedAt: new Date() })
        .onConflictDoUpdate({ target: playerStats.id, set: { lastBonusDate: today, updatedAt: new Date() } });
    }
    await get().addXP(25);
  },
}));

export function getMascotMessage(
  completedHabits: number,
  totalHabits: number,
  hasJournal: boolean,
  wellbeing: number
): string {
  if (totalHabits === 0) {
    return "Hello. I am Mocha, your personal care companion. Let us begin your wellness protocol.";
  }
  if (wellbeing >= 76 && hasJournal) {
    return "I am satisfied with your care. All systems nominal.";
  }
  if (completedHabits === totalHabits && !hasJournal) {
    return "Excellent. Your habit protocol is complete. Please log your wellness data.";
  }
  if (completedHabits === totalHabits) {
    return "I am satisfied with your care. All systems nominal.";
  }
  if (wellbeing < 26) {
    return "I detect suboptimal wellness metrics. I am here to help. Let us begin.";
  }
  if (completedHabits === 0) {
    return "Scanning... No completed protocols detected. Shall we begin your wellness routine?";
  }
  return `You have completed ${completedHabits} of ${totalHabits} habits. I am monitoring your progress.`;
}

export function computeWellbeing(
  completedHabits: number,
  totalHabits: number,
  hasJournalToday: boolean,
  todayMood: number | null
): number {
  const habitScore = (completedHabits / Math.max(1, totalHabits)) * 50;
  const journalScore = hasJournalToday ? 30 : 0;
  const moodScore = todayMood ? ((todayMood - 1) / 4) * 20 : 0;
  return Math.round(habitScore + journalScore + moodScore);
}
