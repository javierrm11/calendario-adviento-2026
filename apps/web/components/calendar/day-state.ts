import { isUnlocked } from "@np/shared";

/** Estado público de un día. Lo decide el servidor con su hora; el navegador solo añade si está resuelto. */
export type DayState = "locked" | "today" | "open";

export function dayState(day: number, now: Date, today: number | null): DayState {
  if (!isUnlocked(day, now)) return "locked";
  return day === today ? "today" : "open";
}
