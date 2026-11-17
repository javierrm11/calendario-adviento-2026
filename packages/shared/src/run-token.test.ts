import { describe, expect, it } from "vitest";
import { type RunTicket, signRunTicket, verifyRunTicket } from "./run-token";

const SECRET = "secreto-de-prueba";
const run: RunTicket = {
  id: "run-1",
  userId: "usuario-1",
  day: 1,
  language: "py",
  cases: [{ name: "Cuenta los pendientes", scenario: "pendientes-varios", seed: "abc" }],
  expiresAt: 2_000,
};

describe("ejecuciones firmadas", () => {
  it("una ejecución firmada se verifica antes de caducar", async () => {
    const token = await signRunTicket(run, SECRET);
    expect(await verifyRunTicket(token, SECRET, 1_000)).toEqual(run);
  });

  it("caduca", async () => {
    const token = await signRunTicket(run, SECRET);
    expect(await verifyRunTicket(token, SECRET, 3_000)).toBeNull();
  });

  it("no se puede modificar sin invalidar la firma", async () => {
    const token = await signRunTicket(run, SECRET);
    const [payload, signature] = token.split(".");
    const forged = await signRunTicket({ ...run, userId: "otro" }, SECRET);
    expect(await verifyRunTicket(`${forged.split(".")[0]}.${signature}`, SECRET, 1_000)).toBeNull();
    expect(await verifyRunTicket(`${payload}.${signature}`, "otro-secreto", 1_000)).toBeNull();
  });
});
