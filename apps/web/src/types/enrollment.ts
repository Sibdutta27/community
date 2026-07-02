export type ActiveConsent = Readonly<{
  id: string;
  key: string;
  title: string;
  content: string;
  required: boolean;
  version: number;
}>;

export type ConsentAcceptRequest = Readonly<{
  acceptRequired: boolean;
}>;

export type EnrollmentStepKey = "1" | "2" | "3" | "4" | "5";

export type EnrollmentStepState = Readonly<Record<EnrollmentStepKey, boolean>>;

export type AccountInfoUser = Readonly<{
  id: string;
  publicId?: string | null;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}>;

export type AccountEnrollmentConsent = Readonly<{
  id: string;
  key: string;
  version: number;
  title: string;
  accepted: boolean;
  acceptedAt: string | null;
  required: boolean;
}>;

export type EnrollmentDocumentType =
  | "PROFILE_PICTURE"
  | "USER_PHOTO"
  | "GENEALOGICAL_RECORDS"
  | "KINSHIP_LETTERS"
  | "ORAL_HISTORY"
  | "DNA_TESTING";

export type EnrollmentDocumentStatus = string;

export type EnrollmentDocumentRecord = Readonly<{
  id: string;
  type: EnrollmentDocumentType;
  status: EnrollmentDocumentStatus;
  fileName: string;
  fileKey: string;
  fileSize: number;
  mimeType?: string | null;
  url: string;
  verifiedByAdmin: boolean;
  rejectedReason: string | null;
  uploadedAt: string;
}>;

export type EnrollmentDocumentBucket = Readonly<{
  type: EnrollmentDocumentType;
  isSingle: boolean;
  documents: EnrollmentDocumentRecord | EnrollmentDocumentRecord[] | null;
}>;

export type EnrollmentPersonalInfoSummary = Readonly<{
  firstName: string | null;
  middleName: string | null;
  lastName: string | null;
  preferredName: string | null;
  maternalLastName: string | null;
  dateOfBirth: string | null;
  cityOfBirth: string | null;
  municipalityOfBirth: string | null;
  countryOfBirth: string | null;
  gender: string | null;
  pronouns: string | null;
  maritalStatus: string | null;
  occupation: string | null;
  educationLevel: string | null;
  languagesSpoken: string[];
  specialSkills: string | null;
}>;

export type EnrollmentContactSummary = Readonly<{
  email: string | null;
  phoneNumber: string | null;
  phoneType: string | null;
  allowSMS: boolean | null;
}>;

export type EnrollmentAddressSummary = Readonly<{
  type?: string | null;
  street: string | null;
  apartment: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  country: string | null;
  yearsLived: string | null;
}>;

export type EnrollmentEmergencyContactSummary = Readonly<{
  fullName: string | null;
  relationship: string | null;
  phoneNumber: string | null;
}>;

export type EnrollmentMaternalLineageRelationValue =
  | "MOTHER"
  | "GRANDMOTHER"
  | "GREAT_GRANDMOTHER"
  | "GREAT_GREAT_GRANDMOTHER"
  | "GREAT_GREAT_GREAT_GRANDMOTHER";

export type EnrollmentMaternalLineageLivingStatusValue = "LIVING" | "DECEASED";

export type EnrollmentMaternalLineageSummary = Readonly<{
  id?: string | null;
  relation: EnrollmentMaternalLineageRelationValue | null;
  fullName: string | null;
  maidenName: string | null;
  dateOfBirth: string | null;
  placeOfBirth: string | null;
  // Backend payload currently may return "LivingStatus" (capital L) in /account/info.
  LivingStatus?: EnrollmentMaternalLineageLivingStatusValue | null;
  livingStatus: EnrollmentMaternalLineageLivingStatusValue | null;
  approximateBirthYear: number | null;
  regionOfOrigin: string | null;
  familyOccupation: string | null;
  additionalNotes: string | null;
}>;

export type EnrollmentCulturalConnectionSummary = Readonly<{
  id?: string | null;
  key: string | null;
  description: string | null;
}>;

export type AccountEnrollmentInfo = Readonly<{
  id: string;
  status: string;
  consentAccepted: boolean;
  approvalDate?: string | null;
  user: AccountInfoUser;
  personalInfo: EnrollmentPersonalInfoSummary | null;
  contact: EnrollmentContactSummary | null;
  addresses: EnrollmentAddressSummary[];
  emergencyContact: EnrollmentEmergencyContactSummary | null;
  maternalLineages: EnrollmentMaternalLineageSummary[];
  culturalConnections: EnrollmentCulturalConnectionSummary[];
  consent: AccountEnrollmentConsent[];
  documents: EnrollmentDocumentBucket[];
  steps: EnrollmentStepState;
}>;

export type RegionalMemberLocation = Readonly<{
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
}>;

export type RegionalMemberSummary = Readonly<{
  id?: string | null;
  memberId?: string | null;
  name?: string | null;
  portraitSrc?: string | null;
  role?: string | null;
  location?: RegionalMemberLocation | null;
}>;

export type AccountInfoResponse = Readonly<{
  user: AccountInfoUser;
  enrollment: AccountEnrollmentInfo | null;
  enrollmentStep?: EnrollmentStepState | null;
  enrollmentStatus?: string | null;
  hasEnrollment: boolean;
  avatarUrl?: string | null;
  memberSinceDate?: string | null;
  lastUpdatedAt?: string | null;
  regionalMembers?: readonly RegionalMemberSummary[];
}>;

export type ProfileResponse = AccountInfoResponse;

export type EnrollmentSexValue =
  | "MALE"
  | "FEMALE"
  | "INTERSEX"
  | "PREFER_NOT_TO_SAY";

export type EnrollmentGenderValue =
  | "MALE"
  | "FEMALE"
  | "NON_BINARY"
  | "TWO_SPIRIT"
  | "SELF_DESCRIBE"
  | "PREFER_NOT_TO_SAY"
  | "OTHER";

export type EnrollmentMaritalStatusValue =
  | "SINGLE"
  | "MARRIED"
  | "DIVORCED"
  | "WIDOWED"
  | "DOMESTIC_PARTNERSHIP";

export type EnrollmentIdentityValue =
  | "ARAWAK"
  | "KALINAGO"
  | "GARIFUNA"
  | "TAINO";

/**
 * Step 1 — Demographics. Flat body matching the backend
 * `POST /enrollment/step1/upsert` DTO exactly.
 */
export type EnrollmentStepOneUpsertRequest = Readonly<{
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  cityOfBirth: string;
  municipalityOfBirth: string;
  countryOfBirth: string;
  sex?: EnrollmentSexValue;
  gender?: EnrollmentGenderValue;
  maritalStatus?: EnrollmentMaritalStatusValue;
  occupation?: string;
  identity?: EnrollmentIdentityValue;
  yucayeke?: string;
  yucayekeUnknown?: boolean;
  hasChildren?: boolean;
  hasMinorChildren?: boolean;
}>;

/** `GET /enrollment/step1/` returns the same flat fields (nullable). */
export type EnrollmentStepOnePrefillResponse = Readonly<{
  firstName?: string | null;
  lastName?: string | null;
  dateOfBirth?: string | null;
  cityOfBirth?: string | null;
  municipalityOfBirth?: string | null;
  countryOfBirth?: string | null;
  sex?: string | null;
  gender?: string | null;
  maritalStatus?: string | null;
  occupation?: string | null;
  identity?: string | null;
  yucayeke?: string | null;
  yucayekeUnknown?: boolean | null;
  hasChildren?: boolean | null;
  hasMinorChildren?: boolean | null;
}>;

export type EnrollmentStepOneUpsertResponse = Readonly<{
  success: boolean;
}>;

/**
 * One kinship person captured in the maternal (step 2) or paternal (step 3)
 * form. `dateOfBirth` is only sent for the parent (mother / father) slot.
 */
export type EnrollmentAncestryInput = Readonly<{
  name?: string;
  dateOfBirth?: string;
  nationality?: string;
  municipality?: string;
  yucayeke?: string;
  isBorikuaTaino?: boolean;
}>;

/** A persisted Ancestry row as returned by the step 2/3 prefill endpoints. */
export type EnrollmentAncestrySummary = Readonly<{
  name?: string | null;
  dateOfBirth?: string | null;
  nationality?: string | null;
  municipality?: string | null;
  yucayeke?: string | null;
  isBorikuaTaino?: boolean | null;
}>;

/** Step 2 — Maternal Kinship (`POST /enrollment/step2/upsert`). */
export type EnrollmentStepTwoUpsertRequest = Readonly<{
  mother: EnrollmentAncestryInput;
  maternalGrandmother: EnrollmentAncestryInput;
  maternalGrandfather: EnrollmentAncestryInput;
}>;

/** `GET /enrollment/step2/` — each ancestor is null until saved. */
export type EnrollmentStepTwoPrefillResponse = Readonly<{
  mother?: EnrollmentAncestrySummary | null;
  maternalGrandmother?: EnrollmentAncestrySummary | null;
  maternalGrandfather?: EnrollmentAncestrySummary | null;
}>;

export type EnrollmentStepTwoUpsertResponse = Readonly<{
  success: boolean;
}>;

/** Step 3 — Paternal Kinship (`POST /enrollment/step3/upsert`). */
export type EnrollmentStepThreeUpsertRequest = Readonly<{
  father: EnrollmentAncestryInput;
  paternalGrandmother: EnrollmentAncestryInput;
  paternalGrandfather: EnrollmentAncestryInput;
}>;

/** `GET /enrollment/step3/` — each ancestor is null until saved. */
export type EnrollmentStepThreePrefillResponse = Readonly<{
  father?: EnrollmentAncestrySummary | null;
  paternalGrandmother?: EnrollmentAncestrySummary | null;
  paternalGrandfather?: EnrollmentAncestrySummary | null;
}>;

export type EnrollmentStepThreeUpsertResponse = Readonly<{
  success: boolean;
}>;

export type EnrollmentStepFourNextResponse = Readonly<{
  success: boolean;
  error?: string;
}>;

export type EnrollmentCompleteRequest = Readonly<{
  signatureName: string;
  signatureDate: string;
  agreedToTerms: boolean;
}>;

export type EnrollmentCompleteResponse = Readonly<{
  success: boolean;
  message?: string;
}>;

export type EnrollmentDocumentListResponse =
  readonly EnrollmentDocumentBucket[];

export type EnrollmentDocumentUploadResponse = Readonly<{
  message: string;
  document: EnrollmentDocumentRecord;
}>;
