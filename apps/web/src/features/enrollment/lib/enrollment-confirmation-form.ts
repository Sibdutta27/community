import { z } from "zod";

import type { EnrollmentCompleteRequest } from "@/types/enrollment";

/**
 * Message keys under the `enrollment.validation` catalog namespace used by
 * the confirmation schema. Components hand `createEnrollmentConfirmationSchema`
 * a translator for that namespace so the Zod errors render in the member's
 * locale.
 */
export type EnrollmentConfirmationValidationKey =
  "signatureNameRequired" | "signatureDateRequired";

export type EnrollmentConfirmationValidationTranslator = (
  key: EnrollmentConfirmationValidationKey,
) => string;

/**
 * Step 5 collects the e-signature and NOTHING else. The two agreement
 * checkboxes that used to live here re-asked for consents the member already
 * accepted (and that are timestamped in `EnrollmentConsent`) at
 * `/enrollment/start` — the seeded `accuracy_declaration` and
 * `data_privacy_agreement`. The signature, given under the declaration
 * rendered above it, is now the attestation.
 */
export function createEnrollmentConfirmationSchema(
  t: EnrollmentConfirmationValidationTranslator,
) {
  return z.object({
    signatureName: z.string().trim().min(1, t("signatureNameRequired")),
    signatureDate: z.string().min(1, t("signatureDateRequired")),
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
  };
}

/**
 * Document rejection codes `POST /enrollment/complete` throws verbatim as the
 * BadRequest message, mapped to their `errors` catalog key. These are raw
 * codes, not sentences — rendering one to the member is a bug, so the
 * confirmation form translates them and links back to Step 4.
 */
const enrollmentSubmitDocumentErrorKeys = {
  missing_state_id: "missingStateId",
  missing_identity_documents: "missingIdentityDocuments",
  missing_required_documents: "missingRequiredDocuments",
} as const;

export type EnrollmentSubmitDocumentErrorKey =
  (typeof enrollmentSubmitDocumentErrorKeys)[keyof typeof enrollmentSubmitDocumentErrorKeys];

/**
 * The `errors.*` message key for a submit-time document rejection, or `null`
 * when the failure is something else (network, validation, …).
 */
export function getEnrollmentSubmitDocumentErrorKey(
  error: unknown,
): EnrollmentSubmitDocumentErrorKey | null {
  const code = error instanceof Error ? error.message.trim() : "";

  return (
    enrollmentSubmitDocumentErrorKeys[
      code as keyof typeof enrollmentSubmitDocumentErrorKeys
    ] ?? null
  );
}

export function mapEnrollmentConfirmationFormToPayload(
  values: EnrollmentConfirmationFormValues,
): EnrollmentCompleteRequest {
  return {
    // Already trimmed at the schema boundary (z.string().trim()); zodResolver
    // hands the parsed values to submit handlers, so don't re-trim here.
    signatureName: values.signatureName,
    signatureDate: values.signatureDate,
  };
}
