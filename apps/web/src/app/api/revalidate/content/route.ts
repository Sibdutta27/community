import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

import { CONTENT_CACHE_TAG } from "@/i18n/content-overrides";

/**
 * Service-to-service hook: the API calls this after a Website Studio publish
 * so the new copy is live in about a second instead of waiting out the 60s
 * revalidate window.
 *
 * This is NOT session auth — there is no user here. It is a shared secret
 * between the API and this app, so `_shared/backend-auth.ts` deliberately is
 * not involved.
 *
 * A failure here is not a failure of the publish. The content is already
 * saved; the only cost is that it appears within the revalidate window rather
 * than immediately, which is why the caller treats this as best-effort.
 */
export async function POST(request: Request) {
  const secret = process.env.CONTENT_REVALIDATE_SECRET?.trim();

  // Without a configured secret this endpoint would be an open cache-buster,
  // so it refuses to work rather than defaulting to open.
  if (!secret) {
    return NextResponse.json(
      { revalidated: false, reason: "not_configured" },
      { status: 503 },
    );
  }

  if (request.headers.get("x-content-revalidate-secret") !== secret) {
    return NextResponse.json(
      { revalidated: false, reason: "unauthorized" },
      { status: 401 },
    );
  }

  // Next 16 requires the cache profile. `updateTag` — the immediate-expiry
  // variant — throws outside a Server Action, so `revalidateTag` with "max"
  // is the supported call from a route handler.
  revalidateTag(CONTENT_CACHE_TAG, "max");

  return NextResponse.json({ revalidated: true, tag: CONTENT_CACHE_TAG });
}
