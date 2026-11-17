/**
 * Firmas HMAC-SHA256 con Web Crypto (Node, navegador y Cloudflare Workers).
 * Cada tipo de token firma su mensaje con un prefijo propio, para que uno no sirva como otro.
 */
import { base64UrlToBytes, bytesToBase64Url } from "./encoding";

const encoder = new TextEncoder();

async function hmacKey(secret: string): ReturnType<typeof crypto.subtle.importKey> {
  if (!secret) throw new Error("El secreto de los tokens está vacío (NP_TOKEN_SECRET).");
  return crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify",
  ]);
}

export async function sign(message: string, secret: string): Promise<string> {
  const signature = await crypto.subtle.sign("HMAC", await hmacKey(secret), encoder.encode(message));
  return bytesToBase64Url(signature);
}

/** Comparación de tiempo constante (HMAC verify). */
export async function verifySignature(message: string, signature: string, secret: string): Promise<boolean> {
  const bytes = base64UrlToBytes(signature);
  if (!bytes) return false;
  return crypto.subtle.verify("HMAC", await hmacKey(secret), bytes, encoder.encode(message));
}

const API_PREFIX = "np_";

/** Token de la API del Polo Norte: `np_<userId>.<firma>`. La API lo comprueba sin consultar la base de datos. */
export async function signApiToken(userId: string, secret: string): Promise<string> {
  return `${API_PREFIX}${userId}.${await sign(`api:${userId}`, secret)}`;
}

/** Devuelve el userId si el token es válido, o null. */
export async function verifyApiToken(token: string, secret: string): Promise<string | null> {
  if (!token.startsWith(API_PREFIX)) return null;
  const dot = token.lastIndexOf(".");
  if (dot <= API_PREFIX.length) return null;
  const userId = token.slice(API_PREFIX.length, dot);
  return (await verifySignature(`api:${userId}`, token.slice(dot + 1), secret)) ? userId : null;
}
