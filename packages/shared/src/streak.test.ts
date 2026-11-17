import { describe, expect, it } from "vitest";
import { streak } from "./streak";

describe("streak", () => {
  it("cuenta días seguidos hasta hoy", () => {
    expect(streak(new Set([2, 3, 4]), 4)).toBe(3);
  });

  it("si hoy no está resuelto, cuenta desde ayer", () => {
    expect(streak(new Set([2, 3]), 4)).toBe(2);
  });

  it("un hueco corta la racha", () => {
    expect(streak(new Set([1, 3, 4]), 4)).toBe(2);
  });

  it("los días de minijuego no rompen la racha", () => {
    expect(streak(new Set([3, 4, 6, 7]), 7)).toBe(4);
  });

  it("antes de empezar no hay racha", () => {
    expect(streak(new Set(), null)).toBe(0);
  });
});
