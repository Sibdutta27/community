import { z } from "zod";

import type {
  EnrollmentStepThreeCulturalConnection,
  EnrollmentStepThreePrefillResponse,
  EnrollmentStepThreeUpsertRequest,
} from "@/types/enrollment";

const culturalConnectionKeySchema = z
  .string()
  .trim()
  .min(1, "Invalid cultural connection key");

export const enrollmentStepThreeSchema = z.object({
  culturalConnectionKeys: z.array(culturalConnectionKeySchema),
});

export type EnrollmentStepThreeFormValues = z.infer<
  typeof enrollmentStepThreeSchema
>;

function trimValue(value: string) {
  return value.trim();
}

function uniqueValues(values: readonly string[]) {
  return Array.from(new Set(values));
}

export function getEnrollmentStepThreeDefaultValues(
  stepThreeData?: EnrollmentStepThreePrefillResponse | null,
): EnrollmentStepThreeFormValues {
  const keys = uniqueValues(
    (stepThreeData?.culturalConnectionKeys ?? [])
      .map((key) => trimValue(key))
      .filter(Boolean),
  );

  return {
    culturalConnectionKeys: keys,
  };
}

export function mapEnrollmentStepThreeFormToPayload(
  values: EnrollmentStepThreeFormValues,
  availableConnections?: readonly EnrollmentStepThreeCulturalConnection[],
): EnrollmentStepThreeUpsertRequest {
  const selectedKeys = uniqueValues(
    values.culturalConnectionKeys.map(trimValue).filter(Boolean),
  );

  if (!availableConnections?.length) {
    return {
      culturalConnectionKeys: selectedKeys,
    };
  }

  const allowedKeys = new Set(
    availableConnections.map((connection) => trimValue(connection.key)),
  );

  return {
    culturalConnectionKeys: selectedKeys.filter((key) => allowedKeys.has(key)),
  };
}
