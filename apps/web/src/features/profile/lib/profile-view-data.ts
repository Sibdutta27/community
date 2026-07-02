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

type BuildProfileViewDataArgs = Readonly<{
  accountInfo?: AccountInfoResponse | null;
  authUser: AuthUser;
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
const fallbackKinship = profileConfig.kinship;
const fallbackOverview = profileConfig.overview;
const fallbackYucayeke = profileConfig.yucayeke;
const fallbackDocuments = profileConfig.documents;
const fallbackActivity = profileConfig.activity;
const fallbackSettings = profileConfig.settings;
const fallbackRegionalMembers = profileConfig.regionalMembers;

const documentTypeLabels: Readonly<Record<EnrollmentDocumentType, string>> = {
  PROFILE_PICTURE: "Profile Picture",
  USER_PHOTO: "Your Photo",
  GENEALOGICAL_RECORDS: "Genealogical Records",
  KINSHIP_LETTERS: "Kinship Letters",
  ORAL_HISTORY: "Oral History",
  DNA_TESTING: "DNA Testing",
};

const missingValueLabel = "Not provided";
const notAvailableLabel = "Not available";
const emptyValueDash = "—";
const defaultEnrollmentStepCount = 4;

/**
 * Kinship groups in render order — mirrors the backend `AncestryRelation`
 * slots written by enrollment steps 2 (maternal) and 3 (paternal).
 */
const kinshipGroupDefinitions: readonly Readonly<{
  emptyMessage: string;
  relations: readonly Readonly<{
    label: string;
    relation: EnrollmentAncestryRelation;
  }>[];
  title: string;
}>[] = [
  {
    emptyMessage: "No maternal kinship recorded yet.",
    relations: [
      { label: "Mother", relation: "MOTHER" },
      { label: "Maternal Grandmother", relation: "MATERNAL_GRANDMOTHER" },
      { label: "Maternal Grandfather", relation: "MATERNAL_GRANDFATHER" },
    ],
    title: "Maternal Line",
  },
  {
    emptyMessage: "No paternal kinship recorded yet.",
    relations: [
      { label: "Father", relation: "FATHER" },
      { label: "Paternal Grandmother", relation: "PATERNAL_GRANDMOTHER" },
      { label: "Paternal Grandfather", relation: "PATERNAL_GRANDFATHER" },
    ],
    title: "Paternal Line",
  },
];

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

function formatBorikuaTainoLabel(value: boolean | null | undefined) {
  if (value === true) {
    return "Yes";
  }

  if (value === false) {
    return "No";
  }

  return emptyValueDash;
}

function buildAncestorFacts(
  ancestor: EnrollmentAncestrySummary,
): ProfileKinshipFact[] {
  const facts: ProfileKinshipFact[] = [];
  const municipality = readText(ancestor.municipality);
  const yucayeke = readText(ancestor.yucayeke);
  const nationality = readText(ancestor.nationality);
  const birthDate = formatDateLabel(ancestor.dateOfBirth);

  if (municipality) {
    facts.push({ label: "Municipality", value: municipality });
  }

  if (yucayeke) {
    facts.push({ label: "Yucayeke", value: yucayeke });
  }

  if (nationality) {
    facts.push({ label: "Nationality", value: nationality });
  }

  if (birthDate) {
    facts.push({ label: "Date of Birth", value: birthDate });
  }

  facts.push({
    label: "Borikua Taíno",
    value: formatBorikuaTainoLabel(ancestor.isBorikuaTaino),
  });

  return facts;
}

function mapKinshipGroupAncestors(
  ancestry: EnrollmentAncestryMap | undefined,
  relations: readonly Readonly<{
    label: string;
    relation: EnrollmentAncestryRelation;
  }>[],
): ProfileKinshipAncestor[] {
  const ancestors: ProfileKinshipAncestor[] = [];

  for (const { label, relation } of relations) {
    const ancestor = ancestry?.[relation];

    if (!hasAncestorContent(ancestor)) {
      continue;
    }

    ancestors.push({
      facts: buildAncestorFacts(ancestor),
      name: readText(ancestor.name) || emptyValueDash,
      relation: label,
    });
  }

  return ancestors;
}

function mapKinshipData(
  accountInfo?: AccountInfoResponse | null,
): ProfileKinshipData {
  const ancestry = accountInfo?.enrollment?.ancestry;

  return {
    description: fallbackKinship.description,
    groups: kinshipGroupDefinitions.map((group) => ({
      ancestors: mapKinshipGroupAncestors(ancestry, group.relations),
      emptyMessage: group.emptyMessage,
      title: group.title,
    })),
    title: fallbackKinship.title,
  };
}

function countRecordedAncestors(accountInfo?: AccountInfoResponse | null) {
  const ancestry = accountInfo?.enrollment?.ancestry;

  return kinshipGroupDefinitions.reduce(
    (count, group) =>
      count + mapKinshipGroupAncestors(ancestry, group.relations).length,
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

function getDocumentDisplayName(fileName: string) {
  const normalizedValue = readText(fileName);

  if (!normalizedValue) {
    return "Uploaded document";
  }

  const fileNameSegments = normalizedValue.split("/");

  return fileNameSegments[fileNameSegments.length - 1] || normalizedValue;
}

function getMissingRequiredDocuments(documentMap: DocumentMap) {
  const missingDocuments: string[] = [];

  if (documentMap.USER_PHOTO.length < 1) {
    missingDocuments.push("Your Photo");
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
  accountInfo?: AccountInfoResponse | null,
): ProfileOverviewData {
  const enrollment = accountInfo?.enrollment;
  const personalInfo = enrollment?.personalInfo;
  const contact = enrollment?.contact;
  const stepState = getResolvedStepState(accountInfo);
  const completedSteps = getCompletedStepsLabel(stepState);
  const totalDocuments = getDocumentCount(enrollment?.documents);
  const recordedAncestors = countRecordedAncestors(accountInfo);

  const enrollmentStatus =
    toStatusLabel(accountInfo?.enrollmentStatus ?? enrollment?.status) ||
    (accountInfo?.hasEnrollment ? "Enrollment In Progress" : "Not Started");

  const fullName = buildFullName([
    personalInfo?.firstName,
    personalInfo?.lastName,
  ]);
  const phoneTypeLabel = toStatusLabel(contact?.phoneType);
  const phoneLabel = formatPhoneLabel(contact?.phoneNumber);

  return {
    checklist: fallbackOverview.checklist.map((item, index) => {
      const stepKey = String(index + 1) as keyof EnrollmentStepState;
      return {
        completed: stepState?.[stepKey] ?? false,
        label: item.label,
      };
    }),
    contactFacts: [
      {
        ...fallbackOverview.contactFacts[0],
        value:
          readText(contact?.email) ||
          readText(accountInfo?.user?.email) ||
          missingValueLabel,
      },
      {
        ...fallbackOverview.contactFacts[1],
        value:
          phoneLabel && phoneTypeLabel
            ? `${phoneLabel} (${phoneTypeLabel})`
            : phoneLabel || missingValueLabel,
      },
    ],
    description: fallbackOverview.description,
    metrics: [
      {
        ...fallbackOverview.metrics[0],
        value: enrollmentStatus,
      },
      {
        ...fallbackOverview.metrics[1],
        value: completedSteps,
      },
      {
        ...fallbackOverview.metrics[2],
        value: String(totalDocuments),
      },
      {
        ...fallbackOverview.metrics[3],
        value: String(recordedAncestors),
      },
    ],
    personalFacts: [
      {
        ...fallbackOverview.personalFacts[0],
        value: fullName || missingValueLabel,
      },
      {
        ...fallbackOverview.personalFacts[1],
        value: readText(personalInfo?.occupation) || missingValueLabel,
      },
      {
        ...fallbackOverview.personalFacts[2],
        value: toStatusLabel(personalInfo?.maritalStatus) || missingValueLabel,
      },
      {
        ...fallbackOverview.personalFacts[3],
        value: toStatusLabel(personalInfo?.identity) || missingValueLabel,
      },
    ],
    title: fallbackOverview.title,
  };
}

function mapYucayekeData(
  accountInfo?: AccountInfoResponse | null,
): ProfileYucayekeData {
  const enrollment = accountInfo?.enrollment;
  const personalInfo = enrollment?.personalInfo;
  const stepState = getResolvedStepState(accountInfo);
  const completedSteps = getCompletedStepsLabel(stepState);
  const totalDocuments = getDocumentCount(enrollment?.documents);
  const recordedAncestors = countRecordedAncestors(accountInfo);
  const kinshipData = mapKinshipData(accountInfo);
  const declaredYucayeke = readText(personalInfo?.yucayeke);
  const communityName = declaredYucayeke
    ? `Yucayeke ${declaredYucayeke}`
    : personalInfo?.yucayekeUnknown
      ? "Yucayeke Unknown"
      : "Yucayeke";
  const requiredConsents = (enrollment?.consent ?? []).filter(
    (consent) => consent.required,
  );
  const acceptedRequiredConsentsCount = requiredConsents.filter(
    (consent) => consent.accepted,
  ).length;
  const contactMethod =
    formatPhoneLabel(enrollment?.contact?.phoneNumber) ||
    readText(enrollment?.contact?.email) ||
    readText(accountInfo?.user?.email);
  const statusLabel =
    toStatusLabel(accountInfo?.enrollmentStatus ?? enrollment?.status) ||
    (accountInfo?.hasEnrollment ? "Enrollment In Progress" : "Not Started");

  const circles = [
    {
      detail: resolveLocation(accountInfo) || missingValueLabel,
      name:
        buildFullName([personalInfo?.firstName, personalInfo?.lastName]) ||
        readText(accountInfo?.user?.name) ||
        "Member",
      role: "You",
    },
    ...kinshipData.groups.flatMap((group) =>
      group.ancestors.map((ancestor) => ({
        detail:
          ancestor.facts.find((fact) => fact.label === "Municipality")
            ?.value ??
          ancestor.facts.find((fact) => fact.label === "Nationality")?.value ??
          missingValueLabel,
        name: ancestor.name,
        role: ancestor.relation,
      })),
    ),
  ];

  return {
    circles,
    communityName,
    description: fallbackYucayeke.description,
    metrics: [
      {
        ...fallbackYucayeke.metrics[0],
        value: completedSteps,
      },
      {
        ...fallbackYucayeke.metrics[1],
        value: String(recordedAncestors),
      },
      {
        ...fallbackYucayeke.metrics[2],
        value: String(totalDocuments),
      },
      {
        ...fallbackYucayeke.metrics[3],
        value: `${acceptedRequiredConsentsCount} / ${requiredConsents.length}`,
      },
    ],
    rhythm: [
      {
        ...fallbackYucayeke.rhythm[0],
        value: statusLabel,
      },
      {
        ...fallbackYucayeke.rhythm[1],
        value: contactMethod || missingValueLabel,
      },
      {
        ...fallbackYucayeke.rhythm[2],
        value: toStatusLabel(personalInfo?.identity) || missingValueLabel,
      },
      {
        ...fallbackYucayeke.rhythm[3],
        value:
          formatDateLabel(accountInfo?.lastUpdatedAt) ||
          formatDateLabel(accountInfo?.user?.updatedAt) ||
          missingValueLabel,
      },
    ],
    territoryFacts: [
      {
        ...fallbackYucayeke.territoryFacts[0],
        value: readText(personalInfo?.cityOfBirth) || missingValueLabel,
      },
      {
        ...fallbackYucayeke.territoryFacts[1],
        value:
          readText(personalInfo?.municipalityOfBirth) || missingValueLabel,
      },
      {
        ...fallbackYucayeke.territoryFacts[2],
        value: readText(personalInfo?.countryOfBirth) || missingValueLabel,
      },
      {
        ...fallbackYucayeke.territoryFacts[3],
        value:
          declaredYucayeke ||
          (personalInfo?.yucayekeUnknown ? "Unknown" : missingValueLabel),
      },
    ],
    title: fallbackYucayeke.title,
  };
}

function mapDocumentsData(
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
        ...fallbackDocuments.categories[0],
        count: String(documentMap.USER_PHOTO.length),
      },
      {
        ...fallbackDocuments.categories[1],
        count: String(documentMap.GENEALOGICAL_RECORDS.length),
      },
      {
        ...fallbackDocuments.categories[2],
        count: String(documentMap.KINSHIP_LETTERS.length),
      },
      {
        ...fallbackDocuments.categories[3],
        count: String(documentMap.ORAL_HISTORY.length),
      },
      {
        ...fallbackDocuments.categories[4],
        count: String(documentMap.DNA_TESTING.length),
      },
    ],
    description: fallbackDocuments.description,
    metrics: [
      {
        ...fallbackDocuments.metrics[0],
        value: String(allDocuments.length),
      },
      {
        ...fallbackDocuments.metrics[1],
        value: getRequiredCoverageValue(documentMap),
      },
      {
        ...fallbackDocuments.metrics[2],
        value: String(approvedCount),
      },
      {
        ...fallbackDocuments.metrics[3],
        value: String(pendingCount),
      },
    ],
    missingRequired: getMissingRequiredDocuments(documentMap),
    title: fallbackDocuments.title,
    uploads: allDocuments.slice(0, 8).map((document) => ({
      category: documentTypeLabels[document.type],
      id: document.id,
      name: getDocumentDisplayName(document.fileName),
      size: formatDocumentFileSize(document.fileSize),
      status: toStatusLabel(document.status) || "Pending",
      uploadedAt: formatDateLabel(document.uploadedAt) || "Unknown date",
      url: document.url,
    })),
  };
}

function mapActivityData({
  accountInfo,
}: Readonly<{
  accountInfo?: AccountInfoResponse | null;
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
      description: "Your profile account was created.",
      id: "activity-account-created",
      rawDate: accountCreatedAt,
      timestamp: getTimeValue(accountCreatedAt),
      title: "Account Created",
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
      description: `${consent.title} accepted.`,
      id: `activity-consent-${consent.id}`,
      rawDate: consent.acceptedAt,
      timestamp: getTimeValue(consent.acceptedAt),
      title: "Consent Accepted",
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
      description: `${getDocumentDisplayName(document.fileName)} (${formatDocumentFileSize(document.fileSize)}) · ${toStatusLabel(document.status) || "Pending"}.`,
      id: `activity-document-${document.id}`,
      rawDate: document.uploadedAt,
      timestamp: getTimeValue(document.uploadedAt),
      title: `${documentTypeLabels[document.type]} Uploaded`,
      tone,
    });
  }

  const sortedEvents = events
    .filter((event) => event.timestamp > 0)
    .sort(
      (leftEvent, rightEvent) => rightEvent.timestamp - leftEvent.timestamp,
    );
  const latestEventDate = sortedEvents[0]?.rawDate;
  const missingRequiredDocuments = getMissingRequiredDocuments(documentMap);
  const nextActions: string[] = [];

  if (stepState && !stepState["3"]) {
    nextActions.push("Complete Paternal Kinship in Step 3.");
  }

  if (missingRequiredDocuments.length > 0) {
    nextActions.push("Upload missing required documents in Step 4.");
  }

  if (pendingDocumentsCount > 0) {
    nextActions.push("Check pending document review updates.");
  }

  return {
    description: fallbackActivity.description,
    events: sortedEvents.slice(0, 8).map((event) => ({
      dateLabel:
        formatDateTimeLabel(event.rawDate) ||
        formatDateLabel(event.rawDate) ||
        "Unknown date",
      description: event.description,
      id: event.id,
      title: event.title,
      tone: event.tone,
    })),
    metrics: [
      {
        ...fallbackActivity.metrics[0],
        value: String(sortedEvents.length),
      },
      {
        ...fallbackActivity.metrics[1],
        value: completedSteps,
      },
      {
        ...fallbackActivity.metrics[2],
        value: String(pendingDocumentsCount),
      },
      {
        ...fallbackActivity.metrics[3],
        value:
          formatDateLabel(latestEventDate) ||
          formatDateLabel(accountInfo?.lastUpdatedAt) ||
          formatDateLabel(accountInfo?.user?.updatedAt) ||
          fallbackActivity.metrics[3].value,
      },
    ],
    nextActions,
    title: fallbackActivity.title,
  };
}

function mapSettingsData({
  accountInfo,
  authUser,
}: Readonly<{
  accountInfo?: AccountInfoResponse | null;
  authUser: AuthUser;
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
  const enrollmentStatus =
    toStatusLabel(accountInfo?.enrollmentStatus ?? enrollment?.status) ||
    (accountInfo?.hasEnrollment ? "Enrollment In Progress" : "Not Started");

  return {
    accountFacts: [
      {
        ...fallbackSettings.accountFacts[0],
        value: memberId || missingValueLabel,
      },
      {
        ...fallbackSettings.accountFacts[1],
        value: email || missingValueLabel,
      },
      {
        ...fallbackSettings.accountFacts[2],
        value: phone || missingValueLabel,
      },
      {
        ...fallbackSettings.accountFacts[3],
        value: enrollmentStatus,
      },
      {
        ...fallbackSettings.accountFacts[4],
        value: completedSteps,
      },
    ],
    description: fallbackSettings.description,
    preferences: [
      {
        ...fallbackSettings.preferences[0],
        enabled: Boolean(email),
      },
      {
        ...fallbackSettings.preferences[1],
        enabled: Boolean(enrollment?.contact?.allowSMS),
      },
      {
        ...fallbackSettings.preferences[2],
        enabled: pendingDocumentsCount > 0,
      },
      {
        ...fallbackSettings.preferences[3],
        enabled: Boolean(stepState),
      },
    ],
    securityItems: [
      {
        ...fallbackSettings.securityItems[0],
        description:
          requiredConsents.length > 0
            ? hasAllRequiredConsents
              ? "All required consents accepted for this profile."
              : "Some required consents are still pending."
            : "No required consent records found yet.",
        statusLabel:
          requiredConsents.length > 0
            ? `${acceptedRequiredConsentsCount}/${requiredConsents.length} Accepted`
            : "0/0 Accepted",
        tone:
          requiredConsents.length > 0
            ? hasAllRequiredConsents
              ? "good"
              : "warn"
            : "neutral",
      },
      {
        ...fallbackSettings.securityItems[1],
        description:
          pendingDocumentsCount > 0
            ? "Pending document reviews may require follow-up."
            : "No pending document reviews at the moment.",
        statusLabel:
          pendingDocumentsCount > 0
            ? `${pendingDocumentsCount} Pending`
            : `${approvedDocumentsCount} Approved`,
        tone: pendingDocumentsCount > 0 ? "warn" : "good",
      },
      {
        ...fallbackSettings.securityItems[2],
        description: enrollment
          ? "Account is active and connected to enrollment data."
          : "Account is active, but enrollment has not been started yet.",
        statusLabel: enrollment ? "Active" : "Limited",
        tone: enrollment ? "good" : "neutral",
      },
    ],
    title: fallbackSettings.title,
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
  accountInfo: AccountInfoResponse | null | undefined,
): readonly ProfileRegionalMember[] {
  const fromApi = (accountInfo?.regionalMembers ?? [])
    .map((member, index) => {
      const memberId =
        readText(member.memberId) || readText(member.id) || missingValueLabel;
      const name = readText(member.name);
      const locationLabel = formatRegionalMemberLocation(member.location);
      const role = readText(member.role) || locationLabel || "Regional Member";
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
}: BuildProfileViewDataArgs): ProfileViewData {
  const userName = readText(accountInfo?.user?.name) || readText(authUser.name);
  const enrollmentName = buildFullName([
    accountInfo?.enrollment?.personalInfo?.firstName,
    accountInfo?.enrollment?.personalInfo?.lastName,
  ]);
  const name = enrollmentName || userName || "Member";
  const statusLabel =
    toStatusLabel(
      accountInfo?.enrollmentStatus ?? accountInfo?.enrollment?.status,
    ) ||
    (accountInfo?.hasEnrollment ? "Enrollment In Progress" : "Not Started");
  const approvalDateLabel = resolveMemberSince(accountInfo);
  const memberSince = approvalDateLabel
    ? `Member since ${approvalDateLabel}`
    : undefined;
  const location = resolveLocation(accountInfo) || missingValueLabel;
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
        missingValueLabel,
    },
    {
      iconSrc: fallbackDetails[1]?.iconSrc ?? "/icons/profile/location.svg",
      value: location,
    },
    {
      iconSrc: fallbackDetails[2]?.iconSrc ?? "/icons/profile/calendar.svg",
      value: birthDateLabel
        ? `Born: ${birthDateLabel}`
        : `Born: ${notAvailableLabel}`,
    },
  ];

  return {
    activityData: mapActivityData({ accountInfo }),
    copy: {
      memberSince,
      memberStatus: statusLabel,
      name,
      portraitSrc: resolvePortraitSrc(accountInfo),
    },
    details,
    kinshipData: mapKinshipData(accountInfo),
    overviewData: mapOverviewData(accountInfo),
    yucayekeData: mapYucayekeData(accountInfo),
    documentsData: mapDocumentsData(accountInfo),
    settingsData: mapSettingsData({ accountInfo, authUser }),
    regionalMembers: mapRegionalMembers(accountInfo),
  };
}
