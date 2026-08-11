import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The module keeps a "redirect already in flight" latch, so every case needs a
 * fresh module instance.
 */
async function importFetcher() {
  vi.resetModules();

  return import("@/services/http/fetcher");
}

const assignMock = vi.fn();
const originalLocation = window.location;

function setLocation(pathname: string) {
  Object.defineProperty(window, "location", {
    configurable: true,
    value: { assign: assignMock, pathname, search: "" },
    writable: true,
  });
}

function respondWith(status: number, body: unknown) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(body),
    }),
  );
}

beforeEach(() => {
  assignMock.mockReset();
  setLocation("/enrollment/step-2");
});

afterEach(() => {
  vi.unstubAllGlobals();
  Object.defineProperty(window, "location", {
    configurable: true,
    value: originalLocation,
    writable: true,
  });
});

describe("requestJson — consent published mid-flow", () => {
  it("sends the member back to the one consent surface on the guard's 403", async () => {
    // `ConsentAcceptedGuard` starts 403ing every enrollment write the moment a
    // new REQUIRED consent is published. Without this the member would just see
    // a dead-end error on a save they cannot fix from where they are.
    const { requestJson } = await importFetcher();
    respondWith(403, { message: "Consent not accepted" });

    await expect(
      requestJson("/api/enrollment/step2/upsert", {
        method: "POST",
        body: {},
        fallbackMessage: "nope",
      }),
    ).rejects.toThrow("Consent not accepted");

    expect(assignMock).toHaveBeenCalledWith("/enrollment/start");
  });

  it("leaves an unrelated 403 alone", async () => {
    const { requestJson } = await importFetcher();
    respondWith(403, { message: "Enrollment not found" });

    await expect(
      requestJson("/api/enrollment/step2/upsert", {
        method: "POST",
        body: {},
        fallbackMessage: "nope",
      }),
    ).rejects.toThrow("Enrollment not found");

    expect(assignMock).not.toHaveBeenCalled();
  });

  it("does not loop when the consent screen itself gets the 403", async () => {
    setLocation("/enrollment/start");
    const { requestJson } = await importFetcher();
    respondWith(403, { message: "Consent not accepted" });

    await expect(
      requestJson("/api/consent/accept", {
        method: "POST",
        body: {},
        fallbackMessage: "nope",
      }),
    ).rejects.toThrow("Consent not accepted");

    expect(assignMock).not.toHaveBeenCalled();
  });

  it("redirects from a multipart upload too", async () => {
    const { requestMultipart } = await importFetcher();
    respondWith(403, { message: "Consent not accepted" });

    await expect(
      requestMultipart("/api/document/upload", {
        method: "POST",
        body: new FormData(),
        fallbackMessage: "nope",
      }),
    ).rejects.toThrow("Consent not accepted");

    expect(assignMock).toHaveBeenCalledWith("/enrollment/start");
  });
});
