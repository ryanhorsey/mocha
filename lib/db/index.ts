import { Platform } from "react-native";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";
import * as schema from "./schema";

// expo-sqlite is native-only; web uses Supabase directly (no local DB)
function createDb() {
  if (Platform.OS === "web") return null;
  const sqlite = openDatabaseSync("mocha.db", { enableChangeListener: true });
  return drizzle(sqlite, { schema });
}

export const db = createDb();
export type Db = NonNullable<ReturnType<typeof createDb>>;
