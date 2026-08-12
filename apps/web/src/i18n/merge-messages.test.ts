import { describe, expect, it } from "vitest";

import { MEDIA_SLOTS } from "@/content/media-slots";
import { mergeMessages, withMediaNamespace } from "@/i18n/merge-messages";

function defaults() {
  return {
    home: { hero: { title: "Welcome", subtitle: "Sub" } },
    yucayeke: { welcome: { paragraphs: ["One", "Two"] } },
  };
}

describe("mergeMessages", () => {
  it("replaces a nested string for the requested locale", () => {
    const result = mergeMessages(
      defaults(),
      { "home.hero.title": { en: "Kaya!", es: "¡Kaya!" } },
      "en",
    );

    expect((result.home as never)["hero"]["title"]).toBe("Kaya!");
  });

  it("takes the Spanish value when rendering Spanish", () => {
    const result = mergeMessages(
      defaults(),
      { "home.hero.title": { en: "Kaya!", es: "¡Kaya!" } },
      "es",
    );

    expect((result.home as never)["hero"]["title"]).toBe("¡Kaya!");
  });

  it("leaves a locale untouched when only the other was overridden", () => {
    const result = mergeMessages(
      defaults(),
      { "home.hero.title": { en: "Kaya!" } },
      "es",
    );

    expect((result.home as never)["hero"]["title"]).toBe("Welcome");
  });

  // The catalog's one array leaf. Writing `obj["0"]` instead of `arr[0]` would
  // turn it into an object and break every `.map()` over it on the site.
  it("keeps an array leaf an Array", () => {
    const result = mergeMessages(
      defaults(),
      { "yucayeke.welcome.paragraphs.0": { en: "Rewritten" } },
      "en",
    );

    const paragraphs = (result.yucayeke as never)["welcome"]["paragraphs"];

    expect(Array.isArray(paragraphs)).toBe(true);
    expect(paragraphs).toEqual(["Rewritten", "Two"]);
  });

  it("ignores a key path the catalog does not have", () => {
    const result = mergeMessages(
      defaults(),
      { "home.hero.invented": { en: "Nope" } },
      "en",
    );

    expect((result.home as never)["hero"]).not.toHaveProperty("invented");
  });

  it("ignores a path whose parent does not exist", () => {
    const result = mergeMessages(
      defaults(),
      { "nothing.here.at.all": { en: "Nope" } },
      "en",
    );

    expect(result).not.toHaveProperty("nothing");
  });

  // Appending past the end would render a paragraph no translation exists for.
  it("refuses to extend an array beyond the shipped entries", () => {
    const result = mergeMessages(
      defaults(),
      { "yucayeke.welcome.paragraphs.2": { en: "Third" } },
      "en",
    );

    expect((result.yucayeke as never)["welcome"]["paragraphs"]).toHaveLength(2);
  });

  it("refuses to overwrite a branch with a string", () => {
    const result = mergeMessages(
      defaults(),
      { "home.hero": { en: "clobbered" } },
      "en",
    );

    expect(typeof (result.home as never)["hero"]).toBe("object");
  });

  // The bug this guards is subtle and total: the imported JSON is a module
  // singleton shared by every request in the process. Mutating it once would
  // leak one visitor's override into every later render, in both locales.
  it("never mutates the catalog it was given", () => {
    const catalog = defaults();

    const first = mergeMessages(
      catalog,
      { "home.hero.title": { en: "First" } },
      "en",
    );

    const second = mergeMessages(
      catalog,
      { "home.hero.subtitle": { en: "Second" } },
      "en",
    );

    expect((catalog.home as never)["hero"]["title"]).toBe("Welcome");
    expect((first.home as never)["hero"]["title"]).toBe("First");
    expect((second.home as never)["hero"]["title"]).toBe("Welcome");
  });

  it("returns the catalog unchanged when there is nothing to apply", () => {
    const catalog = defaults();
    expect(mergeMessages(catalog, {}, "en")).toBe(catalog);
  });

  it("ignores a non-string override value", () => {
    const result = mergeMessages(
      defaults(),
      { "home.hero.title": { en: 42 as unknown as string } },
      "en",
    );

    expect((result.home as never)["hero"]["title"]).toBe("Welcome");
  });
});

/** Reach into the injected `media` tree the way `t("media.a.b")` would. */
function readSlot(messages: Record<string, unknown>, slotKey: string): unknown {
  return slotKey
    .split(".")
    .reduce<unknown>(
      (cursor, segment) => (cursor as Record<string, unknown>)?.[segment],
      messages.media,
    );
}

describe("withMediaNamespace", () => {
  // The whole point of keeping the registry in git: a slot with no database
  // row is not a missing image, it is the image that shipped.
  it("uses the shipped default when no row exists for the slot", () => {
    const result = withMediaNamespace(defaults(), {});

    expect(readSlot(result, "brand.logo")).toBe(MEDIA_SLOTS["brand.logo"]);
  });

  it("serves a configured slot over the shipped default", () => {
    const result = withMediaNamespace(defaults(), {
      "brand.logo": { url: "https://cdn.test/site-media/new-logo.png" },
    });

    expect(readSlot(result, "brand.logo")).toBe(
      "https://cdn.test/site-media/new-logo.png",
    );
  });

  // The registry is the allowlist. A row for a slot the code does not render
  // — a typo, or a slot a developer removed — must never reach the message
  // tree, where it would sit as an unrenderable key nobody can find.
  it("ignores a slot key the registry does not declare", () => {
    const result = withMediaNamespace(defaults(), {
      "home.invented.slot": { url: "https://cdn.test/rogue.png" },
    });

    expect(readSlot(result, "home.invented")).toBeUndefined();
  });

  it("keeps the default when a configured slot has no usable url", () => {
    const result = withMediaNamespace(defaults(), {
      "brand.logo": { url: "" },
      "about.story": { url: 7 as unknown as string },
    });

    expect(readSlot(result, "brand.logo")).toBe(MEDIA_SLOTS["brand.logo"]);
    expect(readSlot(result, "about.story")).toBe(MEDIA_SLOTS["about.story"]);
  });

  // `t("media.home.hero.portrait.1")` resolves by walking the tree segment by
  // segment. A flat `{"home.hero.portrait.1": …}` map type-checks and reads
  // back in a unit test, but renders nothing on the site.
  it("nests dotted slot keys so a dotted lookup resolves", () => {
    const result = withMediaNamespace(defaults(), {});

    const portraits = (result.media as Record<string, never>)["home"]["hero"][
      "portrait"
    ];

    expect(portraits["1"]).toBe(MEDIA_SLOTS["home.hero.portrait.1"]);
  });

  it("leaves the rest of the catalog alone", () => {
    const result = withMediaNamespace(defaults(), {});

    expect((result.home as never)["hero"]["title"]).toBe("Welcome");
  });

  // Same module-singleton hazard as mergeMessages: the catalog is shared by
  // every request in the process.
  it("never mutates the catalog it was given", () => {
    const catalog = defaults();

    withMediaNamespace(catalog, {
      "brand.logo": { url: "https://cdn.test/logo.png" },
    });

    expect(catalog).not.toHaveProperty("media");
  });
});
