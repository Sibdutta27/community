import type {
  EnrollmentDocumentBucket,
  EnrollmentDocumentRecord,
  EnrollmentDocumentType,
} from "@/types/enrollment";

export const enrollmentStepFourUploadAccept = ".jpg,.jpeg,.png,.webp,.pdf";
export const enrollmentStepFourMaxFileSizeBytes = 10 * 1024 * 1024;

const enrollmentStepFourAllowedMimeTypes = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export type EnrollmentStepFourSingleUploadCard = Readonly<{
  id: "user_photo" | "birth_certificate";
  title: string;
  description: string;
  documentType: EnrollmentDocumentType;
}>;

export const enrollmentStepFourSingleUploadCards = [
  {
    id: "user_photo",
    title: "User Photo",
    description: "Upload a clear, recent photo.",
    documentType: "USER_PHOTO",
  },
  {
    id: "birth_certificate",
    title: "Birth Certificate",
    description: "Upload your birth certificate document.",
    documentType: "BIRTH_CERTIFICATE",
  },
] as const satisfies readonly EnrollmentStepFourSingleUploadCard[];

export type EnrollmentStepFourLineageUploadSlot = Readonly<{
  id:
    | "mother_birth_certificate"
    | "mother_photo"
    | "grandmother_birth_certificate"
    | "grandmother_photo";
  title: string;
  description: string;
  documentType: "FAMILY_RECORD" | "FAMILY_PHOTO";
}>;

export const enrollmentStepFourLineageUploadSlots = [
  {
    id: "mother_birth_certificate",
    title: "Mother's Birth Certificate",
    description: "Upload your mother's birth certificate.",
    documentType: "FAMILY_RECORD",
  },
  {
    id: "mother_photo",
    title: "Mother's Photo",
    description: "Upload a clear photo of your mother.",
    documentType: "FAMILY_PHOTO",
  },
  {
    id: "grandmother_birth_certificate",
    title: "Grandmother's Birth Certificate",
    description: "Upload your grandmother's birth certificate.",
    documentType: "FAMILY_RECORD",
  },
  {
    id: "grandmother_photo",
    title: "Grandmother's Photo",
    description: "Upload a clear photo of your grandmother.",
    documentType: "FAMILY_PHOTO",
  },
] as const satisfies readonly EnrollmentStepFourLineageUploadSlot[];

export const enrollmentStepFourAdditionalEvidenceCard = {
  id: "additional_evidence",
  title: "Additional Evidence",
  description: "Upload any additional supporting documents, if available.",
  documentType: "ADDITIONAL_EVIDENCE",
} as const;

export type EnrollmentStepFourUploadSlotId =
  | EnrollmentStepFourSingleUploadCard["id"]
  | EnrollmentStepFourLineageUploadSlot["id"]
  | typeof enrollmentStepFourAdditionalEvidenceCard.id;

export type EnrollmentStepFourDocumentMap = Record<
  EnrollmentDocumentType,
  EnrollmentDocumentRecord[]
>;

function createEmptyDocumentMap(): EnrollmentStepFourDocumentMap {
  return {
    USER_PHOTO: [],
    BIRTH_CERTIFICATE: [],
    FAMILY_RECORD: [],
    FAMILY_PHOTO: [],
    ADDITIONAL_EVIDENCE: [],
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
    map[bucket.type] = toDocumentArray(bucket);
  }

  return map;
}

export function getEnrollmentStepFourFileValidationMessage(file: File) {
  if (!enrollmentStepFourAllowedMimeTypes.has(file.type)) {
    return "Unsupported file type. Allowed types: JPG, PNG, WEBP, PDF.";
  }

  if (file.size <= 0) {
    return "Please choose a non-empty file.";
  }

  if (file.size > enrollmentStepFourMaxFileSizeBytes) {
    return "File size exceeds the 10 MB limit.";
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
