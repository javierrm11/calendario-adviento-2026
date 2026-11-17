/** Hash FNV-1a de 32 bits: convierte una semilla de texto en un número. */
export function hash(text: string): number {
  let value = 2166136261;
  for (let i = 0; i < text.length; i++) {
    value ^= text.charCodeAt(i);
    value = Math.imul(value, 16777619);
  }
  return value >>> 0;
}

/** Generador pseudoaleatorio determinista (mulberry32): la misma semilla da siempre la misma secuencia. */
export function seededRandom(seed: string): () => number {
  let state = hash(seed);
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pick<T>(items: readonly T[], random: () => number): T {
  const item = items[Math.floor(random() * items.length)];
  if (item === undefined) throw new Error("pick() con una lista vacía");
  return item;
}

/** Entero entre min y max, ambos incluidos. */
export function between(random: () => number, min: number, max: number): number {
  return min + Math.floor(random() * (max - min + 1));
}
