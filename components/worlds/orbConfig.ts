export const ORB_SIZE = 64;
export const ORB_ACTIVE_SCALE = 1.15;
export const ORB_TOP_INSET = 8;
export const ORB_SIDE_INSET = 24;
export const ORB_BOTTOM_INSET = 24;

export const BOTTOM_ORB_RESERVED =
  ORB_SIZE * ORB_ACTIVE_SCALE + ORB_BOTTOM_INSET + 24; // ≈ 121

export type WorldKey = "village" | "care" | "you";

export const WORLD_ORDER: WorldKey[] = ["village", "care", "you"];

export const WORLD_META: Record<
  WorldKey,
  { label: string; color: string; a11y: string }
> = {
  village: {
    label: "Village",
    color: "#7fb069",
    a11y: "Switch to Mocha Village",
  },
  care: { label: "Care", color: "#c67332", a11y: "Switch to Care" },
  you: { label: "You", color: "#7d6cd1", a11y: "Switch to You" },
};
