import { base64UrlToText, textToBase64Url } from "./encoding";
import { isLanguageId, type LanguageId } from "./languages";
import type { CaseData } from "./northpole/cases";
import { isScenarioName } from "./northpole/scenarios";
import { sign, verifySignature } from "./token";

/** Caso de test con nombre visible. Nunca lleva el resultado esperado: ese solo lo calcula el servidor. */
export interface RunCase extends CaseData {
  name: string;
}

/**
 * Ejecución firmada por el servidor. El navegador la recibe al pulsar «Ejecutar tests» y la devuelve con sus
 * respuestas. Caduca y solo se puede usar una vez (el servidor guarda su id).
 */
export interface RunTicket {
  id: string;
  userId: string;
  day: number;
  language: LanguageId;
  cases: RunCase[];
  expiresAt: number;
}

export async function signRunTicket(run: RunTicket, secret: string): Promise<string> {
  const payload = textToBase64Url(JSON.stringify(run));
  return `${payload}.${await sign(`run:${payload}`, secret)}`;
}

function isRunTicket(value: unknown): value is RunTicket {
  const run = value as Partial<RunTicket> | null;
  return (
    typeof run?.id === "string" &&
    typeof run.userId === "string" &&
    typeof run.day === "number" &&
    isLanguageId(run.language) &&
    typeof run.expiresAt === "number" &&
    Array.isArray(run.cases) &&
    run.cases.every(
      (c) => typeof c?.name === "string" && isScenarioName(c.scenario) && typeof c.seed === "string",
    )
  );
}

/** Devuelve la ejecución si la firma es válida y no ha caducado; si no, null. */
export async function verifyRunTicket(
  token: string,
  secret: string,
  now: number = Date.now(),
): Promise<RunTicket | null> {
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const payload = token.slice(0, dot);
  if (!(await verifySignature(`run:${payload}`, token.slice(dot + 1), secret))) return null;
  const text = base64UrlToText(payload);
  if (!text) return null;
  try {
    const run: unknown = JSON.parse(text);
    return isRunTicket(run) && run.expiresAt > now ? run : null;
  } catch {
    return null;
  }
}
