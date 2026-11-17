// Verifica cada ticket en local, igual que lo haría el navegador: la solución de referencia pasa todos los tests
// y la plantilla falla alguno. Arranca la API del Polo Norte en un puerto libre y juzga con el juez del servidor.
import { execFile, spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { serve } from "@hono/node-server";
import { createApp } from "@np/api/app";
import { encodeCase, LANGUAGE_IDS, type LanguageId, type RunCase, signApiToken } from "@np/shared";
import { transform } from "sucrase";
import { CONTENT } from "../src/generated";
import { judgeRun } from "../src/judge";
import { buildJsProgram, buildPythonProgram, type PlanCase } from "../src/program";
import type { CaseOutput } from "../src/types";

const SECRET = "secreto-de-verificacion";
const work = mkdtempSync(join(tmpdir(), "np-verify-"));
const python = ["python3", "python"].find(
  (command) => spawnSync(command, ["--version"], { stdio: "ignore" }).status === 0,
);
const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor as new (
  ...args: string[]
) => (cases: PlanCase[]) => Promise<CaseOutput[]>;

/** Ejecuta sin bloquear: la API corre en este mismo proceso y tiene que poder responder. */
function exec(command: string, args: string[]): Promise<string> {
  return new Promise((resolve) => {
    execFile(command, args, { encoding: "utf8", timeout: 30_000 }, (_error, stdout) => resolve(stdout ?? ""));
  });
}

async function run(
  language: LanguageId,
  code: string,
  call: string,
  token: string,
  cases: PlanCase[],
): Promise<CaseOutput[] | null> {
  if (language === "py") {
    if (!python) return null;
    // Casos por archivo y salida en UTF-8: la línea de comandos de Windows estropea las tildes.
    const file = join(work, "programa.py");
    const casesFile = join(work, "casos.json");
    const footer = [
      "",
      "import sys",
      'sys.stdout.reconfigure(encoding="utf-8")',
      'print("NPRESULT " + __np_run(open(sys.argv[1], encoding="utf-8").read()))',
      "",
    ].join("\n");
    writeFileSync(file, buildPythonProgram({ code, call, token }) + footer);
    writeFileSync(casesFile, JSON.stringify(cases));
    const stdout = await exec(python, [file, casesFile]);
    const line = stdout.split(/\r?\n/).find((l) => l.startsWith("NPRESULT "));
    return line ? (JSON.parse(line.slice("NPRESULT ".length)) as CaseOutput[]) : [];
  }
  // JavaScript y TypeScript se ejecutan igual que en el Web Worker del navegador.
  const source = language === "ts" ? transform(code, { transforms: ["typescript"] }).code : code;
  try {
    return await new AsyncFunction("__np_cases", buildJsProgram({ code: source, call, token }))(cases);
  } catch (error) {
    return cases.map((c) => ({ name: c.name, error: String(error) }));
  }
}

const server = serve({ fetch: createApp({ tokenSecret: SECRET }).fetch, port: 0 });
await new Promise((resolve) => server.once("listening", resolve));
const { port } = server.address() as AddressInfo;
const token = await signApiToken("verificador", SECRET);

let failures = 0;
try {
  for (const ticket of Object.values(CONTENT)) {
    console.log(`\n${ticket.id}`);
    for (const language of LANGUAGE_IDS) {
      const files = ticket.languages[language];
      const cases: RunCase[] = ticket.tests.map((test) => ({
        ...test,
        seed: crypto.randomUUID().slice(0, 12),
      }));
      const plan = cases.map((c) => ({ name: c.name, url: `http://127.0.0.1:${port}/c/${encodeCase(c)}` }));

      const referenceOutputs = await run(language, files.reference, files.call, token, plan);
      if (referenceOutputs === null) {
        console.log(`  ${language.padEnd(3)} omitido (no hay intérprete en esta máquina)`);
        continue;
      }
      const referenceResults = judgeRun(ticket.id, cases, referenceOutputs);
      const templateOutputs = (await run(language, files.template, files.call, token, plan)) ?? [];
      const templateResults = judgeRun(ticket.id, cases, templateOutputs);

      const referencePasses = referenceResults.every((result) => result.ok);
      const templateFails = templateResults.some((result) => !result.ok);
      const ok = referencePasses && templateFails;
      if (!ok) failures++;
      console.log(`  ${language.padEnd(3)} ${ok ? "ok" : "FALLA"}`);
      for (const result of referenceResults.filter((r) => !r.ok)) {
        console.log(`      referencia: ${result.name}: ${result.msg}`);
      }
      if (!templateFails) console.log("      la plantilla pasa todos los tests: tiene que fallar alguno");
    }
  }
} finally {
  server.close();
  rmSync(work, { recursive: true, force: true });
}

console.log(failures ? `\n${failures} comprobaciones fallidas.` : "\nTodo correcto.");
process.exit(failures ? 1 : 0);
