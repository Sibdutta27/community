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

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
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
    signatureName: values.signatureName.trim(),
    signatureDate: values.signatureDate,
    agreedToTerms: values.agreeToTerms && values.agreeToSubmit,
  };
}
