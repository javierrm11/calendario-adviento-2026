import { type Solve, solvedDays } from "./scoring";

/** Insignias. Los textos viven en los mensajes de la web; aquí solo el identificador y el icono. */
export const BADGES = [
  { id: "first-ticket", icon: "star" },
  { id: "streak-7", icon: "flame" },
  { id: "polyglot", icon: "globe" },
  { id: "no-hints", icon: "bulb" },
  { id: "christmas-eve", icon: "gift" },
] as const;

export type BadgeId = (typeof BADGES)[number]["id"];

export interface BadgeInput {
  solves: readonly Solve[];
  hintDays: ReadonlySet<number>;
  streak: number;
}

/** Calcula las insignias de logros a partir de los tickets resueltos. */
export function earnedBadges({ solves, hintDays, streak }: BadgeInput): Set<BadgeId> {
  const earned = new Set<BadgeId>();
  const days = solvedDays(solves);

  if (days.size > 0) earned.add("first-ticket");
  if (streak >= 7) earned.add("streak-7");
  if (days.has(24)) earned.add("christmas-eve");

  const languagesByDay = new Map<number, Set<string>>();
  for (const solve of solves) {
    const languages = languagesByDay.get(solve.day) ?? new Set<string>();
    languages.add(solve.language);
    languagesByDay.set(solve.day, languages);
  }
  if ([...languagesByDay.values()].some((languages) => languages.size >= 3)) earned.add("polyglot");

  const withoutHints = [...days].filter((day) => !hintDays.has(day)).length;
  if (withoutHints >= 5) earned.add("no-hints");

  return earned;
}
