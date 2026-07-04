import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

// The palette contract: azul-led Puerto-Rican-flag tokens, WCAG AA.
const tokensCss = readFileSync(
  path.join(__dirname, "tokens.css"),
  "utf8",
).toLowerCase();

describe("design tokens (azul-led flag palette)", () => {
  it("uses deep azul for primary and the focus ring", () => {
    expect(tokensCss).toMatch(/--primary:\s*#0a56a8/);
    expect(tokensCss).toMatch(/--ring:\s*#0a56a8/);
    expect(tokensCss).toMatch(/--primary-foreground:\s*#ffffff/);
  });

  it("uses the cool clean base with celeste secondary/accent", () => {
    expect(tokensCss).toMatch(/--background:\s*#f6f8fa/);
    expect(tokensCss).toMatch(/--surface:\s*#ffffff/);
    expect(tokensCss).toMatch(/--surface-muted:\s*#eef2f6/);
    expect(tokensCss).toMatch(/--border:\s*#e2e6eb/);
    expect(tokensCss).toMatch(/--foreground:\s*#141a22/);
    expect(tokensCss).toMatch(/--muted-foreground:\s*#5a6472/);
    expect(tokensCss).toMatch(/--secondary:\s*#e7f2fb/);
    expect(tokensCss).toMatch(/--secondary-foreground:\s*#123b5e/);
    expect(tokensCss).toMatch(/--accent:\s*#4ea6dc/);
    expect(tokensCss).toMatch(/--accent-foreground:\s*#0b2033/);
  });

  it("defines flag-red emphasis and destructive tokens", () => {
    expect(tokensCss).toMatch(/--emphasis:\s*#c42032/);
    expect(tokensCss).toMatch(/--emphasis-foreground:\s*#ffffff/);
    expect(tokensCss).toMatch(/--destructive:\s*#b3261e/);
    expect(tokensCss).toMatch(/--destructive-foreground:\s*#ffffff/);
  });

  it("exposes the new tokens to Tailwind via @theme", () => {
    expect(tokensCss).toMatch(/--color-emphasis:\s*var\(--emphasis\)/);
    expect(tokensCss).toMatch(/--color-destructive:\s*var\(--destructive\)/);
  });

  it("contains no legacy teal values", () => {
    expect(tokensCss).not.toContain("#2d6e7e");
    expect(tokensCss).not.toContain("#5c94a1");
  });
});
