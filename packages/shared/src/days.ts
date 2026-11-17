import type { Level } from "./levels";

export const TOTAL_DAYS = 24;

/** Lo único que es público de un día, aunque esté bloqueado: número, nivel y foto (CLAUDE.md). */
export interface PublicDay {
  day: number;
  level: Level;
  photo: {
    src: string;
    /** Color medio de la foto: pinta el hueco mientras carga. */
    color: string;
  };
}

const LEVEL_BY_DAY: readonly Level[] = [
  "easy",
  "easy",
  "medium",
  "medium",
  "extra",
  "easy",
  "medium",
  "easy",
  "medium",
  "extra",
  "hard",
  "medium",
  "medium",
  "medium",
  "extra",
  "hard",
  "medium",
  "medium",
  "medium",
  "extra",
  "easy",
  "hard",
  "hard",
  "hard",
];

const PHOTO_COLOR: readonly string[] = [
  "#294039",
  "#5C5F4C",
  "#6E3432",
  "#B49683",
  "#998B74",
  "#2A2741",
  "#5D2916",
  "#695C5C",
  "#948576",
  "#4C4D4E",
  "#757F7E",
  "#694E2E",
  "#6C87AA",
  "#56514E",
  "#B2B9C7",
  "#544E72",
  "#B08661",
  "#E2D4CC",
  "#14172C",
  "#5E4738",
  "#5E3921",
  "#454C57",
  "#A8C6D5",
  "#3F272C",
];

export const DAYS: readonly PublicDay[] = LEVEL_BY_DAY.map((level, index) => ({
  day: index + 1,
  level,
  photo: {
    src: `/fotos/dia-${String(index + 1).padStart(2, "0")}.jpg`,
    color: PHOTO_COLOR[index] ?? "#3A0B14",
  },
}));

export function isValidDay(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= TOTAL_DAYS;
}

export function getDay(day: number): PublicDay | undefined {
  return DAYS[day - 1];
}

/** Días 5, 10, 15 y 20: minijuego en vez de ticket. */
export function isMinigameDay(day: number): boolean {
  return getDay(day)?.level === "extra";
}
