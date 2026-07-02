import { describe, expect, it } from "vitest";

import {
  enrollmentStepTwoSchema,
  getEnrollmentStepTwoDefaultValues,
  mapEnrollmentStepTwoFormToPayload,
  maternalKinshipDefinitions,
  type EnrollmentStepTwoFormValues,
} from "@/features/enrollment/lib/enrollment-step-two-form";

function buildFormValues(): EnrollmentStepTwoFormValues {
  return {
    mother: {
      name: "Carmen Rivera",
      dateOfBirth: "1965-03-02",
      nationality: "Puerto Rican",
      municipality: "Ponce",
      yucayeke: "Jatibonicu",
      isBorikuaTaino: "YES",
    },
    maternalGrandmother: {
      name: "Isabel Cruz",
      nationality: "Puerto Rican",
      municipality: "Utuado",
      yucayeke: "",
      isBorikuaTaino: "NO",
    },
    maternalGrandfather: {
      name: "",
      nationality: "",
      municipality: "",
      yucayeke: "",
      isBorikuaTaino: "",
    },
  };
}

describe("maternalKinshipDefinitions", () => {
  it("covers exactly mother, maternal grandmother, and maternal grandfather", () => {
    expect(maternalKinshipDefinitions.map((person) => person.key)).toEqual([
      "mother",
      "maternalGrandmother",
      "maternalGrandfather",
    ]);
  });
});

describe("enrollmentStepTwoSchema", () => {
  it("accepts a fully filled maternal kinship form", () => {
    expect(enrollmentStepTwoSchema.safeParse(buildFormValues()).success).toBe(
      true,
    );
  });

  it("accepts an entirely empty form (all ancestry fields are optional)", () => {
    const result = enrollmentStepTwoSchema.safeParse({
      mother: {
        name: "",
        dateOfBirth: "",
        nationality: "",
        municipality: "",
        yucayeke: "",
        isBorikuaTaino: "",
      },
      maternalGrandmother: {
        name: "",
        nationality: "",
        municipality: "",
        yucayeke: "",
        isBorikuaTaino: "",
      },
      maternalGrandfather: {
        name: "",
        nationality: "",
        municipality: "",
        yucayeke: "",
        isBorikuaTaino: "",
      },
    });

    expect(result.success).toBe(true);
  });

  it("rejects an invalid mother date of birth", () => {
    const values = buildFormValues();
    const result = enrollmentStepTwoSchema.safeParse({
      ...values,
      mother: { ...values.mother, dateOfBirth: "not-a-date" },
    });

    expect(result.success).toBe(false);
  });
});

describe("getEnrollmentStepTwoDefaultValues", () => {
  it("hydrates the three ancestors from the backend prefill", () => {
    const defaults = getEnrollmentStepTwoDefaultValues({
      mother: {
        name: "Carmen Rivera",
        dateOfBirth: "1965-03-02T00:00:00.000Z",
        nationality: "Puerto Rican",
        municipality: "Ponce",
        yucayeke: "Jatibonicu",
        isBorikuaTaino: true,
      },
      maternalGrandmother: {
        name: "Isabel Cruz",
        dateOfBirth: null,
        nationality: null,
        municipality: null,
        yucayeke: null,
        isBorikuaTaino: false,
      },
      maternalGrandfather: null,
    });

    expect(defaults.mother).toEqual({
      name: "Carmen Rivera",
      dateOfBirth: "1965-03-02",
      nationality: "Puerto Rican",
      municipality: "Ponce",
      yucayeke: "Jatibonicu",
      isBorikuaTaino: "YES",
    });
    expect(defaults.maternalGrandmother).toEqual({
      name: "Isabel Cruz",
      nationality: "",
      municipality: "",
      yucayeke: "",
      isBorikuaTaino: "NO",
    });
    expect(defaults.maternalGrandfather).toEqual({
      name: "",
      nationality: "",
      municipality: "",
      yucayeke: "",
      isBorikuaTaino: "",
    });
  });

  it("falls back to empty ancestors without prefill", () => {
    const defaults = getEnrollmentStepTwoDefaultValues();

    expect(defaults.mother.name).toBe("");
    expect(defaults.mother.dateOfBirth).toBe("");
    expect(defaults.maternalGrandmother.isBorikuaTaino).toBe("");
    expect(defaults.maternalGrandfather.name).toBe("");
  });
});

describe("mapEnrollmentStepTwoFormToPayload", () => {
  it("maps the form to the { mother, maternalGrandmother, maternalGrandfather } body", () => {
    const payload = mapEnrollmentStepTwoFormToPayload(buildFormValues());

    expect(payload).toEqual({
      mother: {
        name: "Carmen Rivera",
        dateOfBirth: "1965-03-02T00:00:00.000Z",
        nationality: "Puerto Rican",
        municipality: "Ponce",
        yucayeke: "Jatibonicu",
        isBorikuaTaino: true,
      },
      maternalGrandmother: {
        name: "Isabel Cruz",
        nationality: "Puerto Rican",
        municipality: "Utuado",
        isBorikuaTaino: false,
      },
      maternalGrandfather: {},
    });
  });

  it("omits empty fields and unanswered heritage questions", () => {
    const values = buildFormValues();
    const payload = mapEnrollmentStepTwoFormToPayload({
      ...values,
      mother: {
        name: "  Carmen  ",
        dateOfBirth: "",
        nationality: "",
        municipality: "",
        yucayeke: "",
        isBorikuaTaino: "",
      },
    });

    expect(payload.mother).toEqual({ name: "Carmen" });
  });

  it("never adds a dateOfBirth to the grandparent payloads", () => {
    const payload = mapEnrollmentStepTwoFormToPayload(buildFormValues());

    expect(payload.maternalGrandmother).not.toHaveProperty("dateOfBirth");
    expect(payload.maternalGrandfather).not.toHaveProperty("dateOfBirth");
  });
});
