import { base64UrlToText, textToBase64Url } from "../encoding";
import { isScenarioName, type ScenarioName } from "./scenarios";

/** Un caso de test de una ejecución: qué escenario sirve la API y con qué semilla. */
export interface CaseData {
  scenario: ScenarioName;
  seed: string;
}

/**
 * Identificador de un caso dentro de la URL de la API: /c/<caso>/v1/regalos.
 * No va firmado: conocerlo no da la respuesta, solo permite pedir a la API los mismos datos.
 */
export function encodeCase({ scenario, seed }: CaseData): string {
  return textToBase64Url(JSON.stringify({ s: scenario, k: seed }));
}

export function decodeCase(token: string): CaseData | null {
  const text = base64UrlToText(token);
  if (!text) return null;
  try {
    const { s, k } = JSON.parse(text) as { s?: unknown; k?: unknown };
    if (!isScenarioName(s) || typeof k !== "string" || k.length === 0 || k.length > 64) return null;
    return { scenario: s, seed: k };
  } catch {
    return null;
  }
}
