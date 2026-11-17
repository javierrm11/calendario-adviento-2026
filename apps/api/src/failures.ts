import type { Failure } from "@np/shared";

const MAX_ENTRIES = 10_000;

/**
 * Cuántos fallos simulados se han servido ya en cada caso, para servirlos en orden ("primero 503, luego bien").
 * En memoria: fiable en Node y en local. En Cloudflare cada isolate tiene su copia, así que los tickets con
 * fallos en secuencia necesitan pasar esto a un Durable Object (ver pendiente.md).
 */
export class FailureCounter {
  private readonly served = new Map<string, number>();

  /** Devuelve el siguiente fallo que toca servir, o null si ya toca responder bien. */
  next(key: string, failures: readonly Failure[]): Failure | null {
    const count = this.served.get(key) ?? 0;
    const failure = failures[count];
    if (!failure) return null;
    if (this.served.size >= MAX_ENTRIES && !this.served.has(key)) {
      const oldest = this.served.keys().next().value;
      if (oldest !== undefined) this.served.delete(oldest);
    }
    this.served.set(key, count + 1);
    return failure;
  }
}
