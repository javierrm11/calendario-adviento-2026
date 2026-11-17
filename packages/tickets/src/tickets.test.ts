import { readFileSync } from "node:fs";
import { join } from "node:path";
import { giftCounts, isScenarioName, LANGUAGE_IDS, type RunCase } from "@np/shared";
import { describe, expect, it } from "vitest";
// @ts-expect-error: script de Node en JavaScript, sin tipos
import { generate } from "../scripts/generate.mjs";
import { CONTENT } from "./generated";
import { judgeRun, sameValue } from "./judge";
import { JUDGES } from "./judges";
import { buildJsProgram } from "./program";

describe("contenido generado", () => {
  it("src/generated.ts está al día con content/ (ejecuta pnpm tickets:generate)", () => {
    const current = readFileSync(join(import.meta.dirname, "generated.ts"), "utf8").replace(/\r\n/g, "\n");
    expect(current).toBe(generate());
  });

  for (const ticket of Object.values(CONTENT)) {
    describe(ticket.id, () => {
      it("tiene los tres lenguajes y un juez", () => {
        expect(Object.keys(ticket.languages).sort()).toEqual([...LANGUAGE_IDS].sort());
        expect(JUDGES[ticket.id]).toBeDefined();
      });

      it("cada test usa un escenario que existe y los nombres no se repiten", () => {
        expect(ticket.tests.every((test) => isScenarioName(test.scenario))).toBe(true);
        expect(new Set(ticket.tests.map((test) => test.name)).size).toBe(ticket.tests.length);
      });
    });
  }
});

describe("buildJsProgram", () => {
  const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor as new (
    ...args: string[]
  ) => (cases: unknown) => Promise<unknown>;

  it("llama a la función del usuario con la URL de cada caso y recoge valores y errores", async () => {
    const code = `async function f() { if (NP_API_URL === "mal") throw new Error("roto"); return NP_API_URL.length; }`;
    const program = buildJsProgram({ code, call: "f()", token: "np_x" });
    const run = new AsyncFunction("__np_cases", program);
    expect(
      await run([
        { name: "A", url: "abc" },
        { name: "B", url: "mal" },
      ]),
    ).toEqual([
      { name: "A", value: 3 },
      { name: "B", error: "roto" },
    ]);
  });
});

describe("judgeRun", () => {
  const cases: RunCase[] = [
    { name: "A", scenario: "pendientes-varios", seed: "s1" },
    { name: "B", scenario: "pendientes-ninguno", seed: "s2" },
  ];
  const pendingA = giftCounts("pendientes-varios", "s1").pending;

  it("acepta las respuestas correctas", () => {
    const results = judgeRun("NP-001", cases, [
      { name: "A", value: pendingA },
      { name: "B", value: 0 },
    ]);
    expect(results.every((result) => result.ok)).toBe(true);
  });

  it("explica el error típico de no filtrar por estado", () => {
    const { pending, delivered } = giftCounts("pendientes-varios", "s1");
    const [a] = judgeRun("NP-001", cases, [
      { name: "A", value: pending + delivered },
      { name: "B", value: 0 },
    ]);
    expect(a?.ok).toBe(false);
    expect(a?.msg).toContain("estado=pendiente");
  });

  it("un caso que falta, repetido o con error falla", () => {
    const results = judgeRun("NP-001", cases, [
      { name: "A", value: pendingA },
      { name: "A", value: pendingA },
    ]);
    expect(results.map((result) => result.ok)).toEqual([false, false]);
    const [withError] = judgeRun("NP-001", cases, [{ name: "A", error: "HTTPError 401" }]);
    expect(withError?.msg).toBe("Error: HTTPError 401");
  });

  it("sameValue compara por valor", () => {
    expect(sameValue({ a: [1, { b: 2 }] }, { a: [1, { b: 2 }] })).toBe(true);
    expect(sameValue([1, 2], { 0: 1, 1: 2 })).toBe(false);
    expect(sameValue(1, "1")).toBe(false);
  });
});
