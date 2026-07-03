import { format, isValid, parseISO } from "date-fns";
import { z } from "zod";

import type {
  EnrollmentGenderValue,
  EnrollmentIdentityValue,
  EnrollmentMaritalStatusValue,
  EnrollmentSexValue,
  EnrollmentStepOnePrefillResponse,
  EnrollmentStepOneSaveDraftRequest,
  EnrollmentStepOneUpsertRequest,
} from "@/types/enrollment";

const dateInputPattern = /^\d{4}-\d{2}-\d{2}$/;

export const enrollmentStepOneSexValues = [
  "MALE",
  "FEMALE",
  "INTERSEX",
  "PREFER_NOT_TO_SAY",
] as const;

export const enrollmentStepOneSexOptions = [
  { label: "Male", value: "MALE" },
  { label: "Female", value: "FEMALE" },
  { label: "Intersex", value: "INTERSEX" },
  { label: "Prefer not to say", value: "PREFER_NOT_TO_SAY" },
] as const;

export const enrollmentStepOneGenderValues = [
  "MALE",
  "FEMALE",
  "NON_BINARY",
  "TWO_SPIRIT",
  "SELF_DESCRIBE",
  "PREFER_NOT_TO_SAY",
  "OTHER",
] as const;

export const enrollmentStepOneGenderOptions = [
  { label: "Male", value: "MALE" },
  { label: "Female", value: "FEMALE" },
  { label: "Non-binary", value: "NON_BINARY" },
  { label: "Two-Spirit", value: "TWO_SPIRIT" },
  { label: "Self-describe", value: "SELF_DESCRIBE" },
  { label: "Prefer not to say", value: "PREFER_NOT_TO_SAY" },
  { label: "Other", value: "OTHER" },
] as const;

export const enrollmentStepOneMaritalStatusValues = [
  "SINGLE",
  "MARRIED",
  "DIVORCED",
  "WIDOWED",
  "DOMESTIC_PARTNERSHIP",
] as const;

export const enrollmentStepOneMaritalStatusOptions = [
  { label: "Single", value: "SINGLE" },
  { label: "Married", value: "MARRIED" },
  { label: "Divorced", value: "DIVORCED" },
  { label: "Widowed", value: "WIDOWED" },
  { label: "Domestic Partnership", value: "DOMESTIC_PARTNERSHIP" },
] as const;

export const enrollmentStepOneIdentityValues = [
  "ARAWAK",
  "KALINAGO",
  "GARIFUNA",
  "TAINO",
] as const;

export const enrollmentStepOneIdentityOptions = [
  { label: "Arawak", value: "ARAWAK" },
  { label: "Kalinago", value: "KALINAGO" },
  { label: "Garifuna", value: "GARIFUNA" },
  { label: "Taíno", value: "TAINO" },
] as const;

export const enrollmentStepOneYesNoValues = ["YES", "NO"] as const;

export const enrollmentStepOneYesNoOptions = [
  { label: "Yes", value: "YES" },
  { label: "No", value: "NO" },
] as const;

const requiredString = (label: string) =>
  z.string().trim().min(1, `${label} is required`);
const optionalString = z.string().trim();

function createOptionalSelectionSchema<
  TValues extends readonly [string, ...string[]],
>(label: string, allowedValues: TValues) {
  return optionalString.refine(
    (value) =>
      value === "" ||
      allowedValues.includes(normalizeSelectionValue(value) as TValues[number]),
    `Select a valid ${label.toLowerCase()}`,
  );
}

const requiredDateString = (label: string) =>
  requiredString(label).refine((value) => {
    const parsedDate = parseISO(value);

    return isValid(parsedDate) && format(parsedDate, "yyyy-MM-dd") === value;
  }, "Enter a valid date");

/**
 * Step 1 — Demographics. Flat schema matching the backend
 * `POST /enrollment/step1/upsert` contract: only first/last name, birth
 * date + place, sex/gender, marital status/occupation, and the Yucayekeno
 * questions are captured.
 */
export const enrollmentStepOneSchema = z.object({
  firstName: requiredString("First name"),
  lastName: requiredString("Last name"),
  dateOfBirth: requiredDateString("Date of birth"),
  cityOfBirth: requiredString("City or town of birth"),
  municipalityOfBirth: requiredString("Municipality of birth"),
  countryOfBirth: requiredString("Country of birth"),
  sex: createOptionalSelectionSchema("sex", enrollmentStepOneSexValues),
  gender: createOptionalSelectionSchema(
    "gender identity",
    enrollmentStepOneGenderValues,
  ),
  maritalStatus: createOptionalSelectionSchema(
    "marital status",
    enrollmentStepOneMaritalStatusValues,
  ),
  occupation: optionalString,
  identity: createOptionalSelectionSchema(
    "identity",
    enrollmentStepOneIdentityValues,
  ),
  yucayeke: optionalString,
  yucayekeUnknown: z.boolean(),
  hasChildren: createOptionalSelectionSchema(
    "answer",
    enrollmentStepOneYesNoValues,
  ),
  hasMinorChildren: createOptionalSelectionSchema(
    "answer",
    enrollmentStepOneYesNoValues,
  ),
});

export type EnrollmentStepOneFormValues = z.infer<
  typeof enrollmentStepOneSchema
>;

function readString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function readBoolean(value: unknown, fallback = false) {
  return typeof value === "boolean" ? value : fallback;
}

function trimValue(value: string) {
  return value.trim();
}

function toOptionalString(value: string) {
  const trimmedValue = trimValue(value);

  return trimmedValue || undefined;
}

function booleanToYesNo(value: unknown): "YES" | "NO" | "" {
  if (value === true) {
    return "YES";
  }

  if (value === false) {
    return "NO";
  }

  return "";
}

function yesNoToBoolean(value: string): boolean | undefined {
  if (value === "YES") {
    return true;
  }

  if (value === "NO") {
    return false;
  }

  return undefined;
}

function normalizeSelectionValue(value: string) {
  return trimValue(value)
    .replace(/[\s-]+/g, "_")
    .toUpperCase();
}

function normalizeKnownSelection<TValues extends readonly string[]>(
  value: unknown,
  allowedValues: TValues,
) {
  const normalizedValue = normalizeSelectionValue(readString(value));

  return allowedValues.includes(normalizedValue as TValues[number])
    ? (normalizedValue as TValues[number])
    : "";
}

function resolveOptionalSelection<TValues extends readonly string[]>(
  value: string,
  allowedValues: TValues,
) {
  const normalizedValue = normalizeKnownSelection(value, allowedValues);

  return normalizedValue || undefined;
}

function normalizeDateInputValue(value: unknown) {
  const normalizedValue = trimValue(readString(value));

  if (!normalizedValue) {
    return "";
  }

  if (dateInputPattern.test(normalizedValue)) {
    return normalizedValue;
  }

  const isoDatePrefix = normalizedValue.slice(0, 10);

  if (dateInputPattern.test(isoDatePrefix)) {
    return isoDatePrefix;
  }

  const parsedDate = parseISO(normalizedValue);

  return isValid(parsedDate) ? format(parsedDate, "yyyy-MM-dd") : "";
}

function toIsoDateString(value: string) {
  return `${trimValue(value)}T00:00:00.000Z`;
}

export function getEnrollmentStepOneDefaultValues(
  stepOneData?: EnrollmentStepOnePrefillResponse | null,
): EnrollmentStepOneFormValues {
  return {
    firstName: readString(stepOneData?.firstName),
    lastName: readString(stepOneData?.lastName),
    dateOfBirth: normalizeDateInputValue(stepOneData?.dateOfBirth),
    cityOfBirth: readString(stepOneData?.cityOfBirth),
    municipalityOfBirth: readString(stepOneData?.municipalityOfBirth),
    countryOfBirth: readString(stepOneData?.countryOfBirth),
    sex: normalizeKnownSelection(stepOneData?.sex, enrollmentStepOneSexValues),
    gender: normalizeKnownSelection(
      stepOneData?.gender,
      enrollmentStepOneGenderValues,
    ),
    maritalStatus: normalizeKnownSelection(
      stepOneData?.maritalStatus,
      enrollmentStepOneMaritalStatusValues,
    ),
    occupation: readString(stepOneData?.occupation),
    identity: normalizeKnownSelection(
      stepOneData?.identity,
      enrollmentStepOneIdentityValues,
    ),
    yucayeke: readString(stepOneData?.yucayeke),
    yucayekeUnknown: readBoolean(stepOneData?.yucayekeUnknown),
    hasChildren: booleanToYesNo(stepOneData?.hasChildren),
    hasMinorChildren: booleanToYesNo(stepOneData?.hasMinorChildren),
  };
}

/**
 * The always-optional slice of the step 1 payload (shared by the full upsert
 * and the partial draft): selections, occupation and the Yucayekeno answers,
 * with empties omitted.
 */
function buildStepOneOptionalPayloadFields(
  values: EnrollmentStepOneFormValues,
) {
  const sex = resolveOptionalSelection(
    values.sex,
    enrollmentStepOneSexValues,
  ) as EnrollmentSexValue | undefined;
  const gender = resolveOptionalSelection(
    values.gender,
    enrollmentStepOneGenderValues,
  ) as EnrollmentGenderValue | undefined;
  const maritalStatus = resolveOptionalSelection(
    values.maritalStatus,
    enrollmentStepOneMaritalStatusValues,
  ) as EnrollmentMaritalStatusValue | undefined;
  const occupation = toOptionalString(values.occupation);
  const identity = resolveOptionalSelection(
    values.identity,
    enrollmentStepOneIdentityValues,
  ) as EnrollmentIdentityValue | undefined;
  const yucayekeUnknown = values.yucayekeUnknown;
  const yucayeke = yucayekeUnknown
    ? undefined
    : toOptionalString(values.yucayeke);
  const hasChildren = yesNoToBoolean(values.hasChildren);
  // When the user answers "No" to having children, send an explicit false so a
  // previously saved hasMinorChildren value is cleared instead of kept stale.
  const hasMinorChildren =
    hasChildren === undefined
      ? undefined
      : hasChildren
        ? yesNoToBoolean(values.hasMinorChildren)
        : false;

  return {
    ...(sex ? { sex } : {}),
    ...(gender ? { gender } : {}),
    ...(maritalStatus ? { maritalStatus } : {}),
    ...(occupation ? { occupation } : {}),
    ...(identity ? { identity } : {}),
    ...(yucayeke ? { yucayeke } : {}),
    yucayekeUnknown,
    ...(hasChildren !== undefined ? { hasChildren } : {}),
    ...(hasMinorChildren !== undefined ? { hasMinorChildren } : {}),
  };
}

export function mapEnrollmentStepOneFormToPayload(
  values: EnrollmentStepOneFormValues,
): EnrollmentStepOneUpsertRequest {
  return {
    firstName: trimValue(values.firstName),
    lastName: trimValue(values.lastName),
    dateOfBirth: toIsoDateString(values.dateOfBirth),
    cityOfBirth: trimValue(values.cityOfBirth),
    municipalityOfBirth: trimValue(values.municipalityOfBirth),
    countryOfBirth: trimValue(values.countryOfBirth),
    ...buildStepOneOptionalPayloadFields(values),
  };
}

/**
 * Partial draft payload for "Save & finish later": identical mapping to the
 * full payload, except the required fields are simply OMITTED when empty
 * (never validated) so any subset of the form can be saved.
 */
export function mapEnrollmentStepOneFormToDraftPayload(
  values: EnrollmentStepOneFormValues,
): EnrollmentStepOneSaveDraftRequest {
  const firstName = toOptionalString(values.firstName);
  const lastName = toOptionalString(values.lastName);
  const dateOfBirth = normalizeDateInputValue(values.dateOfBirth);
  const cityOfBirth = toOptionalString(values.cityOfBirth);
  const municipalityOfBirth = toOptionalString(values.municipalityOfBirth);
  const countryOfBirth = toOptionalString(values.countryOfBirth);

  return {
    ...(firstName ? { firstName } : {}),
    ...(lastName ? { lastName } : {}),
    ...(dateOfBirth ? { dateOfBirth: toIsoDateString(dateOfBirth) } : {}),
    ...(cityOfBirth ? { cityOfBirth } : {}),
    ...(municipalityOfBirth ? { municipalityOfBirth } : {}),
    ...(countryOfBirth ? { countryOfBirth } : {}),
    ...buildStepOneOptionalPayloadFields(values),
  };
}
