import { describe, expect, it } from "vitest";

import type { AuthUser } from "@/lib/auth";
import { buildIdCardData } from "@/features/profile/lib/id-card-data";
import type { ProfileResponse } from "@/types/enrollment";

const authUser: AuthUser = {
  id: "u1",
  email: "member@example.com",
  name: "Fallback Name",
  role: "USER",
  publicId: "TN-000123",
} as AuthUser;

function response(overrides: Partial<ProfileResponse>): ProfileResponse {
  return {
    user: {
      id: "u1",
      name: "Account Name",
      email: "member@example.com",
      role: "USER",
      publicId: "TN-2847-GUA",
    },
    enrollment: null,
    hasEnrollment: false,
    ...overrides,
  } as ProfileResponse;
}

describe("buildIdCardData", () => {
  it("returns approved, real data and a derived document number when approved", () => {
    const data = buildIdCardData(
      response({
        enrollmentStatus: "APPROVED",
        enrollment: {
          status: "APPROVED",
          approvalDate: "2023-01-15T00:00:00.000Z",
          personalInfo: {
            firstName: "Carmen",
            lastName: "Torres",
            dateOfBirth: "1985-03-12T00:00:00.000Z",
            yucayeke: "Guainía Region",
          },
          documents: [],
        } as unknown as ProfileResponse["enrollment"],
      }),
      authUser,
    );

    expect(data.isApproved).toBe(true);
    expect(data.fullName).toBe("Carmen Torres");
    expect(data.memberId).toBe("TN-2847-GUA");
    expect(data.yucayeke).toBe("Guainía Region");
    // Derived: TN-<approvalYear>-<5 digits from public id "TN-2847-GUA" → 02847>
    expect(data.documentNumber).toBe("TN-2023-02847");
    expect(data.dateOfBirth).toMatch(/1985/);
  });

  it("falls back to a preview (no document number) when not approved", () => {
    const data = buildIdCardData(
      response({ enrollmentStatus: "DRAFT", enrollment: null }),
      authUser,
    );

    expect(data.isApproved).toBe(false);
    expect(data.status).toBe("draft");
    expect(data.documentNumber).toBe("");
    // Name falls back to the account name when enrollment personal info is absent.
    expect(data.fullName).toBe("Account Name");
  });

  it("maps an empty/unknown status to notStarted", () => {
    const data = buildIdCardData(response({}), authUser);
    expect(data.status).toBe("notStarted");
    expect(data.isApproved).toBe(false);
  });
});
