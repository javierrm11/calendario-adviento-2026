// Web Worker de Python con Pyodide (Python compilado a WebAssembly).
// Pyodide tarda en cargar, así que este Worker se reutiliza entre ejecuciones; cada ejecución usa un espacio de
// nombres nuevo para no arrastrar variables de la anterior.
import { buildPythonProgram, PYODIDE_URLLIB_SHIM } from "@np/tickets/program";
import { MAX_LOG_LINES, type WorkerScope } from "./protocol";

const PYODIDE_VERSION = "0.29.5";
const INDEX_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

/** Lo mínimo de la API de Pyodide que usamos (se carga desde el CDN, sin paquete npm). */
interface PyProxy {
  get(name: string): unknown;
  destroy(): void;
}
interface Pyodide {
  globals: PyProxy;
  runPython(code: string): unknown;
  runPythonAsync(code: string, options?: { globals?: PyProxy }): Promise<unknown>;
  setStdout(options: { batched: (line: string) => void }): void;
  setStderr(options: { batched: (line: string) => void }): void;
}

const scope = self as unknown as WorkerScope;
let pyodide: Promise<Pyodide> | null = null;

async function loadPython(): Promise<Pyodide> {
  const url = `${INDEX_URL}pyodide.mjs`;
  const module = (await import(/* webpackIgnore: true */ /* turbopackIgnore: true */ url)) as {
    loadPyodide(options: { indexURL: string }): Promise<Pyodide>;
  };
  const python = await module.loadPyodide({ indexURL: INDEX_URL });
  python.runPython(PYODIDE_URLLIB_SHIM);
  return python;
}

/** Las trazas de Python incluyen nuestro código de alrededor: se enseñan solo las últimas líneas. */
function describe(error: unknown): string {
  const text = error instanceof Error ? error.message : String(error);
  const lines = text.trim().split("\n");
  return lines.slice(-3).join("\n");
}

scope.onmessage = async ({ data }) => {
  const logs: string[] = [];
  const write = (line: string) => {
    if (logs.length < MAX_LOG_LINES) logs.push(line);
  };
  try {
    if (!pyodide) {
      scope.postMessage({ kind: "loading" });
      pyodide = loadPython();
    }
    const python = await pyodide;
    scope.postMessage({ kind: "ready" });
    python.setStdout({ batched: write });
    python.setStderr({ batched: write });

    const namespace = (python.globals.get("dict") as () => PyProxy)();
    try {
      await python.runPythonAsync(
        buildPythonProgram({ code: data.code, call: data.call, token: data.token }),
        {
          globals: namespace,
        },
      );
      const run = namespace.get("__np_run") as (casesJson: string) => string;
      scope.postMessage({ kind: "done", outputs: JSON.parse(run(JSON.stringify(data.cases))), logs });
    } finally {
      namespace.destroy();
    }
  } catch (error) {
    scope.postMessage({ kind: "error", message: describe(error), logs });
  }
};
