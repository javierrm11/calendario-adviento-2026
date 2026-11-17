import "server-only";

/**
 * Hora actual según el servidor. Es la única fuente para decidir qué está desbloqueado.
 * Fuera de producción se puede simular con NP_FECHA_SIMULADA (por ejemplo 2026-12-12T07:00:00+01:00).
 */
export function getNow(): Date {
  const simulated = process.env.NP_FECHA_SIMULADA;
  if (simulated && process.env.NODE_ENV !== "production") {
    const date = new Date(simulated);
    if (!Number.isNaN(date.getTime())) return date;
  }
  return new Date();
}
