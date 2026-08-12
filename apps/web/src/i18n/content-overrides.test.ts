import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  __resetContentOverrideCache,
  CONTENT_CACHE_TAG,
  getSiteContent,
} from "@/i18n/content-overrides";

const payload = {
  version: 3,
  overrides: { "home.hero.title": { en: "Kaya!", es: "¡Kaya!" } },
  media: { "brand.logo": { url: "https://cdn.test/site-media/logo.png" } },
};

type FetchOptions = {
  next?: { revalidate?: number; tags?: string[] };
  signal?: AbortSignal;
};

function mockFetch(impl: () => Promise<unknown>) {
  // Typed rather than parameterised, so the call signature is recorded for the
  // options assertion without declaring arguments the stub never reads.
  const spy = vi.fn<(url: string, options?: FetchOptions) => Promise<unknown>>(
    () => impl(),
  );

  vi.stubGlobal("fetch", spy);

  return spy;
}

const EMPTY = { overrides: {}, media: {} };

function okResponse(body: unknown) {
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve(body),
  });
}

describe("getSiteContent", () => {
  beforeEach(() => {
    __resetContentOverrideCache();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns the published overrides", async () => {
    mockFetch(() => okResponse(payload));

    await expect(getSiteContent()).resolves.toEqual({
      overrides: payload.overrides,
      media: payload.media,
    });
  });

  // Copy and images must arrive on the same request. A second fetch would put
  // a second network hop in front of every page render for one field.
  it("reads copy and image slots from a single request", async () => {
    const spy = mockFetch(() => okResponse(payload));

    await getSiteContent();

    expect(spy).toHaveBeenCalledTimes(1);
  });

  // A regression here is invisible in behaviour but turns a cached read into a
  // real API round-trip on every single render.
  it("caches through Next's Data Cache with the bustable tag", async () => {
    const spy = mockFetch(() => okResponse(payload));

    await getSiteContent();

    const options = spy.mock.calls[0][1];

    expect(options?.next?.revalidate).toBeGreaterThan(0);
    expect(options?.next?.tags).toContain(CONTENT_CACHE_TAG);
    expect(options?.signal).toBeDefined();
  });

  it("falls back to nothing when the API errors on a cold process", async () => {
    mockFetch(() => Promise.resolve({ ok: false, status: 500 }) as never);

    await expect(getSiteContent()).resolves.toEqual(EMPTY);
  });

  it("falls back to nothing when the request throws", async () => {
    mockFetch(() => Promise.reject(new Error("ECONNREFUSED")));

    await expect(getSiteContent()).resolves.toEqual(EMPTY);
  });

  it("survives malformed JSON rather than throwing into the render", async () => {
    mockFetch(
      () =>
        Promise.resolve({
          ok: true,
          json: () => Promise.reject(new SyntaxError("Unexpected token")),
        }) as never,
    );

    await expect(getSiteContent()).resolves.toEqual(EMPTY);
  });

  it("ignores a well-formed response with no overrides field", async () => {
    mockFetch(() => okResponse({ version: 1 }));

    await expect(getSiteContent()).resolves.toEqual(EMPTY);
  });

  // `media` is newer than the endpoint. An API that has not shipped it yet
  // must still serve its copy, not be treated as a malformed response.
  it("keeps the copy when the response carries no media field", async () => {
    mockFetch(() => okResponse({ version: 1, overrides: payload.overrides }));

    await expect(getSiteContent()).resolves.toEqual({
      overrides: payload.overrides,
      media: {},
    });
  });

  // The belt-and-braces layer: once this process has seen good content, an API
  // outage must not drop every override at once.
  it("keeps serving the last good payload after the API goes down", async () => {
    mockFetch(() => okResponse(payload));
    await getSiteContent();

    mockFetch(() => Promise.reject(new Error("gone")));

    await expect(getSiteContent()).resolves.toEqual({
      overrides: payload.overrides,
      media: payload.media,
    });
  });
});
