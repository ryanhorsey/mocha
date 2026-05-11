import { useState } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CareSegmented, type CareSegment } from "./CareSegmented";
import { TodayScreen } from "../care/screens/TodayScreen";
import { HabitsScreen } from "../care/screens/HabitsScreen";
import { TasksScreen } from "../care/screens/TasksScreen";
import { JournalScreen } from "../care/screens/JournalScreen";
import { BOTTOM_ORB_RESERVED } from "./orbConfig";

export function CareWorld() {
  const [segment, setSegment] = useState<CareSegment>("today");

  return (
    <View className="flex-1 bg-mocha-50">
      <SafeAreaView edges={["top"]}>
        <CareSegmented value={segment} onChange={setSegment} />
      </SafeAreaView>
      <View style={{ flex: 1, paddingBottom: BOTTOM_ORB_RESERVED }}>
        {segment === "today" && <TodayScreen />}
        {segment === "habits" && <HabitsScreen />}
        {segment === "tasks" && <TasksScreen />}
        {segment === "journal" && <JournalScreen />}
      </View>
    </View>
  );
}
