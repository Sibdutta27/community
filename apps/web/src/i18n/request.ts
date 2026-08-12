import { cookies } from "next/headers";

import { getRequestConfig } from "next-intl/server";

import { LOCALE_COOKIE_NAME, resolveLocale } from "@/i18n/config";
import { getContentOverrides } from "@/i18n/content-overrides";
import { mergeMessages } from "@/i18n/merge-messages";

/**
 * next-intl request config (wired via `createNextIntlPlugin` in
 * `next.config.ts`). Locale comes from the `community_locale` cookie —
 * NOT from the URL — and falls back to English for missing/unknown values.
 *
 * Copy edited in the admin panel's Website Studio is layered on top of the
 * shipped catalog here. The catalog stays the source of truth: if the API is
 * unreachable the merge receives `{}` and the site renders exactly as it does
 * with no CMS at all.
 */
export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const locale = resolveLocale(cookieStore.get(LOCALE_COOKIE_NAME)?.value);

  const [defaults, overrides] = await Promise.all([
    import(`../../messages/${locale}.json`).then((module) => module.default),
    getContentOverrides(),
  ]);

  return {
    locale,
    messages: mergeMessages(defaults, overrides, locale),
  };
});
