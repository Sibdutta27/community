import { describe, expect, it } from "vitest";

import {
  enrollmentStepOneIdentityOptions,
  enrollmentStepOneMaritalStatusOptions,
  enrollmentStepOneSchema,
  getEnrollmentStepOneDefaultValues,
  mapEnrollmentStepOneFormToPayload,
  type EnrollmentStepOneFormValues,
} from "@/features/enrollment/lib/enrollment-step-one-form";

function buildValidFormValues(): EnrollmentStepOneFormValues {
  return {
    legalName: {
      firstName: "Ana",
      middleName: "",
      lastName: "Rivera",
      maternalLastName: "",
      preferredName: "",
    },
    birthInfo: {
      dateOfBirth: "1990-05-12",
      cityOfBirth: "San Juan",
      municipalityOfBirth: "San Juan",
      countryOfBirth: "Puerto Rico",
    },
    gender: {
      gender: "FEMALE",
      pronouns: "",
    },
    contact: {
      email: "ana@example.com",
      phoneNumber: "+1 787 555 1234",
      phoneType: "MOBILE",
      allowSMS: true,
    },
    currentAddress: {
      street: "1 Calle Luna",
      city: "San Juan",
      state: "PR",
      zipCode: "00901",
      country: "Puerto Rico",
    },
    mailingAddress: {
      street: "1 Calle Luna",
      city: "San Juan",
      state: "PR",
      zipCode: "00901",
      country: "Puerto Rico",
    },
    sameAsCurrentAddress: true,
    emergencyContact: {
      fullName: "Luis Rivera",
      relationship: "Brother",
      phoneNumber: "+1 787 555 5678",
    },
    additionalInfo: {
      maritalStatus: "DOMESTIC_PARTNERSHIP",
      occupation: "",
      educationLevel: "",
      languagesSpokenInput: "",
      specialSkills: "",
    },
    yucayekeInfo: {
      identity: "TAINO",
      yucayeke: "Jatibonicu",
      yucayekeUnknown: false,
      hasChildren: "YES",
      hasMinorChildren: "YES",
    },
  };
}

describe("enrollmentStepOneSchema (new step-1 fields)", () => {
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

  it("accepts a form with identity, yucayeke, children and domestic partnership", () => {
    const result = enrollmentStepOneSchema.safeParse(buildValidFormValues());

    expect(result.success).toBe(true);
  });

  it("accepts the 'I don't know my Yucayeke' path (empty yucayeke + checkbox)", () => {
    const values = buildValidFormValues();
    const result = enrollmentStepOneSchema.safeParse({
      ...values,
      yucayekeInfo: {
        identity: "",
        yucayeke: "",
        yucayekeUnknown: true,
        hasChildren: "NO",
        hasMinorChildren: "",
      },
    });

    expect(result.success).toBe(true);
  });

  it("rejects an invalid identity value", () => {
    const values = buildValidFormValues();
    const result = enrollmentStepOneSchema.safeParse({
      ...values,
      yucayekeInfo: { ...values.yucayekeInfo, identity: "MAYAN" },
    });

    expect(result.success).toBe(false);
  });
});

describe("getEnrollmentStepOneDefaultValues (yucayeke prefill)", () => {
  it("hydrates booleans back into Yes/No radio strings", () => {
    const defaults = getEnrollmentStepOneDefaultValues({
      yucayekeInfo: {
        identity: "KALINAGO",
        yucayeke: "Guaynabo",
        yucayekeUnknown: false,
        hasChildren: true,
        hasMinorChildren: false,
      },
    });

    expect(defaults.yucayekeInfo).toEqual({
      identity: "KALINAGO",
      yucayeke: "Guaynabo",
      yucayekeUnknown: false,
      hasChildren: "YES",
      hasMinorChildren: "NO",
    });
  });

  it("falls back to empty selections when no prefill is present", () => {
    const defaults = getEnrollmentStepOneDefaultValues();

    expect(defaults.yucayekeInfo).toEqual({
      identity: "",
      yucayeke: "",
      yucayekeUnknown: false,
      hasChildren: "",
      hasMinorChildren: "",
    });
  });
});

describe("mapEnrollmentStepOneFormToPayload (yucayeke contract)", () => {
  it("maps identity, yucayeke, marital status and children booleans", () => {
    const payload = mapEnrollmentStepOneFormToPayload(buildValidFormValues());

    expect(payload.additionalInfo.maritalStatus).toBe("DOMESTIC_PARTNERSHIP");
    expect(payload.yucayekeInfo).toEqual({
      identity: "TAINO",
      yucayeke: "Jatibonicu",
      yucayekeUnknown: false,
      hasChildren: true,
      hasMinorChildren: true,
    });
  });

  it("drops the yucayeke string and minor-children flag when appropriate", () => {
    const values = buildValidFormValues();
    const payload = mapEnrollmentStepOneFormToPayload({
      ...values,
      yucayekeInfo: {
        identity: "",
        yucayeke: "should be dropped",
        yucayekeUnknown: true,
        hasChildren: "NO",
        hasMinorChildren: "YES",
      },
    });

    expect(payload.yucayekeInfo.yucayeke).toBeUndefined();
    expect(payload.yucayekeInfo.identity).toBeUndefined();
    expect(payload.yucayekeInfo.yucayekeUnknown).toBe(true);
    expect(payload.yucayekeInfo.hasChildren).toBe(false);
    // hasMinorChildren is only sent when hasChildren is Yes.
    expect(payload.yucayekeInfo.hasMinorChildren).toBeUndefined();
  });
});
