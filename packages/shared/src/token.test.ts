import { describe, expect, it } from "vitest";
import { signApiToken, verifyApiToken } from "./token";

const SECRET = "secreto-de-prueba";
const USER = "5b0f8a2e-1c3d-4e5f-8a9b-0c1d2e3f4a5b";

describe("tokens de la API del Polo Norte", () => {
  it("un token firmado se verifica y devuelve el usuario", async () => {
    const token = await signApiToken(USER, SECRET);
    expect(token.startsWith("np_")).toBe(true);
    expect(await verifyApiToken(token, SECRET)).toBe(USER);
  });

  it("rechaza un token firmado con otro secreto", async () => {
    const token = await signApiToken(USER, "otro-secreto");
    expect(await verifyApiToken(token, SECRET)).toBeNull();
  });

  it("rechaza un token con el usuario cambiado", async () => {
    const token = await signApiToken(USER, SECRET);
    const forged = token.replace(USER, "00000000-0000-0000-0000-000000000000");
    expect(await verifyApiToken(forged, SECRET)).toBeNull();
  });

  it("rechaza basura", async () => {
    expect(await verifyApiToken("hola", SECRET)).toBeNull();
    expect(await verifyApiToken("np_.", SECRET)).toBeNull();
    expect(await verifyApiToken("np_abc.%%%", SECRET)).toBeNull();
  });
});
