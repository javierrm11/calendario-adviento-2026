// Genera src/generated.ts a partir de content/. Ejecuta `pnpm tickets:generate` tras tocar un ticket.
// Estructura: content/NP-XXX/{ticket.json, statement.md, hint.md, <lenguaje>/{template,reference,call}.<ext>}
// TypeScript reutiliza el call.js de JavaScript si no tiene uno propio.
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const CONTENT_DIR = join(ROOT, "content");
const OUT = join(ROOT, "src", "generated.ts");

const LANGUAGES = [
  { id: "js", ext: "js" },
  { id: "ts", ext: "ts" },
  { id: "py", ext: "py" },
];
const CALL_FALLBACK = { ts: "js" };
const EXT = Object.fromEntries(LANGUAGES.map((language) => [language.id, language.ext]));

const read = (...parts) => readFileSync(join(...parts), "utf8").replace(/\r\n/g, "\n");

function readLanguage(ticketDir, id) {
  const file = (lang, kind) => join(ticketDir, lang, `${kind}.${EXT[lang]}`);
  const callLang = existsSync(file(id, "call")) ? id : CALL_FALLBACK[id];
  for (const [lang, kind] of [
    [id, "template"],
    [id, "reference"],
    [callLang, "call"],
  ]) {
    if (!lang || !existsSync(file(lang, kind))) throw new Error(`${ticketDir}: falta ${lang ?? id}/${kind}`);
  }
  return {
    template: read(file(id, "template")),
    reference: read(file(id, "reference")),
    call: read(file(callLang, "call")).trim(),
  };
}

export function generate() {
  const content = {};
  for (const id of readdirSync(CONTENT_DIR)
    .filter((name) => /^NP-\d{3}$/.test(name))
    .sort()) {
    const dir = join(CONTENT_DIR, id);
    const { tests } = JSON.parse(read(dir, "ticket.json"));
    content[id] = {
      id,
      statement: read(dir, "statement.md").trim(),
      hint: read(dir, "hint.md").trim(),
      tests,
      languages: Object.fromEntries(LANGUAGES.map(({ id: lang }) => [lang, readLanguage(dir, lang)])),
    };
  }
  return [
    "// Generado por scripts/generate.mjs a partir de content/. No lo edites a mano.",
    'import type { TicketContent } from "./types";',
    "",
    `export const CONTENT: Record<string, TicketContent> = ${JSON.stringify(content, null, 2)};`,
    "",
  ].join("\n");
}

if (process.argv[1] === import.meta.filename) {
  writeFileSync(OUT, generate());
  console.log(`Generado ${OUT}`);
}
