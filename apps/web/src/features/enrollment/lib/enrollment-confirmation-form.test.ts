import { afterEach, describe, expect, it, vi } from "vitest";

import {
  enrollmentConfirmationSchema,
  getEnrollmentConfirmationDefaultValues,
  mapEnrollmentConfirmationFormToPayload,
} from "@/features/enrollment/lib/enrollment-confirmation-form";

const validValues = {
  signatureName: "Anani Guarocuya",
  signatureDate: "2026-07-02",
  agreeToSubmit: true,
  agreeToTerms: true,
};

describe("enrollmentConfirmationSchema", () => {
  it("accepts a fully signed confirmation", () => {
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

  it("requires agreeing to submit the information", () => {
    const result = enrollmentConfirmationSchema.safeParse({
      ...validValues,
      agreeToSubmit: false,
    });

    expect(result.success).toBe(false);
  });

  it("requires agreeing to the terms of service", () => {
    const result = enrollmentConfirmationSchema.safeParse({
      ...validValues,
      agreeToTerms: false,
    });

    expect(result.success).toBe(false);
  });
});

describe("getEnrollmentConfirmationDefaultValues", () => {
  const originalTz = process.env.TZ;

  afterEach(() => {
    vi.useRealTimers();
    process.env.TZ = originalTz;
  });

  it("starts with an empty signature and unchecked agreements", () => {
    const defaults = getEnrollmentConfirmationDefaultValues();

    expect(defaults.signatureName).toBe("");
    expect(defaults.agreeToSubmit).toBe(false);
    expect(defaults.agreeToTerms).toBe(false);
    expect(defaults.signatureDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
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
  it("maps the form values to the complete-enrollment request", () => {
    expect(mapEnrollmentConfirmationFormToPayload(validValues)).toEqual({
      signatureName: "Anani Guarocuya",
      signatureDate: "2026-07-02",
      agreedToTerms: true,
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

  it("derives agreedToTerms from the terms checkbox alone", () => {
    // Both checkboxes gate submission via the schema; the persisted
    // attestation is the terms agreement and must not depend on agreeToSubmit.
    expect(
      mapEnrollmentConfirmationFormToPayload({
        ...validValues,
        agreeToTerms: true,
        agreeToSubmit: false,
      }).agreedToTerms,
    ).toBe(true);
  });
});
