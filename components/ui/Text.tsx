import { Text as RNText, TextProps } from "react-native";

export function Text({ className, ...props }: TextProps & { className?: string }) {
  return <RNText className={`text-mocha-900 dark:text-mocha-50 ${className ?? ""}`} {...props} />;
}
