import { LANGUAGE_IDS, type LanguageId } from "./languages";
import { LEVELS, type Level } from "./levels";

export const HINT_PENALTY = 0.5;

export interface Solve {
  day: number;
  language: LanguageId;
  stars: number;
}

/** Estrellas que da un ticket resuelto. La pista resta medio punto y nunca baja de cero. */
export function starsFor(level: Level, hintUsed: boolean): number {
  const base = LEVELS[level].stars;
  if (base === 0) return 0;
  return Math.max(0, base - (hintUsed ? HINT_PENALTY : 0));
}

export function starsByLanguage(solves: readonly Solve[]): Record<LanguageId, number> {
  const totals = Object.fromEntries(LANGUAGE_IDS.map((id) => [id, 0])) as Record<LanguageId, number>;
  for (const solve of solves) totals[solve.language] += solve.stars;
  return totals;
}

/** El lenguaje con más estrellas. Empata a favor del que va antes en LANGUAGES. Null si no hay estrellas. */
export function bestLanguage(
  totals: Record<LanguageId, number>,
): { language: LanguageId; stars: number } | null {
  let best: { language: LanguageId; stars: number } | null = null;
  for (const language of LANGUAGE_IDS) {
    const stars = totals[language];
    if (stars > 0 && (best === null || stars > best.stars)) best = { language, stars };
  }
  return best;
}

/** Puntuación del usuario: las estrellas de su mejor lenguaje, no la suma de todos. */
export function score(solves: readonly Solve[]): number {
  return bestLanguage(starsByLanguage(solves))?.stars ?? 0;
}

/** Días distintos con al menos un ticket resuelto, en cualquier lenguaje. */
export function solvedDays(solves: readonly Solve[]): Set<number> {
  return new Set(solves.map((solve) => solve.day));
}
