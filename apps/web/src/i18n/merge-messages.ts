import {
  MEDIA_NAMESPACE,
  MEDIA_SLOT_KEYS,
  MEDIA_SLOTS,
  type ContentMediaMap,
} from "@/content/media-slots";
import type { Locale } from "@/i18n/config";

/**
 * A published override for one key path, as returned by `GET /content/messages`.
 */
export type ContentOverride = Readonly<{
  en?: string;
  es?: string;
}>;

export type ContentOverrideMap = Readonly<Record<string, ContentOverride>>;

type Messages = Record<string, unknown>;

/**
 * Layer Website Studio overrides over the shipped catalog.
 *
 * The git JSON stays authoritative for structure: an override is only applied
 * where the catalog already has a value at that path. Anything else — an
 * unknown key, a path that would create a new array entry, a value whose shape
 * differs — is dropped rather than inserted, so the DB can never invent
 * content the code does not know how to render.
 */
export function mergeMessages(
  defaults: Messages,
  overrides: ContentOverrideMap,
  locale: Locale,
): Messages {
  const paths = Object.keys(overrides);

  if (paths.length === 0) {
    return defaults;
  }

  // The imported JSON is a module singleton shared by every request in this
  // process. Mutating it once would poison every later render — including for
  // the other locale. Clone before touching anything.
  const merged = structuredClone(defaults);

  for (const keyPath of paths) {
    const value = overrides[keyPath]?.[locale];

    if (typeof value !== "string") {
      continue;
    }

    applyOverride(merged, keyPath, value);
  }

  return merged;
}

/**
 * Write one dotted path, but only over an existing string.
 */
function applyOverride(target: Messages, keyPath: string, value: string) {
  const segments = keyPath.split(".");
  const leaf = segments.pop();

  if (!leaf) {
    return;
  }

  let cursor: unknown = target;

  for (const segment of segments) {
    if (!isIndexable(cursor)) {
      return;
    }

    cursor = (cursor as Record<string, unknown>)[segment];
  }

  if (!isIndexable(cursor)) {
    return;
  }

  const container = cursor as Record<string, unknown>;

  // The guard that keeps the catalog's shape: only replace a string that is
  // already there. This rejects unknown keys, and rejects appending a new
  // entry to an array — `paragraphs.2` where the catalog has two paragraphs
  // would otherwise render a paragraph no translation exists for.
  if (typeof container[leaf] !== "string") {
    return;
  }

  container[leaf] = value;
}

function isIndexable(value: unknown): boolean {
  return typeof value === "object" && value !== null;
}

/**
 * Attach the resolved site images as a reserved `media` namespace.
 *
 * Riding on the message tree is what makes `t("media.brand.logo")` work in
 * server AND client components with no second fetch and no extra provider:
 * next-intl already carries these messages across the boundary, so an image
 * swap costs nothing that translated copy does not already cost.
 *
 * The registry drives the loop, not the payload. Every declared slot always
 * gets a value — the database row if it resolved to a URL, otherwise the image
 * that shipped in git — and a payload entry for a slot the registry does not
 * declare is dropped. So the namespace is total (no slot can be missing) and
 * closed (no slot can be invented).
 */
export function withMediaNamespace<T extends Messages>(
  messages: T,
  media: ContentMediaMap,
): T & { media: Record<string, unknown> } {
  const namespace: Record<string, unknown> = {};

  for (const slotKey of MEDIA_SLOT_KEYS) {
    const configured = media[slotKey]?.url;

    const source =
      typeof configured === "string" && configured.trim().length > 0
        ? configured
        : MEDIA_SLOTS[slotKey];

    writeNested(namespace, slotKey, source);
  }

  // A shallow copy is enough: the namespace object is freshly built here and
  // nothing below `messages` is touched, so the shared catalog singleton stays
  // exactly as imported.
  return { ...messages, [MEDIA_NAMESPACE]: namespace } as T & {
    media: Record<string, unknown>;
  };
}

/**
 * Expand `"home.hero.portrait.1"` into nested objects.
 *
 * `t("media.home.hero.portrait.1")` resolves by walking the tree one dot
 * segment at a time. A flat map keyed by the dotted string type-checks and
 * reads back fine in a test, and renders nothing on the page.
 */
function writeNested(
  target: Record<string, unknown>,
  keyPath: string,
  value: string,
) {
  const segments = keyPath.split(".");
  const leaf = segments.pop() as string;

  let cursor = target;

  for (const segment of segments) {
    if (!isIndexable(cursor[segment])) {
      cursor[segment] = {};
    }

    cursor = cursor[segment] as Record<string, unknown>;
  }

  cursor[leaf] = value;
}
