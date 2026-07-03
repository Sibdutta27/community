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
 */
export type EnrollmentStepFourSlotPolicy = Readonly<{
  accept: string;
  badges: readonly string[];
  allowedMimeTypes: ReadonlySet<string>;
  maxFileSizeBytes: number;
  maxFileSizeLabel: string;
  formatLabel: string;
}>;

const imageSlotPolicy: EnrollmentStepFourSlotPolicy = {
  accept: ".jpg,.jpeg,.png,.webp",
  badges: ["JPG", "PNG", "WEBP", "10 MB Max"],
  allowedMimeTypes: new Set(["image/jpeg", "image/png", "image/webp"]),
  maxFileSizeBytes: 10 * MB,
  maxFileSizeLabel: "10 MB",
  formatLabel: "JPG, PNG, or WEBP",
};

const documentSlotPolicy: EnrollmentStepFourSlotPolicy = {
  accept: ".jpg,.jpeg,.png,.webp,.pdf",
  badges: ["PDF", "JPG", "PNG", "WEBP", "10 MB Max"],
  allowedMimeTypes: new Set([
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
  ]),
  maxFileSizeBytes: 10 * MB,
  maxFileSizeLabel: "10 MB",
  formatLabel: "PDF, JPG, PNG, or WEBP",
};

const oralHistorySlotPolicy: EnrollmentStepFourSlotPolicy = {
  accept: ".jpg,.jpeg,.png,.webp,.pdf,.mp3,.m4a,.wav,.mp4,.mov",
  badges: ["PDF", "JPG", "PNG", "WEBP", "MP3", "MP4", "MOV", "100 MB Max"],
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
  formatLabel: "PDF, JPG, PNG, WEBP, MP3, MP4, or MOV",
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

export type EnrollmentStepFourUploadSlot = Readonly<{
  id: string;
  title: string;
  description: string;
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
  title: "Your Photo",
  description: "Upload a clear, recent photo of yourself.",
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
    title: "Genealogical Records",
    description:
      "Birth, baptism, census, or civil records that trace your family line.",
    documentType: "GENEALOGICAL_RECORDS",
    isSingle: false,
    required: false,
  },
  {
    id: "kinship_letters",
    title: "Kinship Letters",
    description:
      "Letters from family or community members attesting to your kinship.",
    documentType: "KINSHIP_LETTERS",
    isSingle: false,
    required: false,
  },
  {
    id: "oral_history",
    title: "Oral History",
    description:
      "Recorded or transcribed oral history that supports your lineage.",
    documentType: "ORAL_HISTORY",
    isSingle: false,
    required: false,
  },
  {
    id: "dna_testing",
    title: "DNA Testing",
    description: "DNA test results that support your ancestry, if available.",
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
 * Client-side guard run before any upload: checks the file's mime type and
 * size against the per-slot policy and returns a friendly inline error, or
 * `null` when the file is acceptable.
 */
export function getEnrollmentStepFourFileValidationMessage(
  file: File,
  documentType: EnrollmentDocumentType,
) {
  const policy = getEnrollmentStepFourSlotPolicy(documentType);

  if (file.size <= 0) {
    return "Please choose a non-empty file.";
  }

  if (
    !policy.allowedMimeTypes.has(file.type) ||
    file.size > policy.maxFileSizeBytes
  ) {
    return `This slot accepts ${policy.formatLabel} files up to ${policy.maxFileSizeLabel}.`;
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

export function getEnrollmentDocumentDisplayName(fileName: string) {
  const trimmedFileName = fileName.trim();

  if (!trimmedFileName) {
    return "Uploaded document";
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
