import type { MediaSlotKey } from "@/content/media-slots";
import type { Locale } from "@/i18n/config";

import type enMessages from "../../messages/en.json";

/**
 * The `media` namespace, shaped from the slot registry rather than written out
 * by hand — `"home.hero.portrait.1"` becomes
 * `media.home.hero.portrait["1"]`, which is how `t()` resolves a dotted key.
 *
 * Deriving it means adding a slot to `MEDIA_SLOTS` immediately makes
 * `t("media.<newSlot>")` type-check, and removing one immediately makes every
 * call site that still used it a compile error.
 */
type SlotHead<Key extends string> = Key extends `${infer Head}.${string}`
  ? Head
  : Key;

type SlotTail<
  Key extends string,
  Head extends string,
> = Key extends `${Head}.${infer Rest}` ? Rest : never;

type MediaTree<Key extends string> = {
  [Head in SlotHead<Key>]: [SlotTail<Key, Head>] extends [never]
    ? string
    : MediaTree<SlotTail<Key, Head>>;
};

/**
 * Type-safe next-intl setup: `en.json` is the source-of-truth catalog, so
 * `useTranslations`/`getTranslations` keys are checked at compile time and
 * the `es.json` mirror is enforced by `src/i18n/messages.test.ts`.
 *
 * `media` is not in the catalog — it is injected per request by
 * `src/i18n/request.ts` from the git registry plus whatever the Website Studio
 * has assigned. It is declared here so call sites get the same key checking as
 * translated copy. `src/content/media-slots.test.ts` guards the other
 * direction: the catalogs must never grow a real `media` namespace, or the
 * injection would silently replace translated copy.
 */
declare module "next-intl" {
  interface AppConfig {
    Locale: Locale;
    Messages: typeof enMessages & { media: MediaTree<MediaSlotKey> };
  }
}
