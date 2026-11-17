import type { LanguageId, RunCase, ScenarioName } from "@np/shared";

export type TicketType = "api" | "ia" | "algo" | "datos" | "minigame";

/** Datos de catálogo de un ticket. Solo servidor: el título de un día bloqueado no es público. */
export interface TicketMeta {
  day: number;
  id: string;
  type: TicketType;
  title: string;
}

export interface LanguageFiles {
  /** Código inicial que ve el usuario. Falla los tests. */
  template: string;
  /** Solución de referencia. Pasa todos los tests. */
  reference: string;
  /** Expresión que llama a la función del usuario para un caso (la variable `caso` está disponible). */
  call: string;
}

export interface TicketTest {
  name: string;
  scenario: ScenarioName;
}

/** Contenido de un ticket. Nunca sale al cliente antes de las 6:00 de su día. */
export interface TicketContent {
  id: string;
  /** Enunciado en Markdown. */
  statement: string;
  hint: string;
  tests: readonly TicketTest[];
  languages: Record<LanguageId, LanguageFiles>;
}

export type { CaseOutput } from "./program";

export interface TestResult {
  name: string;
  ok: boolean;
  msg: string;
}

/** Calcula en el servidor la respuesta correcta de un caso. Nunca se envía al navegador. */
export interface Judge {
  expected: (testCase: RunCase) => unknown;
  /** Mensaje cuando la respuesta no coincide. Por defecto: «Esperaba X y has devuelto Y». */
  explain?: (testCase: RunCase, got: unknown, expected: unknown) => string | undefined;
}
