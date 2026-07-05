import { describe, expect, it } from "vitest";

import {
  contrastRatio,
  formatContrastRatio,
  meetsContrastTarget,
} from "./contrast";

describe("contrastRatio", () => {
  it("returns 21 for black on white", () => {
    expect(contrastRatio("#ffffff", "#000000")).toBeCloseTo(21, 1);
  });

  it("returns 1 for identical colors", () => {
    expect(contrastRatio("#0a56a8", "#0a56a8")).toBe(1);
  });

  it("is symmetric", () => {
    expect(contrastRatio("#0a56a8", "#ffffff")).toBeCloseTo(
      contrastRatio("#ffffff", "#0a56a8"),
      5,
    );
  });

  it("matches the documented azul-on-white ratio (~7.2:1)", () => {
    expect(contrastRatio("#ffffff", "#0a56a8")).toBeCloseTo(7.22, 1);
  });

  it("matches the documented celeste-tint pairing (~10.2:1)", () => {
    expect(contrastRatio("#123b5e", "#e7f2fb")).toBeCloseTo(10.2, 1);
  });

  it("throws on malformed hex", () => {
    expect(() => contrastRatio("#12345", "#ffffff")).toThrow();
    expect(() => contrastRatio("blue", "#ffffff")).toThrow();
  });
});

describe("formatContrastRatio", () => {
  it("formats to one decimal with the :1 suffix", () => {
    expect(formatContrastRatio(7.2178)).toBe("7.2:1");
    expect(formatContrastRatio(21)).toBe("21:1");
  });
});

describe("meetsContrastTarget", () => {
  it("requires 4.5:1 for normal text", () => {
    expect(meetsContrastTarget(4.5, "aa-text")).toBe(true);
    expect(meetsContrastTarget(4.49, "aa-text")).toBe(false);
  });

  it("requires 3:1 for non-text UI", () => {
    expect(meetsContrastTarget(3, "aa-ui")).toBe(true);
    expect(meetsContrastTarget(2.9, "aa-ui")).toBe(false);
  });

  it("never fails decorative pairings", () => {
    expect(meetsContrastTarget(1.2, "decorative")).toBe(true);
  });
});
