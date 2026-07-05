import { describe, expect, it } from "vitest";

import { contrastRatio, meetsContrastTarget } from "./contrast";
import { paletteGroups } from "./palette";

const allEntries = paletteGroups.flatMap((group) => [...group.entries]);

describe("paletteGroups", () => {
  it("covers every semantic token group of the azul-flag system", () => {
    const ids = paletteGroups.map((group) => group.id);

    expect(ids).toEqual(
      expect.arrayContaining([
        "base",
        "neutrals",
        "azul",
        "celeste",
        "emphasis",
        "destructive",
      ]),
    );
  });

  it("documents the core semantic tokens", () => {
    const tokens = allEntries.map((entry) => entry.token);

    for (const token of [
      "--background",
      "--surface",
      "--surface-muted",
      "--border",
      "--foreground",
      "--muted-foreground",
      "--primary",
      "--secondary",
      "--accent",
      "--emphasis",
      "--destructive",
      "--ring",
    ]) {
      expect(tokens).toContain(token);
    }
  });

  it("uses well-formed 6-digit hex values everywhere", () => {
    for (const entry of allEntries) {
      expect(entry.hex).toMatch(/^#[0-9a-f]{6}$/);
      expect(entry.pairedWith.hex).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it("meets its own WCAG AA claims for every pairing", () => {
    for (const entry of allEntries) {
      const ratio = contrastRatio(entry.hex, entry.pairedWith.hex);

      expect(
        meetsContrastTarget(ratio, entry.assessment),
        `${entry.token} vs ${entry.pairedWith.label} (${ratio.toFixed(2)}:1)`,
      ).toBe(true);
    }
  });

  it("styles swatches with token utilities, never hardcoded hex", () => {
    for (const entry of allEntries) {
      expect(entry.swatchClassName).not.toMatch(/#|\[/);
      expect(entry.swatchTextClassName).not.toMatch(/#|\[/);
    }
  });
});
