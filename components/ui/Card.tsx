import { View, ViewProps } from "react-native";

export function Card({ className, ...props }: ViewProps & { className?: string }) {
  return (
    <View
      className={`bg-white dark:bg-mocha-800 rounded-2xl p-4 shadow-sm ${className ?? ""}`}
      {...props}
    />
  );
}
