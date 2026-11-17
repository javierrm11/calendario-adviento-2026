import "server-only";
import {
  encodeCase,
  type LanguageId,
  RUN_TTL_MS,
  type RunCase,
  signApiToken,
  signRunTicket,
} from "@np/shared";
import type { TicketContent } from "@np/tickets";
import type { PlanCase } from "@np/tickets/program";

/** Configuración de la API del Polo Norte, o null si falta (la web arranca igual, pero no se puede ejecutar). */
export function northPoleConfig(): { apiUrl: string; secret: string } | null {
  const apiUrl = process.env.NP_API_URL;
  const secret = process.env.NP_TOKEN_SECRET;
  return apiUrl && secret ? { apiUrl: apiUrl.replace(/\/$/, ""), secret } : null;
}

/** Semilla aleatoria por caso: los datos cambian en cada ejecución, así que las respuestas no se pueden memorizar. */
const newSeed = () => crypto.randomUUID().replace(/-/g, "").slice(0, 16);

interface PlanInput {
  userId: string;
  day: number;
  language: LanguageId;
  content: TicketContent;
}

/**
 * Prepara una ejecución: casos con semillas nuevas, firmados y con caducidad. El navegador recibe las URLs de
 * cada caso, pero no lo que tiene que salir: eso lo calcula el juez al recibir las respuestas.
 */
export async function createRunPlan({ userId, day, language, content }: PlanInput) {
  const config = northPoleConfig();
  if (!config) return null;
  const cases: RunCase[] = content.tests.map((test) => ({ ...test, seed: newSeed() }));
  const runToken = await signRunTicket(
    { id: crypto.randomUUID(), userId, day, language, cases, expiresAt: Date.now() + RUN_TTL_MS },
    config.secret,
  );
  const planCases: PlanCase[] = cases.map((testCase) => ({
    name: testCase.name,
    url: `${config.apiUrl}/c/${encodeCase(testCase)}`,
  }));
  return {
    runToken,
    apiToken: await signApiToken(userId, config.secret),
    call: content.languages[language].call,
    cases: planCases,
  };
}
