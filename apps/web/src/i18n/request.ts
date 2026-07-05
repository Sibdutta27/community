import { cookies } from "next/headers";

import { getRequestConfig } from "next-intl/server";

import { LOCALE_COOKIE_NAME, resolveLocale } from "@/i18n/config";

/**
 * next-intl request config (wired via `createNextIntlPlugin` in
 * `next.config.ts`). Locale comes from the `community_locale` cookie —
 * NOT from the URL — and falls back to English for missing/unknown values.
 */
export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const locale = resolveLocale(cookieStore.get(LOCALE_COOKIE_NAME)?.value);

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
