import { describe, expect, it } from "vitest";

import enMessages from "../../messages/en.json";
import esMessages from "../../messages/es.json";

function collectKeyPaths(value: unknown, prefix = ""): string[] {
  if (typeof value !== "object" || value === null) {
    return [prefix];
  }

  return Object.entries(value as Record<string, unknown>).flatMap(
    ([key, child]) =>
      collectKeyPaths(child, prefix ? `${prefix}.${key}` : key),
  );
}

describe("message catalogs", () => {
  it("exposes the agreed namespaces", () => {
    for (const namespace of [
      "common",
      "nav",
      "footer",
      "home",
      "enrollment",
      "consent",
      "errors",
      "profile",
    ]) {
      expect(enMessages).toHaveProperty(namespace);
      expect(esMessages).toHaveProperty(namespace);
    }
  });

  it("mirrors every key between en and es", () => {
    expect(collectKeyPaths(esMessages).sort()).toEqual(
      collectKeyPaths(enMessages).sort(),
    );
  });

  it("never leaves an es message empty or identical-by-accident structure", () => {
    for (const path of collectKeyPaths(esMessages)) {
      const leaf = path
        .split(".")
        .reduce<unknown>(
          (node, key) => (node as Record<string, unknown>)[key],
          esMessages,
        );
      expect(typeof leaf).toBe("string");
      expect((leaf as string).trim().length).toBeGreaterThan(0);
    }
  });
});
