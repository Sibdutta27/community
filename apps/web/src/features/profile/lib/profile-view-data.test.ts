import { describe, expect, it } from "vitest";

import type { AuthUser } from "@/lib/auth";
import type { ProfileResponse } from "@/types/enrollment";

import { buildProfileViewData } from "@/features/profile/lib/profile-view-data";

const authUser: AuthUser = {
  id: "user-1",
  publicId: "TN-0001-TST",
  name: "Ana Rivera",
  email: "ana@example.com",
  role: "USER",
};

function buildAccountInfo(): ProfileResponse {
  return {
    user: {
      id: "user-1",
      publicId: "TN-0001-TST",
      name: "Ana Rivera",
      email: "ana@example.com",
      role: "USER",
    },
    enrollment: {
      id: "enrollment-1",
      status: "DRAFT",
      consentAccepted: true,
      approvalDate: null,
      user: {
        id: "user-1",
        publicId: "TN-0001-TST",
        name: "Ana Rivera",
        email: "ana@example.com",
        role: "USER",
      },
      personalInfo: {
        firstName: "Ana",
        lastName: "Rivera",
        dateOfBirth: "1990-05-12T12:00:00.000Z",
        cityOfBirth: "San Juan",
        municipalityOfBirth: "San Juan",
        countryOfBirth: "Puerto Rico",
        sex: "FEMALE",
        gender: "FEMALE",
        maritalStatus: "MARRIED",
        occupation: "Teacher",
        identity: "TAINO",
        yucayeke: "Jatibonicu",
        yucayekeUnknown: false,
        hasChildren: true,
        hasMinorChildren: false,
      },
      contact: null,
      ancestry: {
        MOTHER: {
          name: "María Torres",
          dateOfBirth: "1960-04-02T12:00:00.000Z",
          nationality: "Puerto Rican",
          municipality: "Arecibo",
          yucayeke: "Jatibonicu",
          isBorikuaTaino: true,
        },
        // A fully empty row (saved with no data) must be skipped.
        MATERNAL_GRANDMOTHER: {
          name: null,
          dateOfBirth: null,
          nationality: null,
          municipality: null,
          yucayeke: null,
          isBorikuaTaino: null,
        },
        // A null ancestor must be skipped.
        MATERNAL_GRANDFATHER: null,
        FATHER: {
          name: null,
          dateOfBirth: null,
          nationality: null,
          municipality: "Ponce",
          yucayeke: null,
          isBorikuaTaino: false,
        },
        PATERNAL_GRANDMOTHER: {
          name: "Rosa Cruz",
          dateOfBirth: null,
          nationality: null,
          municipality: null,
          yucayeke: null,
          isBorikuaTaino: null,
        },
        // PATERNAL_GRANDFATHER intentionally absent from the map.
      },
      consent: [],
      documents: [],
      steps: { "1": true, "2": true, "3": false, "4": false, "5": false },
    },
    enrollmentStatus: "DRAFT",
    hasEnrollment: true,
  } as unknown as ProfileResponse;
}

describe("buildProfileViewData kinship / ancestry mapping", () => {
  it("groups recorded ancestors into maternal and paternal lines", () => {
    const viewData = buildProfileViewData({
      accountInfo: buildAccountInfo(),
      authUser,
    });

    expect(viewData.kinshipData.groups).toHaveLength(2);

    const [maternalGroup, paternalGroup] = viewData.kinshipData.groups;

    expect(maternalGroup.title).toBe("Maternal Line");
    expect(paternalGroup.title).toBe("Paternal Line");

    // Empty rows and null ancestors are skipped.
    expect(maternalGroup.ancestors).toHaveLength(1);
    expect(paternalGroup.ancestors.map((ancestor) => ancestor.relation)).toEqual(
      ["Father", "Paternal Grandmother"],
    );
  });

  it("maps the populated ancestor fields into labelled facts", () => {
    const viewData = buildProfileViewData({
      accountInfo: buildAccountInfo(),
      authUser,
    });

    const mother = viewData.kinshipData.groups[0].ancestors[0];

    expect(mother.relation).toBe("Mother");
    expect(mother.name).toBe("María Torres");
    expect(mother.facts).toEqual([
      { label: "Municipality", value: "Arecibo" },
      { label: "Yucayeke", value: "Jatibonicu" },
      { label: "Nationality", value: "Puerto Rican" },
      { label: "Date of Birth", value: "April 2, 1960" },
      { label: "Borikua Taíno", value: "Yes" },
    ]);
  });

  it("falls back to a dash for missing names and unknown Borikua Taíno answers", () => {
    const viewData = buildProfileViewData({
      accountInfo: buildAccountInfo(),
      authUser,
    });

    const [father, paternalGrandmother] =
      viewData.kinshipData.groups[1].ancestors;

    expect(father.name).toBe("—");
    expect(father.facts).toEqual([
      { label: "Municipality", value: "Ponce" },
      { label: "Borikua Taíno", value: "No" },
    ]);

    expect(paternalGrandmother.name).toBe("Rosa Cruz");
    expect(paternalGrandmother.facts).toEqual([
      { label: "Borikua Taíno", value: "—" },
    ]);
  });

  it("keeps empty groups renderable when no ancestry was recorded", () => {
    const accountInfo = buildAccountInfo();
    const viewData = buildProfileViewData({
      accountInfo: {
        ...accountInfo,
        enrollment: accountInfo.enrollment
          ? { ...accountInfo.enrollment, ancestry: {} }
          : null,
      } as ProfileResponse,
      authUser,
    });

    expect(viewData.kinshipData.groups).toHaveLength(2);

    for (const group of viewData.kinshipData.groups) {
      expect(group.ancestors).toHaveLength(0);
      expect(group.emptyMessage.length).toBeGreaterThan(0);
    }
  });

  it("counts recorded ancestors in the overview metrics", () => {
    const viewData = buildProfileViewData({
      accountInfo: buildAccountInfo(),
      authUser,
    });

    const ancestorsMetric = viewData.overviewData.metrics[3];

    expect(ancestorsMetric.label).toBe("Ancestors Recorded");
    expect(ancestorsMetric.value).toBe("3");
  });
});
