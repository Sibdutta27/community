import { env } from "@/config/env";

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
 * Last payload this process saw. A belt-and-braces layer under Next's Data
 * Cache: if the cache is cold AND the API is down, a warm process still serves
 * the content it had rather than dropping every override at once.
 */
let lastGoodOverrides: ContentOverrideMap = {};

/**
 * Published site content from the Website Studio.
 *
 * Never throws. Every failure path returns the best content available, and the
 * worst case is `{}` — which renders the catalog exactly as shipped, i.e. the
 * site as it behaves with no CMS at all. That is the whole safety argument for
 * storing overrides instead of moving the catalog into the database.
 *
 * Uses native `fetch`, NOT the axios client in `services/http/client.ts`:
 * axios bypasses Next's Data Cache entirely, which would turn this into a real
 * API round-trip on every single render.
 */
export async function getContentOverrides(): Promise<ContentOverrideMap> {
  try {
    const response = await fetch(`${env.apiBaseUrl}/content/messages`, {
      next: {
        revalidate: CONTENT_REVALIDATE_SECONDS,
        tags: [CONTENT_CACHE_TAG],
      },
      signal: AbortSignal.timeout(CONTENT_TIMEOUT_MS),
    });

    if (!response.ok) {
      return lastGoodOverrides;
    }

    const payload: unknown = await response.json();

    const overrides =
      typeof payload === "object" &&
      payload !== null &&
      "overrides" in payload &&
      typeof (payload as { overrides: unknown }).overrides === "object" &&
      (payload as { overrides: unknown }).overrides !== null
        ? ((payload as { overrides: ContentOverrideMap }).overrides ?? {})
        : {};

    lastGoodOverrides = overrides;

    return overrides;
  } catch {
    // Timeout, network failure, malformed JSON — all the same answer. The
    // catalog is always a valid site.
    return lastGoodOverrides;
  }
}

/** Test seam — resets the in-process snapshot between cases. */
export function __resetContentOverrideCache() {
  lastGoodOverrides = {};
}
