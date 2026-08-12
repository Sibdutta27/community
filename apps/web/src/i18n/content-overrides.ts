import { env } from "@/config/env";

import type { TerritoryOverrideMap } from "@/features/yucayeke/lib/apply-territory-override";
import type { ContentOverrideMap } from "@/i18n/merge-messages";

/**
 * Cache tag the API's publish endpoint busts, so an edit is live in about a
 * second instead of waiting out the revalidate window.
 */
export const CONTENT_CACHE_TAG = "site-content";

/** How long a fetched payload is reused before Next revalidates it. */
const CONTENT_REVALIDATE_SECONDS = 60;

/**
 * A hung API must not become a hung page. Short on purpose: this fetch sits in
 * front of every render, and rendering yesterday's copy is always better than
 * rendering nothing.
 */
const CONTENT_TIMEOUT_MS = 1500;

/** Everything the Website Studio publishes, in the one payload it ships in. */
type SiteContent = Readonly<{
  overrides: ContentOverrideMap;
  territories: TerritoryOverrideMap;
}>;

const NOTHING_PUBLISHED: SiteContent = { overrides: {}, territories: {} };

/**
 * Last payload this process saw. A belt-and-braces layer under Next's Data
 * Cache: if the cache is cold AND the API is down, a warm process still serves
 * the content it had rather than dropping every override at once.
 */
let lastGoodContent: SiteContent = NOTHING_PUBLISHED;

/**
 * Published site content from the Website Studio.
 *
 * Never throws. Every failure path returns the best content available, and the
 * worst case is empty — which renders the catalog and the territory table
 * exactly as shipped, i.e. the site as it behaves with no CMS at all. That is
 * the whole safety argument for storing overrides instead of moving the
 * catalog into the database.
 *
 * Uses native `fetch`, NOT the axios client in `services/http/client.ts`:
 * axios bypasses Next's Data Cache entirely, which would turn this into a real
 * API round-trip on every single render.
 *
 * Copy and territory overrides travel together, so the two accessors below are
 * one cached fetch, not two — Next dedupes on the URL and options.
 */
async function getSiteContent(): Promise<SiteContent> {
  try {
    const response = await fetch(`${env.apiBaseUrl}/content/messages`, {
      next: {
        revalidate: CONTENT_REVALIDATE_SECONDS,
        tags: [CONTENT_CACHE_TAG],
      },
      signal: AbortSignal.timeout(CONTENT_TIMEOUT_MS),
    });

    if (!response.ok) {
      return lastGoodContent;
    }

    const payload: unknown = await response.json();

    const content: SiteContent = {
      overrides: readRecord<ContentOverrideMap>(payload, "overrides"),
      territories: readRecord<TerritoryOverrideMap>(payload, "territories"),
    };

    lastGoodContent = content;

    return content;
  } catch {
    // Timeout, network failure, malformed JSON — all the same answer. The
    // catalog is always a valid site.
    return lastGoodContent;
  }
}

/** Published copy overrides, keyed by message path. */
export async function getContentOverrides(): Promise<ContentOverrideMap> {
  return (await getSiteContent()).overrides;
}

/**
 * Published territory overrides, keyed by slug.
 *
 * Handed to the render boundary via `TerritoryOverridesProvider` — never to
 * `buildLookup()` or `resolveTerritory`. See `apply-territory-override.ts`.
 */
export async function getTerritoryOverrides(): Promise<TerritoryOverrideMap> {
  return (await getSiteContent()).territories;
}

/** A missing or malformed field is the same as nothing published. */
function readRecord<T>(payload: unknown, field: string): T {
  if (typeof payload !== "object" || payload === null) {
    return {} as T;
  }

  const value = (payload as Record<string, unknown>)[field];

  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return {} as T;
  }

  return value as T;
}

/** Test seam — resets the in-process snapshot between cases. */
export function __resetContentOverrideCache() {
  lastGoodContent = NOTHING_PUBLISHED;
}
