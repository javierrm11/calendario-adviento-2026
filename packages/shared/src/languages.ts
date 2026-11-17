/** Lenguajes admitidos. El orden es también el de desempate cuando dos lenguajes tienen las mismas estrellas. */
export const LANGUAGES = [
  { id: "js", name: "JavaScript", short: "JS", extension: "js" },
  { id: "ts", name: "TypeScript", short: "TS", extension: "ts" },
  { id: "py", name: "Python", short: "PY", extension: "py" },
] as const;

export type LanguageId = (typeof LANGUAGES)[number]["id"];

export const LANGUAGE_IDS: readonly LanguageId[] = LANGUAGES.map((language) => language.id);

export function isLanguageId(value: unknown): value is LanguageId {
  return typeof value === "string" && (LANGUAGE_IDS as readonly string[]).includes(value);
}

export function languageName(id: LanguageId): string {
  return LANGUAGES.find((language) => language.id === id)?.name ?? id;
}
