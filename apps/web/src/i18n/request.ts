import { cookies } from "next/headers";

import { getRequestConfig } from "next-intl/server";

import { LOCALE_COOKIE_NAME, resolveLocale } from "@/i18n/config";
import { getSiteContent } from "@/i18n/content-overrides";
import { mergeMessages, withMediaNamespace } from "@/i18n/merge-messages";

/**
 * next-intl request config (wired via `createNextIntlPlugin` in
 * `next.config.ts`). Locale comes from the `community_locale` cookie —
 * NOT from the URL — and falls back to English for missing/unknown values.
 *
 * Copy edited in the admin panel's Website Studio is layered on top of the
 * shipped catalog here. The catalog stays the source of truth: if the API is
 * unreachable the merge receives `{}` and the site renders exactly as it does
 * with no CMS at all.
 *
 * Site images are resolved the same way and injected as a reserved `media`
 * namespace, so `t("media.brand.logo")` works in server and client components
 * alike without a second fetch or a second provider.
 */
export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const locale = resolveLocale(cookieStore.get(LOCALE_COOKIE_NAME)?.value);

  const [defaults, content] = await Promise.all([
    import(`../../messages/${locale}.json`).then((module) => module.default),
    getSiteContent(),
  ]);

  return {
    locale,
    messages: withMediaNamespace(
      mergeMessages(defaults, content.overrides, locale),
      content.media,
    ),
  };
});
