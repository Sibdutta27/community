import { describe, expect, it } from "vitest";

import {
  enrollmentStepOneGenderOptions,
  enrollmentStepOneIdentityOptions,
  enrollmentStepOneMaritalStatusOptions,
  enrollmentStepOneSexOptions,
  enrollmentStepOneSchema,
  getEnrollmentStepOneDefaultValues,
  mapEnrollmentStepOneFormToDraftPayload,
  mapEnrollmentStepOneFormToPayload,
  type EnrollmentStepOneFormValues,
} from "@/features/enrollment/lib/enrollment-step-one-form";

function buildValidFormValues(): EnrollmentStepOneFormValues {
  return {
    firstName: "Ana",
    lastName: "Rivera",
    dateOfBirth: "1990-05-12",
    cityOfBirth: "San Juan",
    municipalityOfBirth: "San Juan",
    countryOfBirth: "Puerto Rico",
    sex: "FEMALE",
    gender: "FEMALE",
    maritalStatus: "DOMESTIC_PARTNERSHIP",
    occupation: "Teacher",
    identity: "TAINO",
    yucayeke: "Jatibonicu",
    yucayekeUnknown: false,
    hasChildren: "YES",
    hasMinorChildren: "YES",
  };
}

describe("enrollmentStepOneSchema (flat demographics contract)", () => {
  it("exposes the four uppercase sex options", () => {
    expect(enrollmentStepOneSexOptions.map((option) => option.value)).toEqual([
      "MALE",
      "FEMALE",
      "INTERSEX",
      "PREFER_NOT_TO_SAY",
    ]);
  });

  it("exposes the seven uppercase gender options", () => {
    expect(
      enrollmentStepOneGenderOptions.map((option) => option.value),
    ).toEqual([
      "MALE",
      "FEMALE",
      "NON_BINARY",
      "TWO_SPIRIT",
      "SELF_DESCRIBE",
      "PREFER_NOT_TO_SAY",
      "OTHER",
    ]);
  });

  it("includes DOMESTIC_PARTNERSHIP in the marital-status options", () => {
    expect(
      enrollmentStepOneMaritalStatusOptions.some(
        (option) => option.value === "DOMESTIC_PARTNERSHIP",
      ),
    ).toBe(true);
  });

  it("exposes the four identity options", () => {
    expect(enrollmentStepOneIdentityOptions.map((o) => o.value)).toEqual([
      "ARAWAK",
      "KALINAGO",
      "GARIFUNA",
      "TAINO",
    ]);
  });

  it("accepts a fully filled demographics form", () => {
    const result = enrollmentStepOneSchema.safeParse(buildValidFormValues());

    expect(result.success).toBe(true);
  });

  it("accepts a form with every optional field left empty", () => {
    const result = enrollmentStepOneSchema.safeParse({
      ...buildValidFormValues(),
      sex: "",
      gender: "",
      maritalStatus: "",
      occupation: "",
      identity: "",
      yucayeke: "",
      yucayekeUnknown: false,
      hasChildren: "",
      hasMinorChildren: "",
    });

    expect(result.success).toBe(true);
  });

  it("rejects when a required birth field is missing", () => {
    const values = buildValidFormValues();

    expect(
      enrollmentStepOneSchema.safeParse({ ...values, firstName: "" }).success,
    ).toBe(false);
    expect(
      enrollmentStepOneSchema.safeParse({ ...values, lastName: "" }).success,
    ).toBe(false);
    expect(
      enrollmentStepOneSchema.safeParse({ ...values, dateOfBirth: "" })
        .success,
    ).toBe(false);
    expect(
      enrollmentStepOneSchema.safeParse({ ...values, cityOfBirth: "" })
        .success,
    ).toBe(false);
    expect(
      enrollmentStepOneSchema.safeParse({ ...values, municipalityOfBirth: "" })
        .success,
    ).toBe(false);
    expect(
      enrollmentStepOneSchema.safeParse({ ...values, countryOfBirth: "" })
        .success,
    ).toBe(false);
  });

  it("rejects invalid enum selections", () => {
    const values = buildValidFormValues();

    expect(
      enrollmentStepOneSchema.safeParse({ ...values, sex: "UNKNOWN" }).success,
    ).toBe(false);
    expect(
      enrollmentStepOneSchema.safeParse({ ...values, identity: "MAYAN" })
        .success,
    ).toBe(false);
  });
});

describe("getEnrollmentStepOneDefaultValues (flat prefill)", () => {
  it("hydrates the flat backend prefill into form values", () => {
    const defaults = getEnrollmentStepOneDefaultValues({
      firstName: "Ana",
      lastName: "Rivera",
      dateOfBirth: "1990-05-12T00:00:00.000Z",
      cityOfBirth: "San Juan",
      municipalityOfBirth: "San Juan",
      countryOfBirth: "Puerto Rico",
      sex: "FEMALE",
      gender: "TWO_SPIRIT",
      maritalStatus: "SINGLE",
      occupation: "Teacher",
      identity: "KALINAGO",
      yucayeke: "Guaynabo",
      yucayekeUnknown: false,
      hasChildren: true,
      hasMinorChildren: false,
    });

    expect(defaults).toEqual({
      firstName: "Ana",
      lastName: "Rivera",
      dateOfBirth: "1990-05-12",
      cityOfBirth: "San Juan",
      municipalityOfBirth: "San Juan",
      countryOfBirth: "Puerto Rico",
      sex: "FEMALE",
      gender: "TWO_SPIRIT",
      maritalStatus: "SINGLE",
      occupation: "Teacher",
      identity: "KALINAGO",
      yucayeke: "Guaynabo",
      yucayekeUnknown: false,
      hasChildren: "YES",
      hasMinorChildren: "NO",
    });
  });

  it("falls back to empty values when there is no prefill", () => {
    const defaults = getEnrollmentStepOneDefaultValues();

    expect(defaults).toEqual({
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      cityOfBirth: "",
      municipalityOfBirth: "",
      countryOfBirth: "",
      sex: "",
      gender: "",
      maritalStatus: "",
      occupation: "",
      identity: "",
      yucayeke: "",
      yucayekeUnknown: false,
      hasChildren: "",
      hasMinorChildren: "",
    });
  });
});

describe("mapEnrollmentStepOneFormToPayload (flat backend contract)", () => {
  it("maps to the flat step1 upsert body", () => {
    const payload = mapEnrollmentStepOneFormToPayload(buildValidFormValues());

    expect(payload).toEqual({
      firstName: "Ana",
      lastName: "Rivera",
      dateOfBirth: "1990-05-12T00:00:00.000Z",
      cityOfBirth: "San Juan",
      municipalityOfBirth: "San Juan",
      countryOfBirth: "Puerto Rico",
      sex: "FEMALE",
      gender: "FEMALE",
      maritalStatus: "DOMESTIC_PARTNERSHIP",
      occupation: "Teacher",
      identity: "TAINO",
      yucayeke: "Jatibonicu",
      yucayekeUnknown: false,
      hasChildren: true,
      hasMinorChildren: true,
    });
  });

  it("omits optional fields that were left empty", () => {
    const payload = mapEnrollmentStepOneFormToPayload({
      ...buildValidFormValues(),
      sex: "",
      gender: "",
      maritalStatus: "",
      occupation: "",
      identity: "",
      yucayeke: "",
      yucayekeUnknown: false,
      hasChildren: "",
      hasMinorChildren: "",
    });

    expect(payload.sex).toBeUndefined();
    expect(payload.gender).toBeUndefined();
    expect(payload.maritalStatus).toBeUndefined();
    expect(payload.occupation).toBeUndefined();
    expect(payload.identity).toBeUndefined();
    expect(payload.yucayeke).toBeUndefined();
    expect(payload.hasChildren).toBeUndefined();
    expect(payload.hasMinorChildren).toBeUndefined();
  });

  it("drops the yucayeke string when the user does not know it", () => {
    const payload = mapEnrollmentStepOneFormToPayload({
      ...buildValidFormValues(),
      yucayeke: "should be dropped",
      yucayekeUnknown: true,
    });

    expect(payload.yucayeke).toBeUndefined();
    expect(payload.yucayekeUnknown).toBe(true);
  });

  it("explicitly clears hasMinorChildren when the user has no children", () => {
    const payload = mapEnrollmentStepOneFormToPayload({
      ...buildValidFormValues(),
      hasChildren: "NO",
      hasMinorChildren: "YES",
    });

    expect(payload.hasChildren).toBe(false);
    // Flipping YES -> NO must overwrite a previously saved value, so the
    // payload sends an explicit false instead of omitting the field.
    expect(payload.hasMinorChildren).toBe(false);
  });

  it("omits hasMinorChildren when the children question is unanswered", () => {
    const payload = mapEnrollmentStepOneFormToPayload({
      ...buildValidFormValues(),
      hasChildren: "",
      hasMinorChildren: "YES",
    });

    expect(payload.hasChildren).toBeUndefined();
    expect(payload.hasMinorChildren).toBeUndefined();
  });

  it("does not include any of the removed nested sections", () => {
    const payload = mapEnrollmentStepOneFormToPayload(
      buildValidFormValues(),
    ) as Record<string, unknown>;

    for (const removedKey of [
      "legalName",
      "birthInfo",
      "contact",
      "currentAddress",
      "mailingAddress",
      "emergencyContact",
      "additionalInfo",
      "yucayekeInfo",
    ]) {
      expect(payload[removedKey]).toBeUndefined();
    }
  });
});

describe("mapEnrollmentStepOneFormToDraftPayload — partial draft (omit empty)", () => {
  it("omits empty required fields instead of failing", () => {
    const values = {
      ...buildValidFormValues(),
      firstName: "Ana",
      lastName: "",
      dateOfBirth: "",
      cityOfBirth: "   ",
      municipalityOfBirth: "",
      countryOfBirth: "",
      sex: "",
      gender: "",
      maritalStatus: "",
      occupation: "",
      identity: "",
      yucayeke: "",
      yucayekeUnknown: false,
      hasChildren: "",
      hasMinorChildren: "",
    } as EnrollmentStepOneFormValues;

    const payload = mapEnrollmentStepOneFormToDraftPayload(values);

    expect(payload).toEqual({ firstName: "Ana", yucayekeUnknown: false });
  });

  it("keeps every provided field, mapped like the full payload", () => {
    const payload = mapEnrollmentStepOneFormToDraftPayload(
      buildValidFormValues(),
    );

    expect(payload).toEqual(mapEnrollmentStepOneFormToPayload(buildValidFormValues()));
  });
});
