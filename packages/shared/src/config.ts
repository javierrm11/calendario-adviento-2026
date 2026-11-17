/** Límite de ejecuciones por usuario y minuto. Provisional: el valor definitivo está por decidir (CLAUDE.md). */
export const SUBMISSIONS_PER_MINUTE = 6;

/** Antigüedad mínima de la cuenta de GitHub para salir en la clasificación. Por decidir; null = sin requisito. */
export const LEADERBOARD_MIN_ACCOUNT_AGE_DAYS: number | null = null;

/** Tamaño máximo del código de un envío, en caracteres. */
export const MAX_CODE_LENGTH = 20_000;

/** Tiempo para ejecutar en el navegador y devolver las respuestas (Python puede tardar en cargar la primera vez). */
export const RUN_TTL_MS = 5 * 60_000;
