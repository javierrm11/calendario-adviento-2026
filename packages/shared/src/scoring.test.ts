import { describe, expect, it } from "vitest";
import { bestLanguage, type Solve, score, starsByLanguage, starsFor } from "./scoring";

describe("starsFor", () => {
  it("da 1, 2 y 3 estrellas según el nivel", () => {
    expect(starsFor("easy", false)).toBe(1);
    expect(starsFor("medium", false)).toBe(2);
    expect(starsFor("hard", false)).toBe(3);
  });

  it("la pista resta media estrella", () => {
    expect(starsFor("medium", true)).toBe(1.5);
    expect(starsFor("easy", true)).toBe(0.5);
  });

  it("los minijuegos no dan estrellas, ni con pista", () => {
    expect(starsFor("extra", false)).toBe(0);
    expect(starsFor("extra", true)).toBe(0);
  });
});

describe("puntuación por mejor lenguaje", () => {
  const solves: Solve[] = [
    { day: 1, language: "js", stars: 1 },
    { day: 2, language: "js", stars: 1 },
    { day: 3, language: "js", stars: 2 },
    { day: 1, language: "py", stars: 1 },
    { day: 3, language: "py", stars: 1.5 },
  ];

  it("suma las estrellas de cada lenguaje", () => {
    expect(starsByLanguage(solves)).toEqual({ js: 4, ts: 0, py: 2.5 });
  });

  it("la puntuación es la del mejor lenguaje, no la suma", () => {
    expect(score(solves)).toBe(4);
    expect(bestLanguage(starsByLanguage(solves))).toEqual({ language: "js", stars: 4 });
  });

  it("en empate gana el lenguaje que va antes", () => {
    const tie: Solve[] = [
      { day: 1, language: "py", stars: 1 },
      { day: 1, language: "ts", stars: 1 },
    ];
    expect(bestLanguage(starsByLanguage(tie))?.language).toBe("ts");
  });

  it("sin tickets resueltos no hay mejor lenguaje", () => {
    expect(bestLanguage(starsByLanguage([]))).toBeNull();
    expect(score([])).toBe(0);
  });
});
