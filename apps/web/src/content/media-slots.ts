/**
 * The site's swappable images.
 *
 * This registry does two jobs at once, and that is the point:
 *
 * 1. **Allowlist.** A slot key that is not here is not a slot. The API keeps a
 *    mirror of these keys (`apps/api/src/modules/content/config.ts`) and
 *    refuses an assignment to anything else, so a typo in the admin panel
 *    cannot write a row the site will never render.
 *
 * 2. **Shipped fallback.** The value is the image that ships in the repo. A
 *    slot with no database row — or with a row the API could not resolve to a
 *    URL, which is every slot until `S3_PUBLIC_URL` is set — renders this
 *    instead. A missing row can therefore never produce a broken image; the
 *    worst case is the site exactly as it shipped.
 *
 * Every path must exist under `apps/web/public/`. `media-slots.test.ts`
 * asserts it file by file, because a default that 404s defeats the whole
 * arrangement.
 *
 * These are content images an editor may legitimately want to replace. The
 * design-system glyphs under `public/icons/**` are deliberately NOT here: they
 * are part of the interface, they are SVG (which the media library refuses on
 * purpose), and they belong in git next to the components that use them.
 */
export const MEDIA_SLOTS = {
  "brand.logo": "/images/logo.png",
  "home.hero.portrait.1": "/images/member1.png",
  "home.hero.portrait.2": "/images/member2.png",
  "home.hero.portrait.3": "/images/member3.png",
  "home.guainiaMap": "/images/guainia-map.svg",
  "about.story": "/images/taino-nature.svg",
  "yucayeke.mapIllustration": "/images/yucayeke-map.svg",
} as const;

export type MediaSlotKey = keyof typeof MEDIA_SLOTS;

export const MEDIA_SLOT_KEYS = Object.keys(MEDIA_SLOTS) as MediaSlotKey[];

/**
 * The message namespace the resolved images are injected under.
 *
 * Reserved: the catalogs must never grow a real `media` namespace, or the
 * injection would silently replace translated copy. `media-slots.test.ts`
 * guards both catalogs against that collision.
 */
export const MEDIA_NAMESPACE = "media";

/**
 * A published slot assignment, as returned by `GET /content/messages`.
 */
export type MediaSlotAssignment = Readonly<{
  url: string;
  altEn?: string | null;
  altEs?: string | null;
}>;

export type ContentMediaMap = Readonly<
  Record<string, MediaSlotAssignment | undefined>
>;
