import { describe, expect, it } from "vitest";

import { mergeMessages } from "@/i18n/merge-messages";

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
