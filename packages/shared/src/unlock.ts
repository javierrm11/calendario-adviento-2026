import { TOTAL_DAYS } from "./days";

export const EVENT_YEAR = 2026;
export const UNLOCK_HOUR = 6;
export const TIME_ZONE = "Europe/Madrid";

/**
 * Momento en que se abre el ticket de un día: el N de diciembre a las 6:00 en Madrid.
 * En diciembre Madrid siempre está en horario de invierno (UTC+1), así que las 6:00 son las 5:00 UTC.
 */
export function unlockAt(day: number, year: number = EVENT_YEAR): Date {
  return new Date(Date.UTC(year, 11, day, UNLOCK_HOUR - 1));
}

export function isUnlocked(day: number, now: Date, year: number = EVENT_YEAR): boolean {
  return now.getTime() >= unlockAt(day, year).getTime();
}

/** Último día abierto (1-24), o null si el calendario todavía no ha empezado. */
export function currentDay(now: Date, year: number = EVENT_YEAR): number | null {
  let day: number | null = null;
  for (let candidate = 1; candidate <= TOTAL_DAYS; candidate++) {
    if (!isUnlocked(candidate, now, year)) break;
    day = candidate;
  }
  return day;
}
