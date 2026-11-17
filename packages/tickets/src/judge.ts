import type { RunCase } from "@np/shared";
import { JUDGES } from "./judges";
import type { CaseOutput, TestResult } from "./types";

/** Igualdad por valor (objetos, listas y primitivos), sin depender del orden de las claves. */
export function sameValue(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  return keysA.every((key) =>
    sameValue((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key]),
  );
}

const show = (value: unknown) => {
  const text = JSON.stringify(value);
  return text === undefined ? String(value) : text.length > 120 ? `${text.slice(0, 117)}...` : text;
};

/**
 * Compara lo que devolvió el código del usuario con lo que calcula el servidor.
 * Un caso que falta, o que aparece dos veces, cuenta como fallido.
 */
export function judgeRun(
  ticketId: string,
  cases: readonly RunCase[],
  outputs: readonly CaseOutput[],
): TestResult[] {
  const judge = JUDGES[ticketId];
  if (!judge) throw new Error(`El ticket ${ticketId} no tiene juez (packages/tickets/src/judges).`);
  return cases.map((testCase) => {
    const matches = outputs.filter((output) => output.name === testCase.name);
    const output = matches[0];
    if (matches.length !== 1 || !output) {
      return { name: testCase.name, ok: false, msg: "El test no llegó a terminar." };
    }
    if (output.error !== undefined) return { name: testCase.name, ok: false, msg: `Error: ${output.error}` };
    const expected = judge.expected(testCase);
    if (sameValue(output.value, expected)) return { name: testCase.name, ok: true, msg: "" };
    const msg =
      judge.explain?.(testCase, output.value, expected) ??
      `Esperaba ${show(expected)} y has devuelto ${show(output.value)}.`;
    return { name: testCase.name, ok: false, msg };
  });
}
