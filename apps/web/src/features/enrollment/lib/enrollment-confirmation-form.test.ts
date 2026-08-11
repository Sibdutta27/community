import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createEnrollmentConfirmationSchema,
  getEnrollmentConfirmationDefaultValues,
  mapEnrollmentConfirmationFormToPayload,
} from "@/features/enrollment/lib/enrollment-confirmation-form";

// Pass/fail-only assertions — an identity validation translator suffices.
const enrollmentConfirmationSchema = createEnrollmentConfirmationSchema(
  (key) => key,
);

const validValues = {
  signatureName: "Anani Guarocuya",
  signatureDate: "2026-07-02",
};

describe("enrollmentConfirmationSchema", () => {
  it("accepts a signed confirmation", () => {
    const result = enrollmentConfirmationSchema.safeParse(validValues);

    expect(result.success).toBe(true);
  });

  it("requires the signature name", () => {
    const result = enrollmentConfirmationSchema.safeParse({
      ...validValues,
      signatureName: "   ",
    });

    expect(result.success).toBe(false);
  });

  it("requires the signature date", () => {
    const result = enrollmentConfirmationSchema.safeParse({
      ...validValues,
      signatureDate: "",
    });

    expect(result.success).toBe(false);
  });

  it("carries no consent field — consent is collected once, before step 1", () => {
    // The two agreement checkboxes that used to live here re-asked for the
    // `accuracy_declaration` / `data_privacy_agreement` consents already
    // accepted and timestamped at `/enrollment/start`.
    const parsed = enrollmentConfirmationSchema.parse(validValues);

    expect(Object.keys(parsed).sort()).toEqual([
      "signatureDate",
      "signatureName",
    ]);
  });
});

describe("getEnrollmentConfirmationDefaultValues", () => {
  const originalTz = process.env.TZ;

  afterEach(() => {
    vi.useRealTimers();
    process.env.TZ = originalTz;
  });

  it("starts with an empty signature and no agreement fields", () => {
    const defaults = getEnrollmentConfirmationDefaultValues();

    expect(defaults.signatureName).toBe("");
    expect(defaults.signatureDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(Object.keys(defaults).sort()).toEqual([
      "signatureDate",
      "signatureName",
    ]);
  });

  it("prefills the signer's LOCAL calendar date, not the UTC date", () => {
    // In the evening west of UTC, the UTC calendar day is already "tomorrow".
    // The prefilled signature date must match the user's local day.
    process.env.TZ = "America/Los_Angeles";
    vi.useFakeTimers();
    // 23:30 local on July 1st => 06:30 UTC on July 2nd.
    vi.setSystemTime(new Date(2026, 6, 1, 23, 30, 0));

    expect(getEnrollmentConfirmationDefaultValues().signatureDate).toBe(
      "2026-07-01",
    );
  });
});

describe("mapEnrollmentConfirmationFormToPayload", () => {
  it("sends the e-signature alone — the backend derives agreedToTerms from it", () => {
    expect(mapEnrollmentConfirmationFormToPayload(validValues)).toEqual({
      signatureName: "Anani Guarocuya",
      signatureDate: "2026-07-02",
    });
  });

  it("relies on the schema boundary to trim the signature name", () => {
    // The form values reach the mapper through zodResolver, which returns the
    // schema-parsed (trimmed) values — mirror that pipeline here.
    const parsed = enrollmentConfirmationSchema.parse({
      ...validValues,
      signatureName: "  Anani Guarocuya  ",
    });

    expect(mapEnrollmentConfirmationFormToPayload(parsed).signatureName).toBe(
      "Anani Guarocuya",
    );
  });
});
