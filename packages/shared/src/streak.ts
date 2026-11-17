import { isMinigameDay } from "./days";

/**
 * Días seguidos con al menos un ticket resuelto, contando hacia atrás desde hoy.
 * Si hoy todavía no está resuelto, la racha sigue viva y se cuenta desde ayer.
 * Los días de minijuego no suman ni rompen la racha: no tienen ticket.
 */
export function streak(solved: ReadonlySet<number>, today: number | null): number {
  if (today === null) return 0;
  let day = solved.has(today) ? today : today - 1;
  let count = 0;
  while (day >= 1) {
    if (isMinigameDay(day)) {
      day--;
      continue;
    }
    if (!solved.has(day)) break;
    count++;
    day--;
  }
  return count;
}
