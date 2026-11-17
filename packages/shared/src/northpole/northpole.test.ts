import { describe, expect, it } from "vitest";
import { decodeCase, encodeCase } from "./cases";
import { generateGifts } from "./gifts";
import { giftCounts } from "./scenarios";

describe("escenarios de regalos", () => {
  it("la misma semilla da los mismos números", () => {
    expect(giftCounts("pendientes-varios", "abc")).toEqual(giftCounts("pendientes-varios", "abc"));
  });

  it("semillas distintas dan números distintos (no se pueden memorizar)", () => {
    const seen = new Set(
      ["a", "b", "c", "d", "e", "f"].map((seed) => giftCounts("pendientes-varios", seed).pending),
    );
    expect(seen.size).toBeGreaterThan(1);
  });

  it("los regalos generados respetan los números del escenario", () => {
    const counts = giftCounts("pendientes-muchos", "semilla");
    const gifts = generateGifts("semilla", counts);
    expect(gifts.filter((gift) => gift.estado === "pendiente")).toHaveLength(counts.pending);
    expect(gifts).toHaveLength(counts.pending + counts.delivered);
  });

  it("pendientes-ninguno no tiene pendientes", () => {
    expect(giftCounts("pendientes-ninguno", "x").pending).toBe(0);
  });
});

describe("casos en la URL", () => {
  it("se codifican y decodifican", () => {
    const data = { scenario: "fallo-503", seed: "1234abcd" } as const;
    expect(decodeCase(encodeCase(data))).toEqual(data);
  });

  it("rechaza casos inventados o rotos", () => {
    expect(decodeCase("basura")).toBeNull();
    expect(decodeCase(encodeCase({ scenario: "no-existe" as "fallo-503", seed: "x" }))).toBeNull();
  });
});
