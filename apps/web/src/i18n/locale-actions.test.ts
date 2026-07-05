import { beforeEach, describe, expect, it, vi } from "vitest";

const setCookie = vi.hoisted(() => vi.fn());

vi.mock("next/headers", () => ({
  cookies: async () => ({ set: setCookie }),
}));

import type { Locale } from "@/i18n/config";
import { setUserLocale } from "@/i18n/locale-actions";

describe("setUserLocale (server action)", () => {
  beforeEach(() => {
    setCookie.mockClear();
  });

  it("persists the locale in the community_locale cookie", async () => {
    await setUserLocale("es");

    expect(setCookie).toHaveBeenCalledTimes(1);
    const [name, value, options] = setCookie.mock.calls[0];
    expect(name).toBe("community_locale");
    expect(value).toBe("es");
    expect(options).toMatchObject({ path: "/", sameSite: "lax" });
    expect(options.maxAge).toBeGreaterThan(0);
  });

  it("rejects unsupported locales without touching the cookie", async () => {
    await expect(setUserLocale("fr" as Locale)).rejects.toThrow(
      /unsupported locale/i,
    );
    expect(setCookie).not.toHaveBeenCalled();
  });
});
