import { TouchableOpacity, TouchableOpacityProps } from "react-native";
import { Text } from "./Text";

interface ButtonProps extends TouchableOpacityProps {
  label: string;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
}

export function Button({ label, variant = "primary", className, ...props }: ButtonProps) {
  const base = "rounded-xl px-4 py-3 items-center justify-center";
  const variants = {
    primary: "bg-mocha-600 active:bg-mocha-700",
    secondary: "bg-mocha-100 active:bg-mocha-200",
    ghost: "bg-transparent",
  };
  const textVariants = {
    primary: "text-white font-semibold",
    secondary: "text-mocha-800 font-semibold",
    ghost: "text-mocha-600 font-semibold",
  };

  return (
    <TouchableOpacity className={`${base} ${variants[variant]} ${className ?? ""}`} {...props}>
      <Text className={textVariants[variant]}>{label}</Text>
    </TouchableOpacity>
  );
}
