import { describe, expect, it } from "vitest";
import { earnedBadges } from "./badges";
import type { Solve } from "./scoring";

describe("earnedBadges", () => {
  it("sin tickets no hay insignias", () => {
    expect(earnedBadges({ solves: [], hintDays: new Set(), streak: 0 }).size).toBe(0);
  });

  it("da políglota al resolver un día en tres lenguajes", () => {
    const solves: Solve[] = [
      { day: 2, language: "js", stars: 1 },
      { day: 2, language: "py", stars: 1 },
      { day: 2, language: "ts", stars: 1 },
    ];
    const badges = earnedBadges({ solves, hintDays: new Set(), streak: 1 });
    expect(badges.has("first-ticket")).toBe(true);
    expect(badges.has("polyglot")).toBe(true);
  });

  it("sin pistas exige cinco días resueltos sin ayuda", () => {
    const solves: Solve[] = [1, 2, 3, 4, 6].map((day) => ({ day, language: "js", stars: 1 }));
    expect(earnedBadges({ solves, hintDays: new Set(), streak: 5 }).has("no-hints")).toBe(true);
    expect(earnedBadges({ solves, hintDays: new Set([1]), streak: 5 }).has("no-hints")).toBe(false);
  });
});
