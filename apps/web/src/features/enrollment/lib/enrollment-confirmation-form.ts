import { z } from "zod";

import type { EnrollmentCompleteRequest } from "@/types/enrollment";

/**
 * Message keys under the `enrollment.validation` catalog namespace used by
 * the confirmation schema. Components hand `createEnrollmentConfirmationSchema`
 * a translator for that namespace so the Zod errors render in the member's
 * locale.
 */
export type EnrollmentConfirmationValidationKey =
  | "signatureNameRequired"
  | "signatureDateRequired"
  | "agreeToSubmitRequired"
  | "agreeToTermsRequired";

export type EnrollmentConfirmationValidationTranslator = (
  key: EnrollmentConfirmationValidationKey,
) => string;

export function createEnrollmentConfirmationSchema(
  t: EnrollmentConfirmationValidationTranslator,
) {
  return z.object({
    signatureName: z.string().trim().min(1, t("signatureNameRequired")),
    signatureDate: z.string().min(1, t("signatureDateRequired")),
    agreeToSubmit: z.boolean().refine((value) => value === true, {
      message: t("agreeToSubmitRequired"),
    }),
    agreeToTerms: z.boolean().refine((value) => value === true, {
      message: t("agreeToTermsRequired"),
    }),
  });
}

export type EnrollmentConfirmationFormValues = z.infer<
  ReturnType<typeof createEnrollmentConfirmationSchema>
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
