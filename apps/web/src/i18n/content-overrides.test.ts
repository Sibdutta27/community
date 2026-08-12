import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  __resetContentOverrideCache,
  CONTENT_CACHE_TAG,
  getContentMedia,
  getContentOverrides,
  getSiteContent,
  getTerritoryOverrides,
} from "@/i18n/content-overrides";

const payload = {
  version: 3,
  overrides: { "home.hero.title": { en: "Kaya!", es: "¡Kaya!" } },
  territories: { aymaco: { displayName: "Aymamón" } },
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

function okResponse(body: unknown) {
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve(body),
  });
}

describe("getContentOverrides", () => {
  beforeEach(() => {
    __resetContentOverrideCache();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns the published overrides", async () => {
    mockFetch(() => okResponse(payload));

    await expect(getContentOverrides()).resolves.toEqual(payload.overrides);
  });

  // A regression here is invisible in behaviour but turns a cached read into a
  // real API round-trip on every single render.
  it("caches through Next's Data Cache with the bustable tag", async () => {
    const spy = mockFetch(() => okResponse(payload));

    await getContentOverrides();

    const options = spy.mock.calls[0][1];

    expect(options?.next?.revalidate).toBeGreaterThan(0);
    expect(options?.next?.tags).toContain(CONTENT_CACHE_TAG);
    expect(options?.signal).toBeDefined();
  });

  it("falls back to nothing when the API errors on a cold process", async () => {
    mockFetch(() => Promise.resolve({ ok: false, status: 500 }) as never);

    await expect(getContentOverrides()).resolves.toEqual({});
  });

  it("falls back to nothing when the request throws", async () => {
    mockFetch(() => Promise.reject(new Error("ECONNREFUSED")));

    await expect(getContentOverrides()).resolves.toEqual({});
  });

  it("survives malformed JSON rather than throwing into the render", async () => {
    mockFetch(
      () =>
        Promise.resolve({
          ok: true,
          json: () => Promise.reject(new SyntaxError("Unexpected token")),
        }) as never,
    );

    await expect(getContentOverrides()).resolves.toEqual({});
  });

  it("ignores a well-formed response with no overrides field", async () => {
    mockFetch(() => okResponse({ version: 1 }));

    await expect(getContentOverrides()).resolves.toEqual({});
  });

  it("ignores an overrides field of the wrong shape", async () => {
    mockFetch(() => okResponse({ overrides: ["not", "a", "map"] }));

    await expect(getContentOverrides()).resolves.toEqual({});
  });

  // The belt-and-braces layer: once this process has seen good content, an API
  // outage must not drop every override at once.
  it("keeps serving the last good payload after the API goes down", async () => {
    mockFetch(() => okResponse(payload));
    await getContentOverrides();

    mockFetch(() => Promise.reject(new Error("gone")));

    await expect(getContentOverrides()).resolves.toEqual(payload.overrides);
  });
});

describe("getTerritoryOverrides", () => {
  beforeEach(() => {
    __resetContentOverrideCache();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns the published territory overrides", async () => {
    mockFetch(() => okResponse(payload));

    await expect(getTerritoryOverrides()).resolves.toEqual(payload.territories);
  });

  /**
   * The reason territories ride on the copy payload at all. Two fetches would
   * double the cost of the read that sits in front of every single render, to
   * deliver a few dozen names — and would let copy and territory data drift
   * apart between two cache windows.
   */
  it("shares one fetch with the copy overrides", async () => {
    const spy = mockFetch(() => okResponse(payload));

    await Promise.all([getContentOverrides(), getTerritoryOverrides()]);

    expect(spy.mock.calls.map((call) => call[0])).toEqual(
      new Array(spy.mock.calls.length).fill(spy.mock.calls[0][0]),
    );
    expect(spy.mock.calls[0][1]?.next?.tags).toContain(CONTENT_CACHE_TAG);
  });

  // Same argument as the copy overrides: the shipped territory table is always
  // a valid site, so no failure here may reach the render.
  it("falls back to nothing when the API is unreachable", async () => {
    mockFetch(() => Promise.reject(new Error("ECONNREFUSED")));

    await expect(getTerritoryOverrides()).resolves.toEqual({});
  });

  it("ignores a payload with no territories field", async () => {
    mockFetch(() => okResponse({ version: 1, overrides: {} }));

    await expect(getTerritoryOverrides()).resolves.toEqual({});
  });
});

describe("getContentMedia", () => {
  beforeEach(() => {
    __resetContentOverrideCache();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns the published image-slot assignments", async () => {
    mockFetch(() => okResponse(payload));

    await expect(getContentMedia()).resolves.toEqual(payload.media);
  });

  // Copy, territories and images ride in one payload. Splitting them into
  // separate requests would multiply the cost of a fetch that runs in front of
  // every render.
  it("shares one request with the copy and territory overrides", async () => {
    const spy = mockFetch(() => okResponse(payload));

    const content = await getSiteContent();

    expect(spy).toHaveBeenCalledTimes(1);
    expect(content.overrides).toEqual(payload.overrides);
    expect(content.territories).toEqual(payload.territories);
    expect(content.media).toEqual(payload.media);
  });

  // Each field is newer than some deployed version of the API. A response
  // missing one must not discard the parts that did arrive.
  it("keeps the copy when the response carries no media field", async () => {
    mockFetch(() => okResponse({ version: 3, overrides: payload.overrides }));

    const content = await getSiteContent();

    expect(content.overrides).toEqual(payload.overrides);
    expect(content.media).toEqual({});
  });

  it("falls back to nothing when the API is unreachable", async () => {
    mockFetch(() => Promise.reject(new Error("gone")));

    await expect(getContentMedia()).resolves.toEqual({});
  });
});
