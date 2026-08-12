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
