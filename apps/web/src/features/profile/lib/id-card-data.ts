import type { AuthUser } from "@/lib/auth";
import type {
  EnrollmentDocumentRecord,
  ProfileResponse,
} from "@/types/enrollment";

/**
 * The status buckets that drive the ID card's gating. Only `approved` renders
 * a real, downloadable ID; every other state shows the same card as a locked
 * preview with a status-aware call-to-action.
 */
export type IdCardStatus =
  "approved" | "submitted" | "rejected" | "draft" | "notStarted";

export type IdCardData = Readonly<{
  status: IdCardStatus;
  isApproved: boolean;
  fullName: string;
  initials: string;
  memberId: string;
  /** DOB as a numeric MM/DD/YYYY badge, matching a physical ID. */
  dateOfBirth: string;
  yucayeke: string;
  /** Long-form issue/enrollment date (uppercased in the card). */
  enrollmentDate: string;
  /**
   * Derived display document number — only produced for approved members.
   * NOTE: this is a client-side display artifact until the API exposes a real
   * `documentNumber` field (see the plan's follow-up). Empty when not approved.
   */
  documentNumber: string;
  /** Same-origin or remote photo URL, or empty to fall back to initials. */
  photoUrl: string;
}>;

function readText(value: string | null | undefined) {
  return value ? value.trim() : "";
}

function buildFullName(parts: readonly (string | null | undefined)[]) {
  return parts.map(readText).filter(Boolean).join(" ");
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "M";
  }

  const first = parts[0].charAt(0);
  const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : "";

  return `${first}${last}`.toUpperCase();
}

/** Numeric MM/DD/YYYY for the ID badge (dates of birth on a physical card). */
function formatShortDate(value: string | null | undefined) {
  const normalized = readText(value);

  if (!normalized) {
    return "";
  }

  const date = new Date(normalized);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

/** Long-form "January 15, 2023" for the issue/enrollment date. */
function formatLongDate(value: string | null | undefined) {
  const normalized = readText(value);

  if (!normalized) {
    return "";
  }

  const date = new Date(normalized);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function normalizeStatus(raw: string | null | undefined): IdCardStatus {
  switch (readText(raw).toUpperCase()) {
    case "APPROVED":
      return "approved";
    case "SUBMITTED":
      return "submitted";
    case "REJECTED":
      return "rejected";
    case "DRAFT":
      return "draft";
    default:
      return "notStarted";
  }
}

/** Stable 5-digit sequence derived from the member's public id. */
function derivePublicSequence(memberId: string) {
  const digits = memberId.replace(/\D/g, "");

  if (digits.length >= 5) {
    return digits.slice(-5);
  }

  if (digits.length >= 1) {
    return digits.padStart(5, "0");
  }

  // No usable digits (e.g. an all-letters public id) — hash the string to a
  // stable 5-digit value so the same member always sees the same number.
  let hash = 0;
  for (let index = 0; index < memberId.length; index += 1) {
    hash = (hash * 31 + memberId.charCodeAt(index)) % 100000;
  }

  return String(hash).padStart(5, "0");
}

/**
 * Resolves the member's approved photo URL: the account avatar first, then the
 * verified USER_PHOTO enrollment document. Empty string → card uses initials.
 */
function resolvePhotoUrl(accountInfo: ProfileResponse | null): string {
  const avatar =
    readText(accountInfo?.avatarUrl) || readText(accountInfo?.user?.avatarUrl);

  if (avatar) {
    return avatar;
  }

  const bucket = accountInfo?.enrollment?.documents?.find(
    (item) => item.type === "USER_PHOTO",
  );

  if (!bucket?.documents) {
    return "";
  }

  const records: EnrollmentDocumentRecord[] = Array.isArray(bucket.documents)
    ? bucket.documents
    : [bucket.documents];

  const approved = records.find(
    (record) => record.status?.toString().toUpperCase() === "APPROVED",
  );

  return readText((approved ?? records[0])?.url);
}

/**
 * Maps the profile API response + auth session into the fields the Tribal
 * Identification card renders. Missing values come back as empty strings; the
 * card component supplies the localized placeholder / preview treatment.
 */
export function buildIdCardData(
  accountInfo: ProfileResponse | null,
  authUser: AuthUser,
): IdCardData {
  const enrollment = accountInfo?.enrollment ?? null;
  const personalInfo = enrollment?.personalInfo ?? null;

  const status = normalizeStatus(
    accountInfo?.enrollmentStatus ?? enrollment?.status,
  );
  const isApproved = status === "approved";

  const fullName =
    buildFullName([personalInfo?.firstName, personalInfo?.lastName]) ||
    readText(accountInfo?.user?.name) ||
    readText(authUser.name);

  const memberId =
    readText(accountInfo?.user?.publicId) || readText(authUser.publicId);

  const approvalDate = readText(enrollment?.approvalDate);

  const documentNumber =
    isApproved && memberId
      ? `TN-${new Date(approvalDate || Date.now()).getFullYear()}-${derivePublicSequence(memberId)}`
      : "";

  return {
    status,
    isApproved,
    fullName,
    initials: getInitials(fullName || "Member"),
    memberId,
    dateOfBirth: formatShortDate(personalInfo?.dateOfBirth),
    yucayeke: readText(personalInfo?.yucayeke),
    enrollmentDate: formatLongDate(approvalDate),
    documentNumber,
    photoUrl: resolvePhotoUrl(accountInfo),
  };
}
