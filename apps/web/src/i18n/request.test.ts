import { beforeEach, describe, expect, it, vi } from "vitest";

const cookieJar = vi.hoisted(() => new Map<string, string>());

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
    expect(config.messages.home.hero.ctaEnroll).toBe(
      "Comienza tu Inscripción",
    );
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
