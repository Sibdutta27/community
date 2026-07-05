import type { Locale } from "@/i18n/config";

import type enMessages from "../../messages/en.json";

/**
 * Type-safe next-intl setup: `en.json` is the source-of-truth catalog, so
 * `useTranslations`/`getTranslations` keys are checked at compile time and
 * the `es.json` mirror is enforced by `src/i18n/messages.test.ts`.
 */
declare module "next-intl" {
  interface AppConfig {
    Locale: Locale;
    Messages: typeof enMessages;
  }
}
