import { z } from "zod";

import type { EnrollmentCompleteRequest } from "@/types/enrollment";

export const enrollmentConfirmationSchema = z.object({
  signatureName: z
    .string()
    .trim()
    .min(1, "Please sign with your full legal name."),
  signatureDate: z.string().min(1, "Please provide the signature date."),
  agreeToSubmit: z
    .boolean()
    .refine((value) => value === true, {
      message: "You must agree to submit your information.",
    }),
  agreeToTerms: z
    .boolean()
    .refine((value) => value === true, {
      message: "You must agree to the terms of service.",
    }),
});

export type EnrollmentConfirmationFormValues = z.infer<
  typeof enrollmentConfirmationSchema
>;

/**
 * Today's date as YYYY-MM-DD in the user's LOCAL timezone. Deliberately not
 * `toISOString()` (UTC), which would prefill tomorrow's date for users west
 * of UTC in the evening.
 */
function todayIsoDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getEnrollmentConfirmationDefaultValues(): EnrollmentConfirmationFormValues {
  return {
    signatureName: "",
    signatureDate: todayIsoDate(),
    agreeToSubmit: false,
    agreeToTerms: false,
  };
}

export function mapEnrollmentConfirmationFormToPayload(
  values: EnrollmentConfirmationFormValues,
): EnrollmentCompleteRequest {
  return {
    // Already trimmed at the schema boundary (z.string().trim()); zodResolver
    // hands the parsed values to submit handlers, so don't re-trim here.
    signatureName: values.signatureName,
    signatureDate: values.signatureDate,
    // Both checkboxes gate submission (the schema refines each to true); the
    // persisted record is the single terms-of-service attestation, so it maps
    // from the terms checkbox alone.
    agreedToTerms: values.agreeToTerms,
  };
}
