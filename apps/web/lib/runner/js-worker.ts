// Web Worker de JavaScript y TypeScript: ejecuta el código del usuario fuera del hilo de la página.
// Se crea uno nuevo en cada ejecución y se termina si tarda demasiado (bucles infinitos incluidos).
import { buildJsProgram, type CaseOutput } from "@np/tickets/program";
import { MAX_LOG_LINES, type WorkerScope } from "./protocol";

const scope = self as unknown as WorkerScope;
const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor as new (
  ...args: string[]
) => (cases: unknown) => Promise<unknown>;

function format(value: unknown): string {
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value) ?? String(value);
  } catch {
    return String(value);
  }
}

/** La salida de console.log del usuario se enseña en el editor. */
function captureConsole(logs: string[]) {
  const write = (...args: unknown[]) => {
    if (logs.length < MAX_LOG_LINES) logs.push(args.map(format).join(" "));
  };
  console.log = write;
  console.info = write;
  console.warn = write;
  console.error = write;
}

const describe = (error: unknown) =>
  error instanceof Error ? `${error.name}: ${error.message}` : String(error);

scope.onmessage = async ({ data }) => {
  const logs: string[] = [];
  captureConsole(logs);
  try {
    let code = data.code;
    if (data.language === "ts") {
      // Solo se quitan los tipos (no se comprueban): Sucrase se descarga únicamente al ejecutar TypeScript.
      const { transform } = await import("sucrase");
      code = transform(code, { transforms: ["typescript"] }).code;
    }
    const run = new AsyncFunction("__np_cases", buildJsProgram({ code, call: data.call, token: data.token }));
    const outputs = (await run(data.cases)) as CaseOutput[];
    scope.postMessage({ kind: "done", outputs, logs });
  } catch (error) {
    scope.postMessage({ kind: "error", message: describe(error), logs });
  }
};
