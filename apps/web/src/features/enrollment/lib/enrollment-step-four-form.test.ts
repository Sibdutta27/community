import { describe, expect, it } from "vitest";

import {
  buildEnrollmentStepFourDocumentMap,
  enrollmentStepFourEvidenceUploadSlots,
  enrollmentStepFourUserPhotoCard,
  getEnrollmentStepFourFileValidationMessage,
  getEnrollmentStepFourSlotPolicy,
} from "@/features/enrollment/lib/enrollment-step-four-form";
import type { EnrollmentDocumentRecord } from "@/types/enrollment";

const MB = 1024 * 1024;

function buildFile(name: string, type: string, size: number): File {
  const file = new File(["x"], name, { type });
  Object.defineProperty(file, "size", { value: size });
  return file;
}

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

describe("getEnrollmentStepFourSlotPolicy — per-slot accept + badges", () => {
  it("restricts the user photo slot to images with a 10 MB cap", () => {
    const policy = getEnrollmentStepFourSlotPolicy("USER_PHOTO");

    expect(policy.accept).toBe(".jpg,.jpeg,.png,.webp");
    expect(policy.badges).toEqual(["JPG", "PNG", "WEBP", "10 MB Max"]);
    expect(policy.maxFileSizeBytes).toBe(10 * MB);
  });

  it.each(["GENEALOGICAL_RECORDS", "KINSHIP_LETTERS", "DNA_TESTING"] as const)(
    "allows pdf + images for %s with a 10 MB cap",
    (documentType) => {
      const policy = getEnrollmentStepFourSlotPolicy(documentType);

      expect(policy.accept).toBe(".jpg,.jpeg,.png,.webp,.pdf");
      expect(policy.badges).toEqual(["PDF", "JPG", "PNG", "WEBP", "10 MB Max"]);
      expect(policy.maxFileSizeBytes).toBe(10 * MB);
    },
  );

  it("allows audio/video for the oral history slot with a 100 MB cap", () => {
    const policy = getEnrollmentStepFourSlotPolicy("ORAL_HISTORY");

    expect(policy.accept).toContain(".mp3");
    expect(policy.accept).toContain(".mp4");
    expect(policy.accept).toContain(".mov");
    expect(policy.badges).toEqual([
      "PDF",
      "JPG",
      "PNG",
      "WEBP",
      "MP3",
      "MP4",
      "MOV",
      "100 MB Max",
    ]);
    expect(policy.maxFileSizeBytes).toBe(100 * MB);
  });
});

describe("getEnrollmentStepFourFileValidationMessage — per-slot client guard", () => {
  it("accepts a small jpeg for the user photo slot", () => {
    expect(
      getEnrollmentStepFourFileValidationMessage(
        buildFile("photo.jpg", "image/jpeg", 2 * MB),
        "USER_PHOTO",
      ),
    ).toBeNull();
  });

  it("rejects a pdf for the user photo slot with a friendly message", () => {
    const message = getEnrollmentStepFourFileValidationMessage(
      buildFile("photo.pdf", "application/pdf", 1 * MB),
      "USER_PHOTO",
    );

    expect(message).toMatch(/This slot accepts/i);
    expect(message).toMatch(/10 MB/);
    expect(message).not.toMatch(/PDF/);
  });

  it("rejects an oversize file for a 10 MB slot", () => {
    expect(
      getEnrollmentStepFourFileValidationMessage(
        buildFile("tree.pdf", "application/pdf", 11 * MB),
        "GENEALOGICAL_RECORDS",
      ),
    ).toMatch(/up to 10 MB/i);
  });

  it("accepts a 60 MB mp4 for the oral history slot", () => {
    expect(
      getEnrollmentStepFourFileValidationMessage(
        buildFile("story.mp4", "video/mp4", 60 * MB),
        "ORAL_HISTORY",
      ),
    ).toBeNull();
  });

  it("accepts an mp3 for the oral history slot", () => {
    expect(
      getEnrollmentStepFourFileValidationMessage(
        buildFile("story.mp3", "audio/mpeg", 5 * MB),
        "ORAL_HISTORY",
      ),
    ).toBeNull();
  });

  it("rejects an oral history file above 100 MB", () => {
    expect(
      getEnrollmentStepFourFileValidationMessage(
        buildFile("story.mp4", "video/mp4", 101 * MB),
        "ORAL_HISTORY",
      ),
    ).toMatch(/up to 100 MB/i);
  });

  it("rejects an mp4 for a documents-only slot", () => {
    expect(
      getEnrollmentStepFourFileValidationMessage(
        buildFile("results.mp4", "video/mp4", 5 * MB),
        "DNA_TESTING",
      ),
    ).toMatch(/This slot accepts/i);
  });

  it("rejects an empty file", () => {
    expect(
      getEnrollmentStepFourFileValidationMessage(
        buildFile("photo.jpg", "image/jpeg", 0),
        "USER_PHOTO",
      ),
    ).toMatch(/non-empty/i);
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
