import { TIME_ZONE } from "@np/shared";

const longDate = new Intl.DateTimeFormat("es-ES", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: TIME_ZONE,
});

/** "sábado 12 de diciembre", siempre en hora de Madrid. */
export function formatToday(now: Date): string {
  return longDate.format(now).replace(",", "");
}
