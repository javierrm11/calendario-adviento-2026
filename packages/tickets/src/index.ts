// Contenido y jueces de los tickets. SOLO SERVIDOR: la web lo importa desde código marcado con "server-only".
// Lo que necesita el navegador está aparte, en "@np/tickets/program".
import { CONTENT } from "./generated";
import type { TicketContent } from "./types";

export { CATALOG, getTicketMeta } from "./catalog";
export { judgeRun, sameValue } from "./judge";
export { JUDGES } from "./judges";
export type {
  CaseOutput,
  Judge,
  LanguageFiles,
  TestResult,
  TicketContent,
  TicketMeta,
  TicketTest,
  TicketType,
} from "./types";

/** Contenido completo de un ticket, o undefined si todavía no está escrito. */
export function getTicketContent(id: string): TicketContent | undefined {
  return CONTENT[id];
}
