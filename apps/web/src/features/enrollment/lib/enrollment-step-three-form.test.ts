import { describe, expect, it } from "vitest";

import {
  createEnrollmentStepThreeSchema,
  getEnrollmentStepThreeDefaultValues,
  mapEnrollmentStepThreeFormToPayload,
  paternalKinshipDefinitions,
  type EnrollmentStepThreeFormValues,
} from "@/features/enrollment/lib/enrollment-step-three-form";

// Pass/fail-only assertions — an identity validation translator suffices.
const enrollmentStepThreeSchema = createEnrollmentStepThreeSchema((key) => key);

function buildFormValues(): EnrollmentStepThreeFormValues {
  return {
    father: {
      name: "Miguel Rivera",
      dateOfBirth: "1960-11-20",
      nationality: "Puerto Rican",
      municipality: "Ponce",
      yucayeke: "Jatibonicu",
      isBorikuaTaino: "YES",
    },
    paternalGrandmother: {
      name: "Rosa Diaz",
      nationality: "Puerto Rican",
      municipality: "Utuado",
      yucayeke: "",
      isBorikuaTaino: "NO",
    },
    paternalGrandfather: {
      name: "",
      nationality: "",
      municipality: "",
      yucayeke: "",
      isBorikuaTaino: "",
    },
  };
}

describe("paternalKinshipDefinitions", () => {
  it("covers exactly father, paternal grandmother, and paternal grandfather", () => {
    expect(paternalKinshipDefinitions.map((person) => person.key)).toEqual([
      "father",
      "paternalGrandmother",
      "paternalGrandfather",
    ]);
  });
});

describe("enrollmentStepThreeSchema", () => {
  it("accepts a fully filled paternal kinship form", () => {
    expect(enrollmentStepThreeSchema.safeParse(buildFormValues()).success).toBe(
      true,
    );
  });

  it("rejects an invalid father date of birth", () => {
    const values = buildFormValues();
    const result = enrollmentStepThreeSchema.safeParse({
      ...values,
      father: { ...values.father, dateOfBirth: "20-11-1960" },
    });

    expect(result.success).toBe(false);
  });
});

describe("getEnrollmentStepThreeDefaultValues", () => {
  it("hydrates the three ancestors from the backend prefill", () => {
    const defaults = getEnrollmentStepThreeDefaultValues({
      father: {
        name: "Miguel Rivera",
        dateOfBirth: "1960-11-20T00:00:00.000Z",
        nationality: "Puerto Rican",
        municipality: "Ponce",
        yucayeke: "Jatibonicu",
        isBorikuaTaino: true,
      },
      paternalGrandmother: null,
      paternalGrandfather: null,
    });

    expect(defaults.father).toEqual({
      name: "Miguel Rivera",
      dateOfBirth: "1960-11-20",
      nationality: "Puerto Rican",
      municipality: "Ponce",
      yucayeke: "Jatibonicu",
      isBorikuaTaino: "YES",
    });
    expect(defaults.paternalGrandmother.name).toBe("");
    expect(defaults.paternalGrandfather.isBorikuaTaino).toBe("");
  });
});

describe("mapEnrollmentStepThreeFormToPayload", () => {
  it("maps the form to the { father, paternalGrandmother, paternalGrandfather } body", () => {
    const payload = mapEnrollmentStepThreeFormToPayload(buildFormValues());

    expect(payload).toEqual({
      father: {
        name: "Miguel Rivera",
        dateOfBirth: "1960-11-20T00:00:00.000Z",
        nationality: "Puerto Rican",
        municipality: "Ponce",
        yucayeke: "Jatibonicu",
        isBorikuaTaino: true,
      },
      paternalGrandmother: {
        name: "Rosa Diaz",
        nationality: "Puerto Rican",
        municipality: "Utuado",
        isBorikuaTaino: false,
      },
      paternalGrandfather: {},
    });
  });

  it("does not send cultural connection keys anymore", () => {
    const payload = mapEnrollmentStepThreeFormToPayload(
      buildFormValues(),
    ) as Record<string, unknown>;

    expect(payload.culturalConnectionKeys).toBeUndefined();
  });
});
