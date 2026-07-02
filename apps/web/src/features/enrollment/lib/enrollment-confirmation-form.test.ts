import { describe, expect, it } from "vitest";

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
  it("starts with an empty signature and unchecked agreements", () => {
    const defaults = getEnrollmentConfirmationDefaultValues();

    expect(defaults.signatureName).toBe("");
    expect(defaults.agreeToSubmit).toBe(false);
    expect(defaults.agreeToTerms).toBe(false);
    expect(defaults.signatureDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("mapEnrollmentConfirmationFormToPayload", () => {
  it("maps the form values to the complete-enrollment request", () => {
    expect(
      mapEnrollmentConfirmationFormToPayload({
        ...validValues,
        signatureName: "  Anani Guarocuya  ",
      }),
    ).toEqual({
      signatureName: "Anani Guarocuya",
      signatureDate: "2026-07-02",
      agreedToTerms: true,
    });
  });
});
