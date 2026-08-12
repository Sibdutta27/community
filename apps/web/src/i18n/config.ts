/**
 * Cookie-based locale configuration — the app deliberately has NO `[locale]`
 * URL segment. The whole tree renders in the locale stored in the
 * `community_locale` cookie (set by the globe language switcher), so all
 * existing routes and bookmarks keep working unchanged.
 */
export const locales = ["en", "es"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

/** Cookie that persists the member's language choice (no URL prefix). */
export const LOCALE_COOKIE_NAME = "community_locale";

/**
 * Request header carrying the language the Website Studio's preview asked for.
 *
 * The Studio embeds this site in an iframe, where `community_locale` is a
 * third-party cookie browsers will not send — so the preview passes `?lang=`
 * and middleware forwards it as this header. It is honoured only for known
 * locales, and never persisted.
 */
export const PREVIEW_LOCALE_HEADER = "x-locale";

/** Query parameter the preview uses to request a language. */
export const PREVIEW_LOCALE_PARAM = "lang";

export function isLocale(value: unknown): value is Locale {
  return (
    typeof value === "string" && (locales as readonly string[]).includes(value)
  );
}

/** Safe fallback: any missing/unknown cookie value resolves to English. */
export function resolveLocale(value: string | undefined): Locale {
  return isLocale(value) ? value : defaultLocale;
}
