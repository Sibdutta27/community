"use server";

import { cookies } from "next/headers";

import { isLocale, LOCALE_COOKIE_NAME, type Locale } from "@/i18n/config";

const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

/**
 * Persists the member's language choice in the `community_locale` cookie.
 * Callers refresh the router afterwards so server components re-render in
 * the new locale — the URL never changes.
 */
export async function setUserLocale(locale: Locale): Promise<void> {
  if (!isLocale(locale)) {
    throw new Error(`Unsupported locale: ${String(locale)}`);
  }

  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE_NAME, locale, {
    path: "/",
    maxAge: ONE_YEAR_IN_SECONDS,
    sameSite: "lax",
  });
}
