import type { ReactElement, ReactNode } from "react";

import { render } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";

import { withMediaNamespace } from "@/i18n/merge-messages";

import enMessages from "../../messages/en.json";
import esMessages from "../../messages/es.json";

/**
 * The catalogs as a render actually sees them.
 *
 * `src/i18n/request.ts` always injects the reserved `media` namespace, so a
 * harness that handed over the raw JSON would make `t("media.brand.logo")`
 * throw in tests while working in the app — the harness would be testing a
 * message tree the site never has.
 *
 * No slot assignments: that is production today, and it means every component
 * test sees the image that ships in git.
 */
export const messagesByLocale = {
  en: withMediaNamespace(enMessages, {}),
  es: withMediaNamespace(esMessages, {}),
} as const;

export type TestLocale = keyof typeof messagesByLocale;

/** Wraps a node in `NextIntlClientProvider` with the real message catalog. */
export function withIntl(ui: ReactNode, locale: TestLocale = "en") {
  return (
    <NextIntlClientProvider locale={locale} messages={messagesByLocale[locale]}>
      {ui}
    </NextIntlClientProvider>
  );
}

/** `render` with the app's intl provider — defaults to the `en` catalog. */
export function renderWithIntl(ui: ReactElement, locale: TestLocale = "en") {
  return render(withIntl(ui, locale));
}
