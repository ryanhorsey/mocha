# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Start dev server (choose platform)
npx expo start
npx expo start --ios
npx expo start --android
npx expo start --web

# Database
npm run db:generate   # generate Drizzle migration files from schema changes
npm run db:studio     # open Drizzle Studio to inspect the local SQLite DB
```

There is no lint or test script configured.

## Architecture

**Mocha** is a React Native lifestyle super-app (habits, tasks, journal, AI recommendations) built with Expo 54, targeting iOS, Android, and web.

### Routing

Expo Router with file-based routing. `app/_layout.tsx` is the root — it runs DB migrations before rendering anything. `app/(tabs)/` holds the five tab screens: Today (`index`), Habits, Tasks, Journal, More.

### Data layer

**Local-first on native (iOS/Android):** expo-sqlite + Drizzle ORM (`lib/db/`). `lib/db/index.ts` opens the DB and returns a typed Drizzle instance; it returns `null` on web. `lib/db/schema.ts` is the source of truth for table definitions. `lib/db/migrations.ts` runs raw `CREATE TABLE IF NOT EXISTS` SQL at app startup — **Drizzle's migration runner is not used at runtime**; add new tables directly to `migrations.ts` alongside the schema change.

**Web:** The local DB is unavailable. All store actions guard with `if (!db) return`. Supabase (`lib/supabase.ts`) is initialized and ready but not yet wired to data features — it will handle sync and auth going forward.

### State management

Each domain has a Zustand store in `lib/store/`:
- `habits.ts` — habits list + today's completion logs
- `tasks.ts` — open tasks (completed tasks are filtered out on load)
- `journal.ts` — all journal entries, ordered newest-first
- `recommendations.ts` — AI suggestions via Gemini 2.5 Flash

Stores follow the same pattern: optimistic local state update → async DB write. Screens call `store.load()` inside `useFocusEffect` to refresh on tab focus.

### AI recommendations

`lib/store/recommendations.ts` calls Gemini 2.5 Flash (`EXPO_PUBLIC_GEMINI_API_KEY`) to generate personalized habit/task suggestions. The prompt includes current habits, open tasks, recent journal moods, and 30-day accept/dismiss history so the model learns preferences. Results are persisted to the `recommendations` table to survive reloads.

### Styling

NativeWind 4 (Tailwind CSS for React Native). Custom `mocha` color palette defined in `tailwind.config.js` — use `mocha-50` through `mocha-900` for all UI colors. The primary brand color is `mocha-500` (`#c67332`). Shared primitives are `components/ui/Text.tsx` and `components/ui/Card.tsx`; prefer these over raw RN components. Global styles are in `global.css` (imported by the root layout).

### Environment variables

All vars are prefixed `EXPO_PUBLIC_` so they're embedded at build time. Required keys are in `.env`:
- `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_GEMINI_API_KEY`

### Shared types

`types/index.ts` exports `Priority`, `Frequency`, `Mood` types and display constants (`MOOD_LABELS`, `MOOD_EMOJIS`, `PRIORITY_COLORS`). Import from here rather than redefining locally.
