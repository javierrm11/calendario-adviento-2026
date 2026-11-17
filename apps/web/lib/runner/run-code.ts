import type { CaseOutput } from "@np/tickets/program";
import type { RunRequest, WorkerMessage } from "./protocol";

export type RunResult =
  | { kind: "done"; outputs: CaseOutput[]; logs: string[] }
  | { kind: "error"; message: string; logs: string[] }
  | { kind: "timeout" };

const RUN_TIMEOUT_MS = 15_000;
/** La primera vez Python descarga unos megas: se le da más margen. */
const PYTHON_LOAD_TIMEOUT_MS = 90_000;

let pythonWorker: Worker | null = null;
let pythonReady = false;

function createJsWorker() {
  return new Worker(new URL("./js-worker.ts", import.meta.url), { type: "module" });
}

function getPythonWorker() {
  pythonWorker ??= new Worker(new URL("./py-worker.ts", import.meta.url), { type: "module" });
  return pythonWorker;
}

function resetPython() {
  pythonWorker?.terminate();
  pythonWorker = null;
  pythonReady = false;
}

/** ¿Python ya está cargado? Para avisar al usuario de la primera descarga. */
export function isPythonReady(): boolean {
  return pythonReady;
}

/**
 * Ejecuta el código del usuario en un Web Worker y devuelve lo que devolvió su función en cada caso.
 * Si tarda demasiado (por ejemplo, un bucle infinito), el Worker se termina.
 */
export function runCode(request: RunRequest, onLoadingPython?: () => void): Promise<RunResult> {
  const isPython = request.language === "py";
  const worker = isPython ? getPythonWorker() : createJsWorker();

  return new Promise((resolve) => {
    const finish = (result: RunResult) => {
      clearTimeout(timer);
      worker.onmessage = null;
      worker.onerror = null;
      if (!isPython) worker.terminate();
      resolve(result);
    };
    const onTimeout = () => {
      if (isPython) resetPython();
      finish({ kind: "timeout" });
    };
    let timer = setTimeout(onTimeout, isPython && !pythonReady ? PYTHON_LOAD_TIMEOUT_MS : RUN_TIMEOUT_MS);

    worker.onmessage = (event: MessageEvent<WorkerMessage>) => {
      const message = event.data;
      if (message.kind === "loading") return onLoadingPython?.();
      if (message.kind === "ready") {
        pythonReady = true;
        clearTimeout(timer);
        timer = setTimeout(onTimeout, RUN_TIMEOUT_MS);
        return;
      }
      finish(message);
    };
    worker.onerror = (event) => {
      event.preventDefault();
      if (isPython) resetPython();
      finish({ kind: "error", message: event.message || "El código no se ha podido ejecutar.", logs: [] });
    };
    worker.postMessage(request);
  });
}
