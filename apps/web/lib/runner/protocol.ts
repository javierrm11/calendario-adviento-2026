import type { LanguageId } from "@np/shared";
import type { CaseOutput, PlanCase } from "@np/tickets/program";

/** Lo que el editor manda al Web Worker. */
export interface RunRequest {
  language: LanguageId;
  code: string;
  call: string;
  token: string;
  cases: PlanCase[];
}

/** Lo que responde el Web Worker. */
export type WorkerMessage =
  | { kind: "loading" }
  | { kind: "ready" }
  | { kind: "done"; outputs: CaseOutput[]; logs: string[] }
  | { kind: "error"; message: string; logs: string[] };

/** Ámbito de un Web Worker con los tipos justos (el proyecto compila con la librería DOM, no con WebWorker). */
export interface WorkerScope {
  onmessage: ((event: MessageEvent<RunRequest>) => void) | null;
  postMessage(message: WorkerMessage): void;
}

export const MAX_LOG_LINES = 200;
