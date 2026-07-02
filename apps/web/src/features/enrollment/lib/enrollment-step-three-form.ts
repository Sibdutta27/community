import { z } from "zod";

import {
  buildKinshipParentValue,
  buildKinshipPersonValue,
  kinshipParentSchema,
  kinshipPersonSchema,
  mapKinshipParentToPayload,
  mapKinshipPersonToPayload,
} from "@/features/enrollment/lib/enrollment-kinship-form";
import type {
  EnrollmentStepThreePrefillResponse,
  EnrollmentStepThreeUpsertRequest,
} from "@/types/enrollment";

export {
  enrollmentKinshipYesNoOptions,
  enrollmentKinshipYesNoValues,
} from "@/features/enrollment/lib/enrollment-kinship-form";

/**
 * Step 3 — Paternal Kinship. Mirrors step 2 for the paternal line, matching
 * the backend `POST /enrollment/step3/upsert` body: father (with date of
 * birth) plus the paternal grandmother and grandfather.
 */
export const paternalKinshipDefinitions = [
  {
    key: "father",
    title: "Father",
    heritageQuestion: "Is your father of Borikua Taíno heritage?",
    description:
      "Share what you know about your father — his name, origin, and connection to the Borikua Taíno people.",
    hasDateOfBirth: true,
  },
  {
    key: "paternalGrandmother",
    title: "Paternal Grandmother",
    heritageQuestion: "Is your paternal grandmother of Borikua Taíno heritage?",
    description:
      "Record the best available details about your father's mother.",
    hasDateOfBirth: false,
  },
  {
    key: "paternalGrandfather",
    title: "Paternal Grandfather",
    heritageQuestion: "Is your paternal grandfather of Borikua Taíno heritage?",
    description:
      "Record the best available details about your father's father.",
    hasDateOfBirth: false,
  },
] as const;

export const enrollmentStepThreeSchema = z.object({
  father: kinshipParentSchema,
  paternalGrandmother: kinshipPersonSchema,
  paternalGrandfather: kinshipPersonSchema,
});

export type EnrollmentStepThreeFormValues = z.infer<
  typeof enrollmentStepThreeSchema
>;

export function getEnrollmentStepThreeDefaultValues(
  stepThreeData?: EnrollmentStepThreePrefillResponse | null,
): EnrollmentStepThreeFormValues {
  return {
    father: buildKinshipParentValue(stepThreeData?.father),
    paternalGrandmother: buildKinshipPersonValue(
      stepThreeData?.paternalGrandmother,
    ),
    paternalGrandfather: buildKinshipPersonValue(
      stepThreeData?.paternalGrandfather,
    ),
  };
}

export function mapEnrollmentStepThreeFormToPayload(
  values: EnrollmentStepThreeFormValues,
): EnrollmentStepThreeUpsertRequest {
  return {
    father: mapKinshipParentToPayload(values.father),
    paternalGrandmother: mapKinshipPersonToPayload(values.paternalGrandmother),
    paternalGrandfather: mapKinshipPersonToPayload(values.paternalGrandfather),
  };
}
