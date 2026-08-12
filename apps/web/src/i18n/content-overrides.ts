import { env } from "@/config/env";

import type { ContentMediaMap } from "@/content/media-slots";
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

/**
 * Everything the Website Studio publishes: edited copy, plus which image each
 * site slot is showing.
 */
export type SiteContent = Readonly<{
  overrides: ContentOverrideMap;
  media: ContentMediaMap;
}>;

const EMPTY_SITE_CONTENT: SiteContent = { overrides: {}, media: {} };

/**
 * Last payload this process saw. A belt-and-braces layer under Next's Data
 * Cache: if the cache is cold AND the API is down, a warm process still serves
 * the content it had rather than dropping every override at once.
 */
let lastGoodContent: SiteContent = EMPTY_SITE_CONTENT;

/**
 * Published site content from the Website Studio.
 *
 * Never throws. Every failure path returns the best content available, and the
 * worst case is empty — which renders the catalog and the images exactly as
 * they shipped, i.e. the site as it behaves with no CMS at all. That is the
 * whole safety argument for storing overrides instead of moving the catalog
 * into the database.
 *
 * Copy and images travel together because the site blocks on this fetch once
 * per render; a second round-trip for the images would put a second network
 * hop on the critical path of every page.
 *
 * Uses native `fetch`, NOT the axios client in `services/http/client.ts`:
 * axios bypasses Next's Data Cache entirely, which would turn this into a real
 * API round-trip on every single render.
 */
export async function getSiteContent(): Promise<SiteContent> {
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
      media: readRecord<ContentMediaMap>(payload, "media"),
    };

    lastGoodContent = content;

    return content;
  } catch {
    // Timeout, network failure, malformed JSON — all the same answer. The
    // catalog is always a valid site.
    return lastGoodContent;
  }
}

/**
 * One object field of the payload, or `{}` for anything that is not an object.
 *
 * `media` is absent from older API deployments, so a missing field has to be
 * "nothing published" rather than a reason to discard the copy alongside it.
 */
function readRecord<T>(payload: unknown, field: string): T {
  if (typeof payload !== "object" || payload === null) {
    return {} as T;
  }

  const value = (payload as Record<string, unknown>)[field];

  if (typeof value !== "object" || value === null) {
    return {} as T;
  }

  return value as T;
}

/** Test seam — resets the in-process snapshot between cases. */
export function __resetContentOverrideCache() {
  lastGoodContent = EMPTY_SITE_CONTENT;
}
