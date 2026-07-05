import { z } from "zod";

import {
  buildKinshipParentValue,
  buildKinshipPersonValue,
  createKinshipParentSchema,
  createKinshipPersonSchema,
  mapKinshipParentToPayload,
  mapKinshipPersonToPayload,
  type EnrollmentKinshipValidationTranslator,
} from "@/features/enrollment/lib/enrollment-kinship-form";
import type {
  EnrollmentAncestryInput,
  EnrollmentStepTwoPrefillResponse,
  EnrollmentStepTwoSaveDraftRequest,
  EnrollmentStepTwoUpsertRequest,
} from "@/types/enrollment";

export { enrollmentKinshipYesNoValues } from "@/features/enrollment/lib/enrollment-kinship-form";

/**
 * Step 2 — Maternal Kinship. Three fixed ancestors matching the backend
 * `POST /enrollment/step2/upsert` body: mother (with date of birth) plus the
 * maternal grandmother and grandfather. The per-ancestor copy (title,
 * description, heritage question) lives in the `enrollment.kinship.ancestors`
 * message catalog, keyed by `key`.
 */
export const maternalKinshipDefinitions = [
  { key: "mother", hasDateOfBirth: true },
  { key: "maternalGrandmother", hasDateOfBirth: false },
  { key: "maternalGrandfather", hasDateOfBirth: false },
] as const;

export function createEnrollmentStepTwoSchema(
  t: EnrollmentKinshipValidationTranslator,
) {
  return z.object({
    mother: createKinshipParentSchema(t),
    maternalGrandmother: createKinshipPersonSchema(t),
    maternalGrandfather: createKinshipPersonSchema(t),
  });
}

export type EnrollmentStepTwoFormValues = z.infer<
  ReturnType<typeof createEnrollmentStepTwoSchema>
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
