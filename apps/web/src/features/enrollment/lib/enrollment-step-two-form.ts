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
  EnrollmentAncestryInput,
  EnrollmentStepTwoPrefillResponse,
  EnrollmentStepTwoSaveDraftRequest,
  EnrollmentStepTwoUpsertRequest,
} from "@/types/enrollment";

export {
  enrollmentKinshipYesNoOptions,
  enrollmentKinshipYesNoValues,
} from "@/features/enrollment/lib/enrollment-kinship-form";

/**
 * Step 2 — Maternal Kinship. Three fixed ancestors matching the backend
 * `POST /enrollment/step2/upsert` body: mother (with date of birth) plus the
 * maternal grandmother and grandfather.
 */
export const maternalKinshipDefinitions = [
  {
    key: "mother",
    title: "Mother",
    heritageQuestion: "Is your mother of Borikua Taíno heritage?",
    description:
      "Share what you know about your mother — her name, origin, and connection to the Borikua Taíno people.",
    hasDateOfBirth: true,
  },
  {
    key: "maternalGrandmother",
    title: "Maternal Grandmother",
    heritageQuestion: "Is your maternal grandmother of Borikua Taíno heritage?",
    description:
      "Record the best available details about your mother's mother.",
    hasDateOfBirth: false,
  },
  {
    key: "maternalGrandfather",
    title: "Maternal Grandfather",
    heritageQuestion: "Is your maternal grandfather of Borikua Taíno heritage?",
    description:
      "Record the best available details about your mother's father.",
    hasDateOfBirth: false,
  },
] as const;

export const enrollmentStepTwoSchema = z.object({
  mother: kinshipParentSchema,
  maternalGrandmother: kinshipPersonSchema,
  maternalGrandfather: kinshipPersonSchema,
});

export type EnrollmentStepTwoFormValues = z.infer<
  typeof enrollmentStepTwoSchema
>;

export function getEnrollmentStepTwoDefaultValues(
  stepTwoData?: EnrollmentStepTwoPrefillResponse | null,
): EnrollmentStepTwoFormValues {
  return {
    mother: buildKinshipParentValue(stepTwoData?.mother),
    maternalGrandmother: buildKinshipPersonValue(
      stepTwoData?.maternalGrandmother,
    ),
    maternalGrandfather: buildKinshipPersonValue(
      stepTwoData?.maternalGrandfather,
    ),
  };
}

export function mapEnrollmentStepTwoFormToPayload(
  values: EnrollmentStepTwoFormValues,
): EnrollmentStepTwoUpsertRequest {
  return {
    mother: mapKinshipParentToPayload(values.mother),
    maternalGrandmother: mapKinshipPersonToPayload(values.maternalGrandmother),
    maternalGrandfather: mapKinshipPersonToPayload(values.maternalGrandfather),
  };
}

/** An ancestor belongs in a draft only when at least one field is provided. */
function toDraftAncestor(payload: EnrollmentAncestryInput) {
  return Object.keys(payload).length > 0 ? payload : undefined;
}

/**
 * Partial draft payload for "Save & finish later": untouched (fully empty)
 * ancestors are omitted entirely so the backend leaves their saved rows
 * alone; no required-field validation applies.
 */
export function mapEnrollmentStepTwoFormToDraftPayload(
  values: EnrollmentStepTwoFormValues,
): EnrollmentStepTwoSaveDraftRequest {
  const mother = toDraftAncestor(mapKinshipParentToPayload(values.mother));
  const maternalGrandmother = toDraftAncestor(
    mapKinshipPersonToPayload(values.maternalGrandmother),
  );
  const maternalGrandfather = toDraftAncestor(
    mapKinshipPersonToPayload(values.maternalGrandfather),
  );

  return {
    ...(mother ? { mother } : {}),
    ...(maternalGrandmother ? { maternalGrandmother } : {}),
    ...(maternalGrandfather ? { maternalGrandfather } : {}),
  };
}
