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

  it("defines the shared elevated-card shadows (ink-tinted, layered)", () => {
    // The enrollment-card layered shadow, promoted to tokens so every
    // feature card can use `shadow-card` / `shadow-card-soft`.
    expect(tokensCss).toMatch(
      /--shadow-surface-card:\s*0 28px 56px -40px rgba\(20, 26, 34, 0\.35\),\s*0 10px 24px -20px rgba\(20, 26, 34, 0\.25\)/,
    );
    expect(tokensCss).toMatch(
      /--shadow-surface-card-soft:\s*0 18px 36px -28px rgba\(20, 26, 34, 0\.22\),\s*0 6px 16px -14px rgba\(20, 26, 34, 0\.16\)/,
    );
    expect(tokensCss).toMatch(/--shadow-card:\s*var\(--shadow-surface-card\)/);
    expect(tokensCss).toMatch(
      /--shadow-card-soft:\s*var\(--shadow-surface-card-soft\)/,
    );
  });
});
