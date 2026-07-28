import type { useTranslations } from "next-intl";

import type { AuthUser } from "@/lib/auth";
import type {
  ProfileResponse,
  EnrollmentAncestryMap,
  EnrollmentAncestryRelation,
  EnrollmentAncestrySummary,
  EnrollmentDocumentBucket,
  EnrollmentDocumentRecord,
  EnrollmentDocumentType,
  RegionalMemberLocation,
  EnrollmentStepState,
} from "@/types/enrollment";

import {
  type ProfileActivityData,
  profileConfig,
  type ProfileCopy,
  type ProfileDetail,
  type ProfileDocumentsData,
  type ProfileKinshipAncestor,
  type ProfileKinshipData,
  type ProfileKinshipFact,
  type ProfileOverviewData,
  type ProfileRegionalMember,
  type ProfileSettingsData,
  type ProfileYucayekeData,
} from "../config/profile-config";

type AccountInfoResponse = ProfileResponse;

/** Translator scoped to the `profile` message namespace. */
export type ProfileTranslator = ReturnType<typeof useTranslations<"profile">>;

type BuildProfileViewDataArgs = Readonly<{
  accountInfo?: AccountInfoResponse | null;
  authUser: AuthUser;
  t: ProfileTranslator;
}>;

export type ProfileViewData = Readonly<{
  activityData: ProfileActivityData;
  copy: ProfileCopy;
  details: readonly ProfileDetail[];
  kinshipData: ProfileKinshipData;
  overviewData: ProfileOverviewData;
  yucayekeData: ProfileYucayekeData;
  documentsData: ProfileDocumentsData;
  settingsData: ProfileSettingsData;
  regionalMembers: readonly ProfileRegionalMember[];
}>;

const fallbackCopy = profileConfig.copy;
const fallbackDetails = profileConfig.details;
const fallbackOverview = profileConfig.overview;
const fallbackActivity = profileConfig.activity;
const fallbackRegionalMembers = profileConfig.regionalMembers;

const documentTypeLabelKeys = {
  PROFILE_PICTURE: "documents.types.profilePicture",
  USER_PHOTO: "documents.types.userPhoto",
  STATE_ID: "documents.types.stateId",
  BIRTH_CERTIFICATE: "documents.types.birthCertificate",
  SOCIAL_SECURITY_CARD: "documents.types.socialSecurityCard",
  GENEALOGICAL_RECORDS: "documents.types.genealogicalRecords",
  KINSHIP_LETTERS: "documents.types.kinshipLetters",
  ORAL_HISTORY: "documents.types.oralHistory",
  DNA_TESTING: "documents.types.dnaTesting",
} as const satisfies Readonly<Record<EnrollmentDocumentType, string>>;

const enrollmentStatusKeys = {
  NOT_STARTED: "enrollmentStatus.notStarted",
  DRAFT: "enrollmentStatus.draft",
  SUBMITTED: "enrollmentStatus.submitted",
  APPROVED: "enrollmentStatus.approved",
  REJECTED: "enrollmentStatus.rejected",
} as const;

const documentStatusKeys = {
  PENDING: "documentStatus.pending",
  APPROVED: "documentStatus.approved",
  REJECTED: "documentStatus.rejected",
} as const;

const overviewChecklistKeys = [
  "overview.checklist.step1",
  "overview.checklist.step2",
  "overview.checklist.step3",
  "overview.checklist.step4",
] as const;

const emptyValueDash = "—";
const defaultEnrollmentStepCount = 4;

/**
 * Kinship groups in render order — mirrors the backend `AncestryRelation`
 * slots written by enrollment steps 2 (maternal) and 3 (paternal).
 */
const kinshipGroupDefinitions = [
  {
    emptyMessageKey: "kinship.maternalEmpty",
    relations: [
      { labelKey: "kinship.relations.mother", relation: "MOTHER" },
      {
        labelKey: "kinship.relations.maternalGrandmother",
        relation: "MATERNAL_GRANDMOTHER",
      },
      {
        labelKey: "kinship.relations.maternalGrandfather",
        relation: "MATERNAL_GRANDFATHER",
      },
    ],
    titleKey: "kinship.maternalLine",
  },
  {
    emptyMessageKey: "kinship.paternalEmpty",
    relations: [
      { labelKey: "kinship.relations.father", relation: "FATHER" },
      {
        labelKey: "kinship.relations.paternalGrandmother",
        relation: "PATERNAL_GRANDMOTHER",
      },
      {
        labelKey: "kinship.relations.paternalGrandfather",
        relation: "PATERNAL_GRANDFATHER",
      },
    ],
    titleKey: "kinship.paternalLine",
  },
] as const;

function readText(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  return value.trim();
}

function toStatusLabel(value: string | null | undefined) {
  const normalizedValue = readText(value);

  if (!normalizedValue) {
    return "";
  }

  return normalizedValue
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Enrollment status shown as UI chrome: known enum values render via the
 * message catalog; unknown backend values fall back to title-casing.
 */
function toEnrollmentStatusLabel(
  t: ProfileTranslator,
  value: string | null | undefined,
) {
  const normalizedValue = readText(value).toUpperCase();
  const key =
    enrollmentStatusKeys[normalizedValue as keyof typeof enrollmentStatusKeys];

  return key ? t(key) : toStatusLabel(value);
}

function toDocumentStatusLabel(
  t: ProfileTranslator,
  value: string | null | undefined,
) {
  const normalizedValue = readText(value).toUpperCase();
  const key =
    documentStatusKeys[normalizedValue as keyof typeof documentStatusKeys];

  return key ? t(key) : toStatusLabel(value);
}

function resolveEnrollmentStatus(
  t: ProfileTranslator,
  accountInfo?: AccountInfoResponse | null,
) {
  return (
    toEnrollmentStatusLabel(
      t,
      accountInfo?.enrollmentStatus ?? accountInfo?.enrollment?.status,
    ) ||
    (accountInfo?.hasEnrollment
      ? t("enrollmentStatus.inProgress")
      : t("enrollmentStatus.notStarted"))
  );
}

function formatDateLabel(value: string | null | undefined) {
  const normalizedValue = readText(value);

  if (!normalizedValue) {
    return "";
  }

  const date = new Date(normalizedValue);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatDateTimeLabel(value: string | null | undefined) {
  const normalizedValue = readText(value);

  if (!normalizedValue) {
    return "";
  }

  const date = new Date(normalizedValue);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getTimeValue(value: string | null | undefined) {
  const normalizedValue = readText(value);

  if (!normalizedValue) {
    return 0;
  }

  const timestamp = new Date(normalizedValue).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function buildFullName(parts: readonly (string | null | undefined)[]) {
  const values = parts.map(readText).filter(Boolean);

  return values.join(" ");
}

function formatPhoneLabel(value: string | null | undefined) {
  const normalizedValue = readText(value);

  if (!normalizedValue) {
    return "";
  }

  const digits = normalizedValue.replace(/\D/g, "");

  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  return normalizedValue;
}

function resolveLocation(accountInfo?: AccountInfoResponse | null) {
  const birthCity = readText(
    accountInfo?.enrollment?.personalInfo?.cityOfBirth,
  );
  const birthCountry = readText(
    accountInfo?.enrollment?.personalInfo?.countryOfBirth,
  );

  return [birthCity, birthCountry].filter(Boolean).join(", ");
}

function getResolvedStepState(accountInfo?: AccountInfoResponse | null) {
  return accountInfo?.enrollmentStep ?? accountInfo?.enrollment?.steps;
}

function countCompletedSteps(stepState?: EnrollmentStepState) {
  if (!stepState) {
    return null;
  }

  const completed = Object.values(stepState).filter(Boolean).length;
  return `${completed} / ${Object.keys(stepState).length}`;
}

function getCompletedStepsLabel(stepState?: EnrollmentStepState) {
  return countCompletedSteps(stepState) ?? `0 / ${defaultEnrollmentStepCount}`;
}

// -----------------------------
// KINSHIP / ANCESTRY
// -----------------------------

function hasAncestorContent(
  ancestor: EnrollmentAncestrySummary | null | undefined,
): ancestor is EnrollmentAncestrySummary {
  if (!ancestor) {
    return false;
  }

  return Boolean(
    readText(ancestor.name) ||
    readText(ancestor.municipality) ||
    readText(ancestor.yucayeke) ||
    readText(ancestor.nationality) ||
    readText(ancestor.dateOfBirth) ||
    typeof ancestor.isBorikuaTaino === "boolean",
  );
}

function formatBorikuaTainoLabel(
  t: ProfileTranslator,
  value: boolean | null | undefined,
) {
  if (value === true) {
    return t("kinship.yes");
  }

  if (value === false) {
    return t("kinship.no");
  }

  return emptyValueDash;
}

function buildAncestorFacts(
  t: ProfileTranslator,
  ancestor: EnrollmentAncestrySummary,
): ProfileKinshipFact[] {
  const facts: ProfileKinshipFact[] = [];
  const municipality = readText(ancestor.municipality);
  const yucayeke = readText(ancestor.yucayeke);
  const nationality = readText(ancestor.nationality);
  const birthDate = formatDateLabel(ancestor.dateOfBirth);

  if (municipality) {
    facts.push({ label: t("kinship.facts.municipality"), value: municipality });
  }

  if (yucayeke) {
    facts.push({ label: t("kinship.facts.yucayeke"), value: yucayeke });
  }

  if (nationality) {
    facts.push({ label: t("kinship.facts.nationality"), value: nationality });
  }

  if (birthDate) {
    facts.push({ label: t("kinship.facts.dateOfBirth"), value: birthDate });
  }

  facts.push({
    label: t("kinship.facts.borikuaTaino"),
    value: formatBorikuaTainoLabel(t, ancestor.isBorikuaTaino),
  });

  return facts;
}

function mapKinshipGroupAncestors(
  t: ProfileTranslator,
  ancestry: EnrollmentAncestryMap | undefined,
  relations: (typeof kinshipGroupDefinitions)[number]["relations"],
): ProfileKinshipAncestor[] {
  const ancestors: ProfileKinshipAncestor[] = [];

  for (const { labelKey, relation } of relations) {
    const ancestor = ancestry?.[relation as EnrollmentAncestryRelation];

    if (!hasAncestorContent(ancestor)) {
      continue;
    }

    ancestors.push({
      facts: buildAncestorFacts(t, ancestor),
      name: readText(ancestor.name) || emptyValueDash,
      relation: t(labelKey),
      // Positive badges only — UNVERIFIED renders nothing.
      ...(ancestor.verificationStatus === "VERIFIED_DNA" ||
      ancestor.verificationStatus === "VERIFIED_GENEALOGY"
        ? {
            verificationLabel: t(
              `kinship.verification.${ancestor.verificationStatus}`,
            ),
          }
        : {}),
    });
  }

  return ancestors;
}

function mapKinshipData(
  t: ProfileTranslator,
  accountInfo?: AccountInfoResponse | null,
): ProfileKinshipData {
  const ancestry = accountInfo?.enrollment?.ancestry;

  return {
    description: t("kinship.description"),
    groups: kinshipGroupDefinitions.map((group) => ({
      ancestors: mapKinshipGroupAncestors(t, ancestry, group.relations),
      emptyMessage: t(group.emptyMessageKey),
      title: t(group.titleKey),
    })),
    title: t("kinship.title"),
  };
}

function countRecordedAncestors(
  t: ProfileTranslator,
  accountInfo?: AccountInfoResponse | null,
) {
  const ancestry = accountInfo?.enrollment?.ancestry;

  return kinshipGroupDefinitions.reduce(
    (count, group) =>
      count + mapKinshipGroupAncestors(t, ancestry, group.relations).length,
    0,
  );
}

// -----------------------------
// DOCUMENTS
// -----------------------------

type DocumentMap = Record<EnrollmentDocumentType, EnrollmentDocumentRecord[]>;

function createEmptyDocumentMap(): DocumentMap {
  return {
    PROFILE_PICTURE: [],
    USER_PHOTO: [],
    STATE_ID: [],
    BIRTH_CERTIFICATE: [],
    SOCIAL_SECURITY_CARD: [],
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

function getDocumentMap(
  buckets: readonly EnrollmentDocumentBucket[] | undefined,
): DocumentMap {
  const map = createEmptyDocumentMap();

  for (const bucket of buckets ?? []) {
    map[bucket.type] = toDocumentArray(bucket);
  }

  return map;
}

function getDocumentCount(
  buckets: readonly EnrollmentDocumentBucket[] | undefined,
) {
  let count = 0;

  for (const bucket of buckets ?? []) {
    if (!bucket.documents) {
      continue;
    }

    count += Array.isArray(bucket.documents) ? bucket.documents.length : 1;
  }

  return count;
}

function formatDocumentFileSize(fileSizeInBytes: number) {
  if (fileSizeInBytes >= 1024 * 1024) {
    return `${(fileSizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  if (fileSizeInBytes >= 1024) {
    return `${Math.round(fileSizeInBytes / 1024)} KB`;
  }

  return `${fileSizeInBytes} B`;
}

function getDocumentDisplayName(t: ProfileTranslator, fileName: string) {
  const normalizedValue = readText(fileName);

  if (!normalizedValue) {
    return t("documents.uploadedDocument");
  }

  const fileNameSegments = normalizedValue.split("/");

  return fileNameSegments[fileNameSegments.length - 1] || normalizedValue;
}

function getMissingRequiredDocuments(
  t: ProfileTranslator,
  documentMap: DocumentMap,
) {
  const missingDocuments: string[] = [];

  if (documentMap.USER_PHOTO.length < 1) {
    missingDocuments.push(t("documents.types.userPhoto"));
  }

  return missingDocuments;
}

function getRequiredCoverageValue(documentMap: DocumentMap) {
  const uploadedCount = Math.min(documentMap.USER_PHOTO.length, 1);

  return `${uploadedCount} / 1`;
}

function getApprovedDocumentCount(
  documents: readonly EnrollmentDocumentRecord[],
) {
  return documents.filter(
    (document) => readText(document.status).toUpperCase() === "APPROVED",
  ).length;
}

function getPendingDocumentCount(
  documents: readonly EnrollmentDocumentRecord[],
) {
  return documents.filter((document) => {
    const normalizedStatus = readText(document.status).toUpperCase();
    return normalizedStatus !== "APPROVED" && normalizedStatus !== "REJECTED";
  }).length;
}

// -----------------------------
// PANEL DATA MAPPERS
// -----------------------------

function mapOverviewData(
  t: ProfileTranslator,
  accountInfo?: AccountInfoResponse | null,
): ProfileOverviewData {
  const enrollment = accountInfo?.enrollment;
  const personalInfo = enrollment?.personalInfo;
  const contact = enrollment?.contact;
  const stepState = getResolvedStepState(accountInfo);
  const completedSteps = getCompletedStepsLabel(stepState);
  const totalDocuments = getDocumentCount(enrollment?.documents);
  const recordedAncestors = countRecordedAncestors(t, accountInfo);

  const enrollmentStatus = resolveEnrollmentStatus(t, accountInfo);

  const fullName = buildFullName([
    personalInfo?.firstName,
    personalInfo?.lastName,
  ]);
  const phoneTypeLabel = toStatusLabel(contact?.phoneType);
  const phoneLabel = formatPhoneLabel(contact?.phoneNumber);
  const missingValueLabel = t("summary.notProvided");

  return {
    checklist: fallbackOverview.checklist.map((_, index) => {
      const stepKey = String(index + 1) as keyof EnrollmentStepState;
      return {
        completed: stepState?.[stepKey] ?? false,
        label: t(overviewChecklistKeys[index]),
      };
    }),
    contactFacts: [
      {
        label: t("overview.facts.email"),
        value:
          readText(contact?.email) ||
          readText(accountInfo?.user?.email) ||
          missingValueLabel,
      },
      {
        label: t("overview.facts.phone"),
        value:
          phoneLabel && phoneTypeLabel
            ? `${phoneLabel} (${phoneTypeLabel})`
            : phoneLabel || missingValueLabel,
      },
    ],
    description: t("overview.description"),
    metrics: [
      {
        helper: t("overview.metrics.enrollmentStatus.helper"),
        label: t("overview.metrics.enrollmentStatus.label"),
        value: enrollmentStatus,
      },
      {
        helper: t("overview.metrics.completedSteps.helper"),
        label: t("overview.metrics.completedSteps.label"),
        value: completedSteps,
      },
      {
        helper: t("overview.metrics.documentsUploaded.helper"),
        label: t("overview.metrics.documentsUploaded.label"),
        value: String(totalDocuments),
      },
      {
        helper: t("overview.metrics.ancestorsRecorded.helper"),
        label: t("overview.metrics.ancestorsRecorded.label"),
        value: String(recordedAncestors),
      },
    ],
    personalFacts: [
      {
        label: t("overview.facts.fullName"),
        value: fullName || missingValueLabel,
      },
      {
        label: t("overview.facts.occupation"),
        value: readText(personalInfo?.occupation) || missingValueLabel,
      },
      {
        label: t("overview.facts.maritalStatus"),
        value: toStatusLabel(personalInfo?.maritalStatus) || missingValueLabel,
      },
      {
        label: t("overview.facts.identity"),
        value: toStatusLabel(personalInfo?.identity) || missingValueLabel,
      },
    ],
    title: t("overview.title"),
  };
}

function mapYucayekeData(
  t: ProfileTranslator,
  accountInfo?: AccountInfoResponse | null,
): ProfileYucayekeData {
  const enrollment = accountInfo?.enrollment;
  const personalInfo = enrollment?.personalInfo;
  const declaredYucayeke = readText(personalInfo?.yucayeke);
  const communityName = declaredYucayeke
    ? t("yucayeke.communityName", { name: declaredYucayeke })
    : personalInfo?.yucayekeUnknown
      ? t("yucayeke.unknownCommunity")
      : t("yucayeke.defaultCommunity");
  const missingValueLabel = t("summary.notProvided");

  return {
    communityName,
    declaredYucayeke: declaredYucayeke || null,
    description: t("yucayeke.description"),
    yucayekeUnknown: Boolean(personalInfo?.yucayekeUnknown),
    territoryFacts: [
      {
        label: t("yucayeke.facts.birthCity"),
        value: readText(personalInfo?.cityOfBirth) || missingValueLabel,
      },
      {
        label: t("yucayeke.facts.birthMunicipality"),
        value: readText(personalInfo?.municipalityOfBirth) || missingValueLabel,
      },
      {
        label: t("yucayeke.facts.birthCountry"),
        value: readText(personalInfo?.countryOfBirth) || missingValueLabel,
      },
      {
        label: t("yucayeke.facts.declaredYucayeke"),
        value:
          declaredYucayeke ||
          (personalInfo?.yucayekeUnknown
            ? t("yucayeke.unknown")
            : missingValueLabel),
      },
    ],
    title: t("yucayeke.title"),
  };
}

function mapDocumentsData(
  t: ProfileTranslator,
  accountInfo?: AccountInfoResponse | null,
): ProfileDocumentsData {
  const documentMap = getDocumentMap(accountInfo?.enrollment?.documents);
  const allDocuments = Object.values(documentMap)
    .flat()
    .sort(
      (leftDocument, rightDocument) =>
        getTimeValue(rightDocument.uploadedAt) -
        getTimeValue(leftDocument.uploadedAt),
    );

  const approvedCount = getApprovedDocumentCount(allDocuments);
  const pendingCount = getPendingDocumentCount(allDocuments);

  return {
    categories: [
      {
        count: String(documentMap.USER_PHOTO.length),
        description: t("documents.categories.userPhoto.description"),
        label: t("documents.categories.userPhoto.label"),
        required: t("documents.requiredCount", { count: 1 }),
      },
      {
        count: String(documentMap.GENEALOGICAL_RECORDS.length),
        description: t("documents.categories.genealogicalRecords.description"),
        label: t("documents.categories.genealogicalRecords.label"),
        required: t("documents.optional"),
      },
      {
        count: String(documentMap.KINSHIP_LETTERS.length),
        description: t("documents.categories.kinshipLetters.description"),
        label: t("documents.categories.kinshipLetters.label"),
        required: t("documents.optional"),
      },
      {
        count: String(documentMap.ORAL_HISTORY.length),
        description: t("documents.categories.oralHistory.description"),
        label: t("documents.categories.oralHistory.label"),
        required: t("documents.optional"),
      },
      {
        count: String(documentMap.DNA_TESTING.length),
        description: t("documents.categories.dnaTesting.description"),
        label: t("documents.categories.dnaTesting.label"),
        required: t("documents.optional"),
      },
    ],
    description: t("documents.description"),
    metrics: [
      {
        helper: t("documents.metrics.totalUploaded.helper"),
        label: t("documents.metrics.totalUploaded.label"),
        value: String(allDocuments.length),
      },
      {
        helper: t("documents.metrics.requiredCoverage.helper"),
        label: t("documents.metrics.requiredCoverage.label"),
        value: getRequiredCoverageValue(documentMap),
      },
      {
        helper: t("documents.metrics.approved.helper"),
        label: t("documents.metrics.approved.label"),
        value: String(approvedCount),
      },
      {
        helper: t("documents.metrics.pending.helper"),
        label: t("documents.metrics.pending.label"),
        value: String(pendingCount),
      },
    ],
    missingRequired: getMissingRequiredDocuments(t, documentMap),
    title: t("documents.title"),
    uploads: allDocuments.slice(0, 8).map((document) => ({
      category: t(documentTypeLabelKeys[document.type]),
      id: document.id,
      name: getDocumentDisplayName(t, document.fileName),
      size: formatDocumentFileSize(document.fileSize),
      status:
        toDocumentStatusLabel(t, document.status) ||
        t("documentStatus.pending"),
      uploadedAt:
        formatDateLabel(document.uploadedAt) || t("summary.unknownDate"),
      url: document.url,
    })),
  };
}

function mapActivityData({
  accountInfo,
  t,
}: Readonly<{
  accountInfo?: AccountInfoResponse | null;
  t: ProfileTranslator;
}>): ProfileActivityData {
  const enrollment = accountInfo?.enrollment;
  const stepState = getResolvedStepState(accountInfo);
  const documentMap = getDocumentMap(enrollment?.documents);
  const allDocuments = Object.values(documentMap)
    .flat()
    .sort(
      (leftDocument, rightDocument) =>
        getTimeValue(rightDocument.uploadedAt) -
        getTimeValue(leftDocument.uploadedAt),
    );
  const pendingDocumentsCount = getPendingDocumentCount(allDocuments);
  const completedSteps = getCompletedStepsLabel(stepState);

  type RawActivityEvent = {
    description: string;
    id: string;
    rawDate: string;
    timestamp: number;
    title: string;
    tone: "success" | "warning" | "info";
  };

  const events: RawActivityEvent[] = [];
  const accountCreatedAt = readText(accountInfo?.user?.createdAt);

  if (accountCreatedAt) {
    events.push({
      description: t("activity.events.accountCreatedDescription"),
      id: "activity-account-created",
      rawDate: accountCreatedAt,
      timestamp: getTimeValue(accountCreatedAt),
      title: t("activity.events.accountCreatedTitle"),
      tone: "success",
    });
  }

  const acceptedConsents = [...(enrollment?.consent ?? [])]
    .filter((consent) => consent.accepted && readText(consent.acceptedAt))
    .sort(
      (leftConsent, rightConsent) =>
        getTimeValue(rightConsent.acceptedAt) -
        getTimeValue(leftConsent.acceptedAt),
    );

  for (const consent of acceptedConsents.slice(0, 3)) {
    if (!consent.acceptedAt) {
      continue;
    }

    events.push({
      description: t("activity.events.consentAcceptedDescription", {
        title: consent.title,
      }),
      id: `activity-consent-${consent.id}`,
      rawDate: consent.acceptedAt,
      timestamp: getTimeValue(consent.acceptedAt),
      title: t("activity.events.consentAcceptedTitle"),
      tone: "success",
    });
  }

  for (const document of allDocuments.slice(0, 6)) {
    const normalizedStatus = readText(document.status).toUpperCase();
    const tone =
      normalizedStatus === "APPROVED"
        ? "success"
        : normalizedStatus === "REJECTED"
          ? "warning"
          : "info";

    events.push({
      description: t("activity.events.documentUploadedDescription", {
        name: getDocumentDisplayName(t, document.fileName),
        size: formatDocumentFileSize(document.fileSize),
        status:
          toDocumentStatusLabel(t, document.status) ||
          t("documentStatus.pending"),
      }),
      id: `activity-document-${document.id}`,
      rawDate: document.uploadedAt,
      timestamp: getTimeValue(document.uploadedAt),
      title: t("activity.events.documentUploadedTitle", {
        type: t(documentTypeLabelKeys[document.type]),
      }),
      tone,
    });
  }

  const sortedEvents = events
    .filter((event) => event.timestamp > 0)
    .sort(
      (leftEvent, rightEvent) => rightEvent.timestamp - leftEvent.timestamp,
    );
  const latestEventDate = sortedEvents[0]?.rawDate;
  const missingRequiredDocuments = getMissingRequiredDocuments(t, documentMap);
  const nextActions: string[] = [];

  if (stepState && !stepState["3"]) {
    nextActions.push(t("activity.actions.completePaternalKinship"));
  }

  if (missingRequiredDocuments.length > 0) {
    nextActions.push(t("activity.actions.uploadMissingDocuments"));
  }

  if (pendingDocumentsCount > 0) {
    nextActions.push(t("activity.actions.checkPendingReviews"));
  }

  return {
    description: t("activity.description"),
    events: sortedEvents.slice(0, 8).map((event) => ({
      dateLabel:
        formatDateTimeLabel(event.rawDate) ||
        formatDateLabel(event.rawDate) ||
        t("summary.unknownDate"),
      description: event.description,
      id: event.id,
      title: event.title,
      tone: event.tone,
    })),
    metrics: [
      {
        helper: t("activity.metrics.recentEvents.helper"),
        label: t("activity.metrics.recentEvents.label"),
        value: String(sortedEvents.length),
      },
      {
        helper: t("activity.metrics.completedSteps.helper"),
        label: t("activity.metrics.completedSteps.label"),
        value: completedSteps,
      },
      {
        helper: t("activity.metrics.pendingReviews.helper"),
        label: t("activity.metrics.pendingReviews.label"),
        value: String(pendingDocumentsCount),
      },
      {
        helper: t("activity.metrics.lastUpdate.helper"),
        label: t("activity.metrics.lastUpdate.label"),
        value:
          formatDateLabel(latestEventDate) ||
          formatDateLabel(accountInfo?.lastUpdatedAt) ||
          formatDateLabel(accountInfo?.user?.updatedAt) ||
          fallbackActivity.metrics[3].value,
      },
    ],
    nextActions,
    title: t("activity.title"),
  };
}

function mapSettingsData({
  accountInfo,
  authUser,
  t,
}: Readonly<{
  accountInfo?: AccountInfoResponse | null;
  authUser: AuthUser;
  t: ProfileTranslator;
}>): ProfileSettingsData {
  const enrollment = accountInfo?.enrollment;
  const stepState = getResolvedStepState(accountInfo);
  const completedSteps = getCompletedStepsLabel(stepState);
  const documentMap = getDocumentMap(enrollment?.documents);
  const allDocuments = Object.values(documentMap).flat();
  const approvedDocumentsCount = getApprovedDocumentCount(allDocuments);
  const pendingDocumentsCount = getPendingDocumentCount(allDocuments);
  const requiredConsents = (enrollment?.consent ?? []).filter(
    (consent) => consent.required,
  );
  const acceptedRequiredConsentsCount = requiredConsents.filter(
    (consent) => consent.accepted,
  ).length;
  const hasAllRequiredConsents =
    requiredConsents.length > 0 &&
    acceptedRequiredConsentsCount === requiredConsents.length;
  const memberId =
    readText(accountInfo?.user?.publicId) ||
    readText(authUser.publicId) ||
    readText(accountInfo?.user?.id) ||
    readText(authUser.id);
  const email =
    readText(enrollment?.contact?.email) ||
    readText(accountInfo?.user?.email) ||
    readText(authUser.email);
  const phone = formatPhoneLabel(enrollment?.contact?.phoneNumber);
  const enrollmentStatus = resolveEnrollmentStatus(t, accountInfo);
  const missingValueLabel = t("summary.notProvided");

  return {
    accountFacts: [
      {
        label: t("settings.facts.memberId"),
        value: memberId || missingValueLabel,
      },
      {
        label: t("settings.facts.email"),
        value: email || missingValueLabel,
      },
      {
        label: t("settings.facts.phone"),
        value: phone || missingValueLabel,
      },
      {
        label: t("settings.facts.enrollmentStatus"),
        value: enrollmentStatus,
      },
      {
        label: t("settings.facts.completedSteps"),
        value: completedSteps,
      },
    ],
    description: t("settings.description"),
    preferences: [
      {
        description: t("settings.preferences.emailNotifications.description"),
        enabled: Boolean(email),
        label: t("settings.preferences.emailNotifications.label"),
      },
      {
        description: t("settings.preferences.smsNotifications.description"),
        enabled: Boolean(enrollment?.contact?.allowSMS),
        label: t("settings.preferences.smsNotifications.label"),
      },
      {
        description: t("settings.preferences.documentReviewAlerts.description"),
        enabled: pendingDocumentsCount > 0,
        label: t("settings.preferences.documentReviewAlerts.label"),
      },
      {
        description: t(
          "settings.preferences.enrollmentProgressAlerts.description",
        ),
        enabled: Boolean(stepState),
        label: t("settings.preferences.enrollmentProgressAlerts.label"),
      },
    ],
    securityItems: [
      {
        description:
          requiredConsents.length > 0
            ? hasAllRequiredConsents
              ? t("settings.security.consentAllAccepted")
              : t("settings.security.consentSomePending")
            : t("settings.security.consentNoneFound"),
        statusLabel: t("settings.security.consentAcceptedCount", {
          accepted:
            requiredConsents.length > 0 ? acceptedRequiredConsentsCount : 0,
          total: requiredConsents.length,
        }),
        title: t("settings.security.consentStatusTitle"),
        tone:
          requiredConsents.length > 0
            ? hasAllRequiredConsents
              ? "good"
              : "warn"
            : "neutral",
      },
      {
        description:
          pendingDocumentsCount > 0
            ? t("settings.security.documentPendingDescription")
            : t("settings.security.documentNonePending"),
        statusLabel:
          pendingDocumentsCount > 0
            ? t("settings.security.documentPendingCount", {
                count: pendingDocumentsCount,
              })
            : t("settings.security.documentApprovedCount", {
                count: approvedDocumentsCount,
              }),
        title: t("settings.security.documentReviewTitle"),
        tone: pendingDocumentsCount > 0 ? "warn" : "good",
      },
      {
        description: enrollment
          ? t("settings.security.accountActiveDescription")
          : t("settings.security.accountLimitedDescription"),
        statusLabel: enrollment
          ? t("settings.security.active")
          : t("settings.security.limited"),
        title: t("settings.security.accountAccessTitle"),
        tone: enrollment ? "good" : "neutral",
      },
    ],
    title: t("settings.title"),
  };
}

function resolveMemberSince(
  accountInfo: AccountInfoResponse | null | undefined,
) {
  return formatDateLabel(readText(accountInfo?.enrollment?.approvalDate));
}

function resolvePortraitSrc(
  accountInfo: AccountInfoResponse | null | undefined,
) {
  return (
    readText(accountInfo?.avatarUrl) || readText(accountInfo?.user?.avatarUrl)
  );
}

function formatRegionalMemberLocation(
  location: RegionalMemberLocation | null | undefined,
) {
  if (!location) {
    return "";
  }

  const city = readText(location.city);
  const state = readText(location.state);
  const zipCode = readText(location.zipCode);
  const cityState = [city, state].filter(Boolean).join(", ");

  if (cityState && zipCode) {
    return `${cityState} ${zipCode}`;
  }

  return cityState || zipCode;
}

function mapRegionalMembers(
  t: ProfileTranslator,
  accountInfo: AccountInfoResponse | null | undefined,
): readonly ProfileRegionalMember[] {
  const fromApi = (accountInfo?.regionalMembers ?? [])
    .map((member, index) => {
      const memberId =
        readText(member.memberId) ||
        readText(member.id) ||
        t("summary.notProvided");
      const name = readText(member.name);
      const locationLabel = formatRegionalMemberLocation(member.location);
      const role =
        readText(member.role) ||
        locationLabel ||
        t("regionalMembers.fallbackRole");
      const fallbackPortrait =
        fallbackRegionalMembers.length > 0
          ? fallbackRegionalMembers[index % fallbackRegionalMembers.length]
              ?.portraitSrc
          : "";
      const portraitSrc =
        readText(member.portraitSrc) ||
        fallbackPortrait ||
        fallbackCopy.portraitSrc;

      if (!name) {
        return null;
      }

      return {
        memberId,
        name,
        portraitSrc,
        role,
      };
    })
    .filter((member): member is ProfileRegionalMember => Boolean(member));

  // Keep current dummy values until backend adds regionalMembers.
  return fromApi.length > 0 ? fromApi : fallbackRegionalMembers;
}

export function buildProfileViewData({
  accountInfo,
  authUser,
  t,
}: BuildProfileViewDataArgs): ProfileViewData {
  const userName = readText(accountInfo?.user?.name) || readText(authUser.name);
  const enrollmentName = buildFullName([
    accountInfo?.enrollment?.personalInfo?.firstName,
    accountInfo?.enrollment?.personalInfo?.lastName,
  ]);
  const name = enrollmentName || userName || t("summary.memberFallback");
  const statusLabel = resolveEnrollmentStatus(t, accountInfo);
  const approvalDateLabel = resolveMemberSince(accountInfo);
  const memberSince = approvalDateLabel
    ? t("summary.memberSince", { date: approvalDateLabel })
    : undefined;
  const location = resolveLocation(accountInfo) || t("summary.notProvided");
  const birthDateLabel = formatDateLabel(
    accountInfo?.enrollment?.personalInfo?.dateOfBirth,
  );
  const details: ProfileDetail[] = [
    {
      iconSrc: fallbackDetails[0]?.iconSrc ?? "/icons/profile/member.svg",
      value:
        readText(accountInfo?.user?.publicId) ||
        readText(authUser.publicId) ||
        readText(accountInfo?.user?.id) ||
        readText(authUser.id) ||
        t("summary.notProvided"),
    },
    {
      iconSrc: fallbackDetails[1]?.iconSrc ?? "/icons/profile/location.svg",
      value: location,
    },
    {
      iconSrc: fallbackDetails[2]?.iconSrc ?? "/icons/profile/calendar.svg",
      value: t("summary.born", {
        date: birthDateLabel || t("summary.notAvailable"),
      }),
    },
  ];

  return {
    activityData: mapActivityData({ accountInfo, t }),
    copy: {
      memberSince,
      memberStatus: statusLabel,
      name,
      portraitSrc: resolvePortraitSrc(accountInfo),
    },
    details,
    kinshipData: mapKinshipData(t, accountInfo),
    overviewData: mapOverviewData(t, accountInfo),
    yucayekeData: mapYucayekeData(t, accountInfo),
    documentsData: mapDocumentsData(t, accountInfo),
    settingsData: mapSettingsData({ accountInfo, authUser, t }),
    regionalMembers: mapRegionalMembers(t, accountInfo),
  };
}
