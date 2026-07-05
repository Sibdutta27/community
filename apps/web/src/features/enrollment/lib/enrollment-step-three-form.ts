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
  EnrollmentStepThreePrefillResponse,
  EnrollmentStepThreeSaveDraftRequest,
  EnrollmentStepThreeUpsertRequest,
} from "@/types/enrollment";

export { enrollmentKinshipYesNoValues } from "@/features/enrollment/lib/enrollment-kinship-form";

/**
 * Step 3 — Paternal Kinship. Mirrors step 2 for the paternal line, matching
 * the backend `POST /enrollment/step3/upsert` body: father (with date of
 * birth) plus the paternal grandmother and grandfather. The per-ancestor copy
 * lives in the `enrollment.kinship.ancestors` message catalog, keyed by `key`.
 */
export const paternalKinshipDefinitions = [
  { key: "father", hasDateOfBirth: true },
  { key: "paternalGrandmother", hasDateOfBirth: false },
  { key: "paternalGrandfather", hasDateOfBirth: false },
] as const;

export function createEnrollmentStepThreeSchema(
  t: EnrollmentKinshipValidationTranslator,
) {
  return z.object({
    father: createKinshipParentSchema(t),
    paternalGrandmother: createKinshipPersonSchema(t),
    paternalGrandfather: createKinshipPersonSchema(t),
  });
}

export type EnrollmentStepThreeFormValues = z.infer<
  ReturnType<typeof createEnrollmentStepThreeSchema>
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

/** An ancestor belongs in a draft only when at least one field is provided. */
function toDraftAncestor(payload: EnrollmentAncestryInput) {
  return Object.keys(payload).length > 0 ? payload : undefined;
}

/**
 * Partial draft payload for "Save & finish later": untouched (fully empty)
 * ancestors are omitted entirely so the backend leaves their saved rows
 * alone; no required-field validation applies.
 */
export function mapEnrollmentStepThreeFormToDraftPayload(
  values: EnrollmentStepThreeFormValues,
): EnrollmentStepThreeSaveDraftRequest {
  const father = toDraftAncestor(mapKinshipParentToPayload(values.father));
  const paternalGrandmother = toDraftAncestor(
    mapKinshipPersonToPayload(values.paternalGrandmother),
  );
  const paternalGrandfather = toDraftAncestor(
    mapKinshipPersonToPayload(values.paternalGrandfather),
  );

  return {
    ...(father ? { father } : {}),
    ...(paternalGrandmother ? { paternalGrandmother } : {}),
    ...(paternalGrandfather ? { paternalGrandfather } : {}),
  };
}
