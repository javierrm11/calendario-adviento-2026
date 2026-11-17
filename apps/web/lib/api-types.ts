import type { TestResult } from "@np/tickets";
import type { PlanCase } from "@np/tickets/program";

/** Respuestas de las rutas de la API de la web, compartidas entre el servidor y el editor. */
type ApiError = { status: "error"; message: string };

/** POST /api/runs: lo necesario para ejecutar en el navegador. Nunca incluye los resultados esperados. */
export type RunPlanResponse =
  | { status: "ok"; runToken: string; apiToken: string; call: string; cases: PlanCase[] }
  | ApiError;

/** POST /api/submissions: el veredicto del servidor. */
export type SubmissionResponse =
  | {
      status: "results";
      results: TestResult[];
      passed: number;
      total: number;
      earned: number;
      solved: boolean;
    }
  | ApiError;

export type HintResponse = { status: "ok"; hint: string } | ApiError;
