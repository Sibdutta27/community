import { describe, expect, it } from "vitest";

import {
  buildEnrollmentStepFourDocumentMap,
  enrollmentStepFourEvidenceUploadSlots,
  enrollmentStepFourUserPhotoCard,
} from "@/features/enrollment/lib/enrollment-step-four-form";
import type { EnrollmentDocumentRecord } from "@/types/enrollment";

function buildDocument(
  overrides: Partial<EnrollmentDocumentRecord> = {},
): EnrollmentDocumentRecord {
  return {
    id: "doc-1",
    type: "USER_PHOTO",
    status: "PENDING",
    fileName: "photo.jpg",
    fileKey: "user_photo/photo.jpg",
    fileSize: 1024,
    url: "https://example.com/photo.jpg",
    verifiedByAdmin: false,
    rejectedReason: null,
    uploadedAt: "2026-06-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("enrollment step 4 upload slots", () => {
  it("keeps the user photo as the single required upload", () => {
    expect(enrollmentStepFourUserPhotoCard.documentType).toBe("USER_PHOTO");
    expect(enrollmentStepFourUserPhotoCard.required).toBe(true);
  });

  it("exposes the four multi-file evidence slots from the backend contract", () => {
    expect(
      enrollmentStepFourEvidenceUploadSlots.map((slot) => slot.documentType),
    ).toEqual([
      "GENEALOGICAL_RECORDS",
      "KINSHIP_LETTERS",
      "ORAL_HISTORY",
      "DNA_TESTING",
    ]);
  });

  it("no longer exposes the retired FAMILY_* slots", () => {
    const documentTypes = new Set<string>(
      enrollmentStepFourEvidenceUploadSlots.map((slot) => slot.documentType),
    );

    expect(documentTypes.has("FAMILY_RECORD")).toBe(false);
    expect(documentTypes.has("FAMILY_PHOTO")).toBe(false);
    expect(documentTypes.has("BIRTH_CERTIFICATE")).toBe(false);
    expect(documentTypes.has("ADDITIONAL_EVIDENCE")).toBe(false);
  });
});

describe("buildEnrollmentStepFourDocumentMap", () => {
  it("creates empty buckets for every step-4 document type", () => {
    const map = buildEnrollmentStepFourDocumentMap(null);

    expect(map.USER_PHOTO).toEqual([]);
    expect(map.GENEALOGICAL_RECORDS).toEqual([]);
    expect(map.KINSHIP_LETTERS).toEqual([]);
    expect(map.ORAL_HISTORY).toEqual([]);
    expect(map.DNA_TESTING).toEqual([]);
  });

  it("maps single (object) and multi (array) buckets from /document/list", () => {
    const userPhoto = buildDocument();
    const record = buildDocument({
      id: "doc-2",
      type: "GENEALOGICAL_RECORDS",
      fileName: "tree.pdf",
    });

    const map = buildEnrollmentStepFourDocumentMap([
      { type: "USER_PHOTO", isSingle: true, documents: userPhoto },
      { type: "GENEALOGICAL_RECORDS", isSingle: false, documents: [record] },
      { type: "KINSHIP_LETTERS", isSingle: false, documents: [] },
    ]);

    expect(map.USER_PHOTO).toEqual([userPhoto]);
    expect(map.GENEALOGICAL_RECORDS).toEqual([record]);
    expect(map.KINSHIP_LETTERS).toEqual([]);
  });
});
