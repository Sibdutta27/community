import type { ReactElement, ReactNode } from "react";

import { render } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";

import enMessages from "../../messages/en.json";
import esMessages from "../../messages/es.json";

export const messagesByLocale = {
  en: enMessages,
  es: esMessages,
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
