import { describe, expect, it } from "vitest";
import { currentDay, isUnlocked, unlockAt } from "./unlock";

const madrid = (iso: string) => new Date(`${iso}+01:00`);

describe("unlockAt", () => {
  it("abre cada día a las 6:00 de Madrid (5:00 UTC)", () => {
    expect(unlockAt(1).toISOString()).toBe("2026-12-01T05:00:00.000Z");
    expect(unlockAt(24).toISOString()).toBe("2026-12-24T05:00:00.000Z");
  });
});

describe("isUnlocked", () => {
  it("sigue cerrado a las 5:59:59", () => {
    expect(isUnlocked(1, madrid("2026-12-01T05:59:59"))).toBe(false);
  });

  it("se abre justo a las 6:00:00", () => {
    expect(isUnlocked(1, madrid("2026-12-01T06:00:00"))).toBe(true);
  });

  it("el día 24 solo se abre el 24", () => {
    expect(isUnlocked(24, madrid("2026-12-23T23:59:59"))).toBe(false);
    expect(isUnlocked(24, madrid("2026-12-24T06:00:00"))).toBe(true);
  });
});

describe("currentDay", () => {
  it("es null antes del 1 de diciembre a las 6:00", () => {
    expect(currentDay(madrid("2026-11-16T12:00:00"))).toBeNull();
    expect(currentDay(madrid("2026-12-01T05:59:59"))).toBeNull();
  });

  it("antes de las 6:00 sigue siendo el día anterior", () => {
    expect(currentDay(madrid("2026-12-12T05:30:00"))).toBe(11);
    expect(currentDay(madrid("2026-12-12T07:00:00"))).toBe(12);
  });

  it("se queda en 24 después de Nochebuena", () => {
    expect(currentDay(madrid("2026-12-31T10:00:00"))).toBe(24);
  });
});
