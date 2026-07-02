import { format, isValid, parseISO } from "date-fns";
import { z } from "zod";

import type {
  EnrollmentAncestryInput,
  EnrollmentAncestrySummary,
} from "@/types/enrollment";

const dateInputPattern = /^\d{4}-\d{2}-\d{2}$/;

export const enrollmentKinshipYesNoValues = ["YES", "NO"] as const;

export const enrollmentKinshipYesNoOptions = [
  { label: "Yes", value: "YES" },
  { label: "No", value: "NO" },
] as const;

const optionalString = z.string().trim();

const optionalYesNoString = optionalString.refine(
  (value) =>
    value === "" ||
    enrollmentKinshipYesNoValues.includes(
      value as (typeof enrollmentKinshipYesNoValues)[number],
    ),
  "Select Yes or No",
);

const optionalDateString = optionalString.refine((value) => {
  if (value === "") {
    return true;
  }

  const parsedDate = parseISO(value);

  return isValid(parsedDate) && format(parsedDate, "yyyy-MM-dd") === value;
}, "Enter a valid date");

/** A grandparent kinship person — no date of birth captured. */
export const kinshipPersonSchema = z.object({
  name: optionalString,
  nationality: optionalString,
  municipality: optionalString,
  yucayeke: optionalString,
  isBorikuaTaino: optionalYesNoString,
});

/** The parent (mother / father) — same shape plus an optional date of birth. */
export const kinshipParentSchema = kinshipPersonSchema.extend({
  dateOfBirth: optionalDateString,
});

export type KinshipPersonFormValues = z.infer<typeof kinshipPersonSchema>;
export type KinshipParentFormValues = z.infer<typeof kinshipParentSchema>;

export const emptyKinshipPersonValue: KinshipPersonFormValues = {
  name: "",
  nationality: "",
  municipality: "",
  yucayeke: "",
  isBorikuaTaino: "",
};

export const emptyKinshipParentValue: KinshipParentFormValues = {
  ...emptyKinshipPersonValue,
  dateOfBirth: "",
};

function readString(value: unknown) {
  return typeof value === "string" ? value : "";
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

/** Hydrates a persisted ancestry row (or null) into grandparent form values. */
export function buildKinshipPersonValue(
  summary?: EnrollmentAncestrySummary | null,
): KinshipPersonFormValues {
  return {
    name: readString(summary?.name),
    nationality: readString(summary?.nationality),
    municipality: readString(summary?.municipality),
    yucayeke: readString(summary?.yucayeke),
    isBorikuaTaino: booleanToYesNo(summary?.isBorikuaTaino),
  };
}

/** Hydrates a persisted ancestry row (or null) into parent form values. */
export function buildKinshipParentValue(
  summary?: EnrollmentAncestrySummary | null,
): KinshipParentFormValues {
  return {
    ...buildKinshipPersonValue(summary),
    dateOfBirth: normalizeDateInputValue(summary?.dateOfBirth),
  };
}

/** Maps grandparent form values to the backend ancestry input (empties omitted). */
export function mapKinshipPersonToPayload(
  values: KinshipPersonFormValues,
): EnrollmentAncestryInput {
  const name = toOptionalString(values.name);
  const nationality = toOptionalString(values.nationality);
  const municipality = toOptionalString(values.municipality);
  const yucayeke = toOptionalString(values.yucayeke);
  const isBorikuaTaino = yesNoToBoolean(values.isBorikuaTaino);

  return {
    ...(name ? { name } : {}),
    ...(nationality ? { nationality } : {}),
    ...(municipality ? { municipality } : {}),
    ...(yucayeke ? { yucayeke } : {}),
    ...(isBorikuaTaino !== undefined ? { isBorikuaTaino } : {}),
  };
}

/** Maps parent form values to the backend ancestry input, with the date of birth. */
export function mapKinshipParentToPayload(
  values: KinshipParentFormValues,
): EnrollmentAncestryInput {
  const dateOfBirth = toOptionalString(values.dateOfBirth);

  return {
    ...mapKinshipPersonToPayload(values),
    ...(dateOfBirth ? { dateOfBirth: toIsoDateString(dateOfBirth) } : {}),
  };
}
