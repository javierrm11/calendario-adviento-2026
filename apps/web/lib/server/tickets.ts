import "server-only";
import { getDay, isUnlocked, type Level } from "@np/shared";
import { getTicketContent, getTicketMeta, type TicketContent, type TicketMeta } from "@np/tickets";

export type TicketView =
  | { kind: "not-started" }
  | { kind: "locked"; day: number }
  | { kind: "minigame"; meta: TicketMeta; level: Level }
  | { kind: "missing"; meta: TicketMeta; level: Level }
  | { kind: "open"; meta: TicketMeta; level: Level; content: TicketContent };

/**
 * Qué se puede mostrar de un día en este momento. Lo decide el servidor:
 * de un día bloqueado no sale ni el título (CLAUDE.md, «Contenido futuro»).
 */
export function resolveTicket(day: number | null, now: Date): TicketView {
  if (day === null) return { kind: "not-started" };
  if (!isUnlocked(day, now)) return { kind: "locked", day };
  const meta = getTicketMeta(day);
  const publicDay = getDay(day);
  if (!meta || !publicDay) return { kind: "locked", day };
  if (meta.type === "minigame") return { kind: "minigame", meta, level: publicDay.level };
  const content = getTicketContent(meta.id);
  if (!content) return { kind: "missing", meta, level: publicDay.level };
  return { kind: "open", meta, level: publicDay.level, content };
}
