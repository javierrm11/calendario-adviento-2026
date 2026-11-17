/** Base64url sin relleno, válido en Node, navegadores y Cloudflare Workers. */
const encoder = new TextEncoder();
const decoder = new TextDecoder();

export function bytesToBase64Url(bytes: ArrayBuffer | Uint8Array): string {
  let binary = "";
  for (const byte of bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes))
    binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function base64UrlToBytes(text: string): Uint8Array<ArrayBuffer> | null {
  try {
    const binary = atob(text.replace(/-/g, "+").replace(/_/g, "/"));
    return Uint8Array.from(binary, (char) => char.charCodeAt(0));
  } catch {
    return null;
  }
}

export function textToBase64Url(text: string): string {
  return bytesToBase64Url(encoder.encode(text));
}

export function base64UrlToText(text: string): string | null {
  const bytes = base64UrlToBytes(text);
  return bytes ? decoder.decode(bytes) : null;
}
