import { between, seededRandom } from "./random";

/**
 * Escenarios de la API de regalos. Cada caso de test usa un escenario y una semilla aleatoria por ejecución:
 * los números cambian en cada intento, así que no se pueden memorizar, y el servidor sabe calcularlos.
 */
export interface Failure {
  status: 429 | 503;
  retryAfterSeconds?: number;
}

export interface GiftCounts {
  pending: number;
  delivered: number;
}

interface ScenarioDefinition {
  counts: (random: () => number) => GiftCounts;
  /** Respuestas fallidas que se sirven antes de responder bien, en orden. */
  failures?: readonly Failure[];
}

const few = (random: () => number): GiftCounts => ({
  pending: between(random, 3, 12),
  delivered: between(random, 1, 5),
});

export const SCENARIOS = {
  "por-defecto": { counts: () => ({ pending: 12, delivered: 8 }) },
  "pendientes-varios": {
    counts: (random) => ({ pending: between(random, 5, 40), delivered: between(random, 2, 15) }),
  },
  "pendientes-ninguno": { counts: (random) => ({ pending: 0, delivered: between(random, 3, 10) }) },
  "pendientes-muchos": {
    counts: (random) => ({ pending: between(random, 100, 200), delivered: between(random, 20, 50) }),
  },
  "fallo-503": { counts: few, failures: [{ status: 503 }] },
  "fallo-429": { counts: few, failures: [{ status: 429, retryAfterSeconds: 2 }] },
  "fallos-seguidos": {
    counts: few,
    failures: [{ status: 503 }, { status: 503 }, { status: 429, retryAfterSeconds: 1 }],
  },
} as const satisfies Record<string, ScenarioDefinition>;

export type ScenarioName = keyof typeof SCENARIOS;

export function isScenarioName(value: unknown): value is ScenarioName {
  return typeof value === "string" && Object.hasOwn(SCENARIOS, value);
}

/** Cuántos regalos pendientes y entregados hay en un escenario con una semilla. */
export function giftCounts(name: ScenarioName, seed: string): GiftCounts {
  return (SCENARIOS[name] as ScenarioDefinition).counts(seededRandom(`counts:${seed}`));
}

export function scenarioFailures(name: ScenarioName): readonly Failure[] {
  return (SCENARIOS[name] as ScenarioDefinition).failures ?? [];
}
