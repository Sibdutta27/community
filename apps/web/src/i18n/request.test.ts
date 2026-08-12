import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const cookieJar = vi.hoisted(() => new Map<string, string>());

// Website Studio content is fetched here. Stubbed per-test so the suite never
// depends on a network call; the default is "nothing published", which is also
// the state the site ships in.
const siteContent = vi.hoisted(() => ({
  overrides: {} as Record<string, { en?: string; es?: string }>,
  media: {} as Record<string, { url: string }>,
}));

vi.mock("@/i18n/content-overrides", () => ({
  CONTENT_CACHE_TAG: "site-content",
  getSiteContent: async () => ({
    overrides: siteContent.overrides,
    media: siteContent.media,
  }),
  __resetContentOverrideCache: () => {},
}));

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) =>
      cookieJar.has(name)
        ? { name, value: cookieJar.get(name) as string }
        : undefined,
  }),
}));

// `next-intl/server` resolves to its client build under jsdom, where
// `getRequestConfig` throws. It is an identity wrapper at runtime, so mock
// it as such — the behavior under test (cookie → locale → messages) is ours.
vi.mock("next-intl/server", () => ({
  getRequestConfig: (factory: unknown) => factory,
}));

import requestConfig from "@/i18n/request";

type ResolvedRequestConfig = Readonly<{
  locale: string;
  messages: {
    nav: { enrollToday: string };
    home: { hero: { ctaEnroll: string } };
    media: {
      brand: { logo: string };
      home: { hero: { portrait: Record<string, string> } };
    };
  };
}>;

async function resolveRequestConfig(): Promise<ResolvedRequestConfig> {
  const config = await requestConfig({
    requestLocale: Promise.resolve(undefined),
  });

  return config as unknown as ResolvedRequestConfig;
}

describe("i18n request config (cookie-based locale)", () => {
  beforeEach(() => {
    cookieJar.clear();
  });

  it("defaults to English when no locale cookie is set", async () => {
    const config = await resolveRequestConfig();

    expect(config.locale).toBe("en");
    expect(config.messages.nav.enrollToday).toBe("Enroll Today");
  });

  it("resolves Spanish from the community_locale cookie", async () => {
    cookieJar.set("community_locale", "es");

    const config = await resolveRequestConfig();

    expect(config.locale).toBe("es");
    expect(config.messages.nav.enrollToday).toBe("Inscríbete Hoy");
    expect(config.messages.home.hero.ctaEnroll).toBe("Comienza tu Inscripción");
  });

  it("falls back to English for an unsupported cookie value", async () => {
    cookieJar.set("community_locale", "fr");

    const config = await resolveRequestConfig();

    expect(config.locale).toBe("en");
    expect(config.messages.nav.enrollToday).toBe("Enroll Today");
  });

  it("falls back to English for a garbage cookie value", async () => {
    cookieJar.set("community_locale", "../../etc/passwd");

    const config = await resolveRequestConfig();

    expect(config.locale).toBe("en");
  });
});

describe("i18n request config (Website Studio content)", () => {
  beforeEach(() => {
    cookieJar.clear();
  });

  afterEach(() => {
    siteContent.overrides = {};
    siteContent.media = {};
  });

  it("serves published copy over the shipped catalog", async () => {
    siteContent.overrides = {
      "nav.enrollToday": { en: "Join the Nation", es: "Únete a la Nación" },
    };

    const config = await resolveRequestConfig();

    expect(config.messages.nav.enrollToday).toBe("Join the Nation");
  });

  it("serves the Spanish override when the locale is Spanish", async () => {
    cookieJar.set("community_locale", "es");
    siteContent.overrides = {
      "nav.enrollToday": { en: "Join the Nation", es: "Únete a la Nación" },
    };

    const config = await resolveRequestConfig();

    expect(config.messages.nav.enrollToday).toBe("Únete a la Nación");
  });

  it("leaves untouched keys on their shipped value", async () => {
    siteContent.overrides = {
      "nav.enrollToday": { en: "Join the Nation" },
    };

    const config = await resolveRequestConfig();

    expect(config.messages.home.hero.ctaEnroll).toBe("Start Your Enrollment");
  });

  // The whole safety argument for storing overrides rather than moving the
  // catalog into the database: with nothing published — or with the API
  // unreachable, which resolves to the same empty map — the site is exactly
  // what shipped.
  it("renders the shipped catalog when no content is published", async () => {
    const config = await resolveRequestConfig();

    expect(config.messages.nav.enrollToday).toBe("Enroll Today");
  });
});

describe("i18n request config (site images)", () => {
  beforeEach(() => {
    cookieJar.clear();
  });

  afterEach(() => {
    siteContent.media = {};
  });

  // The reserved namespace has to be on the same messages object next-intl
  // already ships to the client, or `t("media.…")` works on the server and
  // throws in a client component.
  it("exposes the shipped image under the media namespace", async () => {
    const config = await resolveRequestConfig();

    expect(config.messages.media.brand.logo).toBe("/images/logo.png");
  });

  it("serves an assigned image over the shipped one", async () => {
    siteContent.media = {
      "brand.logo": { url: "https://cdn.test/site-media/new-logo.png" },
    };

    const config = await resolveRequestConfig();

    expect(config.messages.media.brand.logo).toBe(
      "https://cdn.test/site-media/new-logo.png",
    );
  });

  // Media is unconfigured in every environment today, so this is the path the
  // site is actually on: no rows, every slot on its git default.
  it("renders every slot from git when nothing is assigned", async () => {
    const config = await resolveRequestConfig();

    expect(config.messages.media.home.hero.portrait["1"]).toBe(
      "/images/member1.png",
    );
  });
});
