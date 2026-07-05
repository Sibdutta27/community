import type {
  EnrollmentDocumentBucket,
  EnrollmentDocumentRecord,
  EnrollmentDocumentType,
} from "@/types/enrollment";

const MB = 1024 * 1024;

/**
 * Per-slot upload policy, mirroring the backend `getDocumentPolicy` map:
 * which mime types each document slot accepts, the file-input `accept`
 * attribute, the format badges shown under the drop area, and the size cap.
 * `formatBadges`/`formatsLabel`/`maxFileSizeLabel` are locale-neutral tokens
 * ("JPG", "10 MB") — the sentences around them come from the message catalog.
 */
export type EnrollmentStepFourSlotPolicy = Readonly<{
  accept: string;
  formatBadges: readonly string[];
  allowedMimeTypes: ReadonlySet<string>;
  maxFileSizeBytes: number;
  maxFileSizeLabel: string;
  formatsLabel: string;
}>;

const imageSlotPolicy: EnrollmentStepFourSlotPolicy = {
  accept: ".jpg,.jpeg,.png,.webp",
  formatBadges: ["JPG", "PNG", "WEBP"],
  allowedMimeTypes: new Set(["image/jpeg", "image/png", "image/webp"]),
  maxFileSizeBytes: 10 * MB,
  maxFileSizeLabel: "10 MB",
  formatsLabel: "JPG, PNG, WEBP",
};

const documentSlotPolicy: EnrollmentStepFourSlotPolicy = {
  accept: ".jpg,.jpeg,.png,.webp,.pdf",
  formatBadges: ["PDF", "JPG", "PNG", "WEBP"],
  allowedMimeTypes: new Set([
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
  ]),
  maxFileSizeBytes: 10 * MB,
  maxFileSizeLabel: "10 MB",
  formatsLabel: "PDF, JPG, PNG, WEBP",
};

const oralHistorySlotPolicy: EnrollmentStepFourSlotPolicy = {
  accept: ".jpg,.jpeg,.png,.webp,.pdf,.mp3,.m4a,.wav,.mp4,.mov",
  formatBadges: ["PDF", "JPG", "PNG", "WEBP", "MP3", "MP4", "MOV"],
  allowedMimeTypes: new Set([
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
    "audio/mpeg",
    "audio/mp4",
    "audio/wav",
    "audio/x-wav",
    "video/mp4",
    "video/quicktime",
  ]),
  maxFileSizeBytes: 100 * MB,
  maxFileSizeLabel: "100 MB",
  formatsLabel: "PDF, JPG, PNG, WEBP, MP3, MP4, MOV",
};

const enrollmentStepFourSlotPolicies: Record<
  EnrollmentDocumentType,
  EnrollmentStepFourSlotPolicy
> = {
  PROFILE_PICTURE: imageSlotPolicy,
  USER_PHOTO: imageSlotPolicy,
  GENEALOGICAL_RECORDS: documentSlotPolicy,
  KINSHIP_LETTERS: documentSlotPolicy,
  ORAL_HISTORY: oralHistorySlotPolicy,
  DNA_TESTING: documentSlotPolicy,
};

export function getEnrollmentStepFourSlotPolicy(
  documentType: EnrollmentDocumentType,
): EnrollmentStepFourSlotPolicy {
  return enrollmentStepFourSlotPolicies[documentType] ?? documentSlotPolicy;
}

/**
 * A step-4 upload slot. The user-facing copy (title + description) lives in
 * the `enrollment.stepFour.slots` message catalog, keyed by `id`.
 */
export type EnrollmentStepFourUploadSlot = Readonly<{
  id: string;
  documentType: EnrollmentDocumentType;
  isSingle: boolean;
  required: boolean;
}>;

/**
 * The one mandatory upload for Step 4 — a single, clear photo of the
 * applicant (`USER_PHOTO`, required by `POST /enrollment/step4/next`).
 */
export const enrollmentStepFourUserPhotoCard = {
  id: "user_photo",
  documentType: "USER_PHOTO",
  isSingle: true,
  required: true,
} as const satisfies EnrollmentStepFourUploadSlot;

/**
 * Optional multi-file supporting-evidence slots for the kinship / ancestry
 * proof, matching the backend document types exactly.
 */
export const enrollmentStepFourEvidenceUploadSlots = [
  {
    id: "genealogical_records",
    documentType: "GENEALOGICAL_RECORDS",
    isSingle: false,
    required: false,
  },
  {
    id: "kinship_letters",
    documentType: "KINSHIP_LETTERS",
    isSingle: false,
    required: false,
  },
  {
    id: "oral_history",
    documentType: "ORAL_HISTORY",
    isSingle: false,
    required: false,
  },
  {
    id: "dna_testing",
    documentType: "DNA_TESTING",
    isSingle: false,
    required: false,
  },
] as const satisfies readonly EnrollmentStepFourUploadSlot[];

export type EnrollmentStepFourUploadSlotId =
  | typeof enrollmentStepFourUserPhotoCard.id
  | (typeof enrollmentStepFourEvidenceUploadSlots)[number]["id"];

export type EnrollmentStepFourDocumentMap = Record<
  EnrollmentDocumentType,
  EnrollmentDocumentRecord[]
>;

function createEmptyDocumentMap(): EnrollmentStepFourDocumentMap {
  return {
    PROFILE_PICTURE: [],
    USER_PHOTO: [],
    GENEALOGICAL_RECORDS: [],
    KINSHIP_LETTERS: [],
    ORAL_HISTORY: [],
    DNA_TESTING: [],
  };
}

function toDocumentArray(bucket: EnrollmentDocumentBucket) {
  if (!bucket.documents) {
    return [];
  }

  return Array.isArray(bucket.documents)
    ? bucket.documents
    : [bucket.documents];
}

export function buildEnrollmentStepFourDocumentMap(
  buckets?: readonly EnrollmentDocumentBucket[] | null,
): EnrollmentStepFourDocumentMap {
  const map = createEmptyDocumentMap();

  for (const bucket of buckets ?? []) {
    if (bucket.type in map) {
      map[bucket.type] = toDocumentArray(bucket);
    }
  }

  return map;
}

/**
 * Structured client-side upload rejection. The component maps the code to a
 * localized message from `enrollment.validation` (`emptyFile` /
 * `fileNotAccepted` with the `formats` + `maxSize` values).
 */
export type EnrollmentStepFourFileValidationError =
  | Readonly<{ code: "EMPTY_FILE" }>
  | Readonly<{ code: "FILE_NOT_ACCEPTED"; formats: string; maxSize: string }>;

/**
 * Client-side guard run before any upload: checks the file's mime type and
 * size against the per-slot policy and returns a structured error, or `null`
 * when the file is acceptable.
 */
export function getEnrollmentStepFourFileValidationError(
  file: File,
  documentType: EnrollmentDocumentType,
): EnrollmentStepFourFileValidationError | null {
  const policy = getEnrollmentStepFourSlotPolicy(documentType);

  if (file.size <= 0) {
    return { code: "EMPTY_FILE" };
  }

  if (
    !policy.allowedMimeTypes.has(file.type) ||
    file.size > policy.maxFileSizeBytes
  ) {
    return {
      code: "FILE_NOT_ACCEPTED",
      formats: policy.formatsLabel,
      maxSize: policy.maxFileSizeLabel,
    };
  }

  return null;
}

export function formatEnrollmentDocumentFileSize(fileSizeInBytes: number) {
  if (fileSizeInBytes >= 1024 * 1024) {
    return `${(fileSizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  if (fileSizeInBytes >= 1024) {
    return `${Math.round(fileSizeInBytes / 1024)} KB`;
  }

  return `${fileSizeInBytes} B`;
}

/**
 * Last path segment of the stored file name, or `""` when the name is empty —
 * the component falls back to the localized "uploaded document" label.
 */
export function getEnrollmentDocumentDisplayName(fileName: string) {
  const trimmedFileName = fileName.trim();

  if (!trimmedFileName) {
    return "";
  }

  const fileNameSegments = trimmedFileName.split("/");

  return fileNameSegments[fileNameSegments.length - 1] || trimmedFileName;
}

export function formatEnrollmentDocumentStatus(status: string) {
  return status
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
