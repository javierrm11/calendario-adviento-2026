/** Niveles de dificultad. Los textos ("Fácil", "Media"…) viven en los mensajes de la web. */
export const LEVELS = {
  easy: { stars: 1, minutes: 10, pips: 1 },
  medium: { stars: 2, minutes: 20, pips: 2 },
  hard: { stars: 3, minutes: 30, pips: 3 },
  extra: { stars: 0, minutes: null, pips: 0 },
} as const satisfies Record<string, { stars: number; minutes: number | null; pips: number }>;

export type Level = keyof typeof LEVELS;

export const LEVEL_IDS = Object.keys(LEVELS) as Level[];
