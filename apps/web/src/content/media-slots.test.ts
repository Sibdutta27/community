import { existsSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import enMessages from "../../messages/en.json";
import esMessages from "../../messages/es.json";

import { MEDIA_SLOTS, MEDIA_SLOT_KEYS } from "@/content/media-slots";

const PUBLIC_DIR = join(process.cwd(), "public");

describe("MEDIA_SLOTS registry", () => {
  // The registry is simultaneously the slot allowlist AND the shipped
  // fallback. A default that points at a file which is not in `public/` means
  // a slot with no DB row renders a 404 — the exact broken image the
  // registry exists to make impossible.
  it.each(MEDIA_SLOT_KEYS)(
    "ships a real file for the %s default",
    (slotKey) => {
      const relativePath = MEDIA_SLOTS[slotKey];

      expect(relativePath.startsWith("/")).toBe(true);
      expect(existsSync(join(PUBLIC_DIR, relativePath))).toBe(true);
    },
  );

  it("declares at least one slot", () => {
    expect(MEDIA_SLOT_KEYS.length).toBeGreaterThan(0);
  });
});

// `media` is injected into the message tree as a reserved namespace. If the
// catalog ever grows a real `media` namespace, the injection would silently
// clobber translated copy — and the loss would only show up on the rendered
// page, never in a type error.
describe("the reserved `media` namespace", () => {
  it("is not a namespace in the English catalog", () => {
    expect(Object.keys(enMessages)).not.toContain("media");
  });

  it("is not a namespace in the Spanish catalog", () => {
    expect(Object.keys(esMessages)).not.toContain("media");
  });
});
