import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const cookieJar = vi.hoisted(() => new Map<string, string>());

// Website Studio content is fetched here. Stubbed per-test so the suite never
// depends on a network call; the default is "nothing published", which is also
// the state the site ships in.
const contentOverrides = vi.hoisted(() => ({
  current: {} as Record<string, { en?: string; es?: string }>,
}));

vi.mock("@/i18n/content-overrides", () => ({
  CONTENT_CACHE_TAG: "site-content",
  getContentOverrides: async () => contentOverrides.current,
  __resetContentOverrideCache: () => {},
}));

// Request headers the middleware may have set (the Studio preview's `?lang`).
const headerJar = vi.hoisted(() => new Map<string, string>());

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) =>
      cookieJar.has(name)
        ? { name, value: cookieJar.get(name) as string }
        : undefined,
  }),
  headers: async () => ({
    get: (name: string) => headerJar.get(name.toLowerCase()) ?? null,
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
    headerJar.clear();
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
    headerJar.clear();
  });

  afterEach(() => {
    contentOverrides.current = {};
  });

  it("serves published copy over the shipped catalog", async () => {
    contentOverrides.current = {
      "nav.enrollToday": { en: "Join the Nation", es: "Únete a la Nación" },
    };

    const config = await resolveRequestConfig();

    expect(config.messages.nav.enrollToday).toBe("Join the Nation");
  });

  it("serves the Spanish override when the locale is Spanish", async () => {
    cookieJar.set("community_locale", "es");
    contentOverrides.current = {
      "nav.enrollToday": { en: "Join the Nation", es: "Únete a la Nación" },
    };

    const config = await resolveRequestConfig();

    expect(config.messages.nav.enrollToday).toBe("Únete a la Nación");
  });

  it("leaves untouched keys on their shipped value", async () => {
    contentOverrides.current = {
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

// The Studio previews the live site in an iframe. The `community_locale`
// cookie is third-party in that frame and browsers will not send it, so the
// preview asks for a language with `?lang=`, which the middleware forwards as
// a request header. Without this the Spanish preview would silently render
// English.
describe("i18n request config (preview locale header)", () => {
  beforeEach(() => {
    cookieJar.clear();
    headerJar.clear();
  });

  it("uses the preview header when no cookie is present", async () => {
    headerJar.set("x-locale", "es");

    const config = await resolveRequestConfig();

    expect(config.locale).toBe("es");
    expect(config.messages.nav.enrollToday).toBe("Inscríbete Hoy");
  });

  it("lets the preview header win over the visitor's cookie", async () => {
    cookieJar.set("community_locale", "en");
    headerJar.set("x-locale", "es");

    const config = await resolveRequestConfig();

    expect(config.locale).toBe("es");
  });

  it("ignores an unsupported header value rather than trusting it", async () => {
    cookieJar.set("community_locale", "es");
    headerJar.set("x-locale", "fr");

    const config = await resolveRequestConfig();

    expect(config.locale).toBe("es");
  });

  it("ignores a garbage header value", async () => {
    headerJar.set("x-locale", "../../etc/passwd");

    const config = await resolveRequestConfig();

    expect(config.locale).toBe("en");
  });
});
