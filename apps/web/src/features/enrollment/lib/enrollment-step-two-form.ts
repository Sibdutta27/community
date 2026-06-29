import { format, isValid, parseISO } from "date-fns";
import { z } from "zod";

import type {
  EnrollmentMaternalLineageRelationValue,
  EnrollmentStepTwoPrefillLineage,
  EnrollmentStepTwoPrefillResponse,
  EnrollmentStepTwoUpsertRequest,
} from "@/types/enrollment";

const dateInputPattern = /^\d{4}-\d{2}-\d{2}$/;
const yearPattern = /^\d{4}$/;
const currentYear = new Date().getFullYear();

export const maternalLineageRelationValues = [
  "MOTHER",
  "GRANDMOTHER",
  "GREAT_GRANDMOTHER",
  "GREAT_GREAT_GRANDMOTHER",
  "GREAT_GREAT_GREAT_GRANDMOTHER",
] as const;

export const maternalLineageDefinitions = [
  {
    relation: "MOTHER",
    title: "Mother",
    description:
      "Start with your mother and include the best available details about her life, origin, and family background.",
  },
  {
    relation: "GRANDMOTHER",
    title: "Grandmother",
    description:
      "Document your maternal grandmother using any exact or approximate family details you have available.",
  },
  {
    relation: "GREAT_GRANDMOTHER",
    title: "Great-Grandmother",
    description:
      "Continue the maternal line with known names, origin details, and any approximate birth information.",
  },
  {
    relation: "GREAT_GREAT_GRANDMOTHER",
    title: "Great-Great-Grandmother",
    description:
      "Provide inherited family knowledge, oral history, or documented facts for this ancestor.",
  },
  {
    relation: "GREAT_GREAT_GREAT_GRANDMOTHER",
    title: "Great-Great-Great-Grandmother",
    description:
      "Share the oldest maternal lineage information you can verify or reasonably trace through family records.",
  },
] as const satisfies readonly {
  relation: EnrollmentMaternalLineageRelationValue;
  title: string;
  description: string;
}[];

export const enrollmentStepTwoLivingStatusValues = [
  "LIVING",
  "DECEASED",
] as const;

export const enrollmentStepTwoLivingStatusOptions = [
  { label: "Living", value: "LIVING" },
  { label: "Deceased", value: "DECEASED" },
] as const;

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

const optionalDateString = optionalString.refine((value) => {
  if (value === "") {
    return true;
  }

  const parsedDate = parseISO(value);

  return isValid(parsedDate) && format(parsedDate, "yyyy-MM-dd") === value;
}, "Enter a valid date");

const optionalBirthYearString = optionalString.refine((value) => {
  if (value === "") {
    return true;
  }

  const normalizedValue = value.trim();

  if (!yearPattern.test(normalizedValue)) {
    return false;
  }

  const parsedYear = Number.parseInt(normalizedValue, 10);

  return parsedYear >= 1800 && parsedYear <= currentYear;
}, "Enter a valid 4-digit year");

export const emptyEnrollmentStepTwoLineageValue = {
  id: "",
  fullName: "",
  maidenName: "",
  dateOfBirth: "",
  placeOfBirth: "",
  livingStatus: "",
  approximateBirthYear: "",
  regionOfOrigin: "",
  familyOccupation: "",
  additionalNotes: "",
} as const;

const maternalLineageEntrySchema = z.object({
  id: optionalString,
  fullName: optionalString,
  maidenName: optionalString,
  dateOfBirth: optionalDateString,
  placeOfBirth: optionalString,
  livingStatus: createOptionalSelectionSchema(
    "living status",
    enrollmentStepTwoLivingStatusValues,
  ),
  approximateBirthYear: optionalBirthYearString,
  regionOfOrigin: optionalString,
  familyOccupation: optionalString,
  additionalNotes: optionalString,
});

function addRequiredLineageFieldIssue(
  context: z.RefinementCtx,
  index: number,
  field: keyof typeof emptyEnrollmentStepTwoLineageValue,
  label: string,
) {
  context.addIssue({
    code: z.ZodIssueCode.custom,
    message: `${label} is required`,
    path: ["maternalLineages", index, field],
  });
}

export const enrollmentStepTwoSchema = z
  .object({
    includedLineages: z
      .array(z.boolean())
      .length(maternalLineageDefinitions.length),
    maternalLineages: z
      .array(maternalLineageEntrySchema)
      .length(maternalLineageDefinitions.length),
  })
  .superRefine((value, context) => {
    value.maternalLineages.forEach((lineage, index) => {
      const isIncluded = index < 2 || value.includedLineages[index];

      if (!isIncluded) {
        return;
      }

      if (!trimValue(lineage.fullName)) {
        addRequiredLineageFieldIssue(context, index, "fullName", "Full name");
      }

      if (!trimValue(lineage.livingStatus)) {
        addRequiredLineageFieldIssue(
          context,
          index,
          "livingStatus",
          "Living status",
        );
      }

      if (!lineage.dateOfBirth || !lineage.approximateBirthYear) {
        return;
      }

      const parsedDate = parseISO(lineage.dateOfBirth);

      if (!isValid(parsedDate)) {
        return;
      }

      const birthYear = Number.parseInt(lineage.approximateBirthYear, 10);

      if (parsedDate.getUTCFullYear() !== birthYear) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Birth year must match the date of birth year",
          path: ["maternalLineages", index, "approximateBirthYear"],
        });
      }
    });
  });

export type EnrollmentStepTwoFormValues = z.infer<
  typeof enrollmentStepTwoSchema
>;

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

function resolveRequiredSelection<TValues extends readonly string[]>(
  value: string,
  allowedValues: TValues,
) {
  const normalizedValue = normalizeKnownSelection(value, allowedValues);

  if (!normalizedValue) {
    throw new Error("Encountered an invalid step 2 selection value.");
  }

  return normalizedValue;
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

function normalizeBirthYear(
  approximateBirthYear: unknown,
  dateOfBirth: unknown,
) {
  if (typeof approximateBirthYear === "number") {
    return String(approximateBirthYear);
  }

  if (typeof approximateBirthYear === "string") {
    const normalizedValue = approximateBirthYear.trim();

    if (yearPattern.test(normalizedValue)) {
      return normalizedValue;
    }
  }

  const normalizedDate = normalizeDateInputValue(dateOfBirth);

  return normalizedDate ? normalizedDate.slice(0, 4) : "";
}

function normalizeLineageRelation(value: unknown) {
  return normalizeKnownSelection(value, maternalLineageRelationValues);
}

function hasLineageSummaryContent(
  lineage: EnrollmentStepTwoPrefillLineage | undefined,
) {
  if (!lineage) {
    return false;
  }

  return (
    [
      lineage.fullName,
      lineage.maidenName,
      lineage.dateOfBirth,
      lineage.placeOfBirth,
      lineage.livingStatus,
      lineage.regionOfOrigin,
      lineage.familyOccupation,
      lineage.additionalNotes,
    ].some((fieldValue) => Boolean(readString(fieldValue).trim())) ||
    typeof lineage.approximateBirthYear === "number"
  );
}

function buildLineageValueFromSummary(
  lineage: EnrollmentStepTwoPrefillLineage | undefined,
) {
  if (!lineage) {
    return { ...emptyEnrollmentStepTwoLineageValue };
  }

  return {
    id: readString(lineage.id),
    fullName: readString(lineage.fullName),
    maidenName: readString(lineage.maidenName),
    dateOfBirth: normalizeDateInputValue(lineage.dateOfBirth),
    placeOfBirth: readString(lineage.placeOfBirth),
    livingStatus: normalizeKnownSelection(
      lineage.livingStatus,
      enrollmentStepTwoLivingStatusValues,
    ),
    approximateBirthYear: normalizeBirthYear(
      lineage.approximateBirthYear,
      lineage.dateOfBirth,
    ),
    regionOfOrigin: readString(lineage.regionOfOrigin),
    familyOccupation: readString(lineage.familyOccupation),
    additionalNotes: readString(lineage.additionalNotes),
  };
}

export function getEnrollmentStepTwoDefaultValues(
  stepTwoData?: EnrollmentStepTwoPrefillResponse | null,
): EnrollmentStepTwoFormValues {
  const savedLineages = stepTwoData ?? [];

  return {
    includedLineages: maternalLineageDefinitions.map(({ relation }, index) => {
      const matchingLineage = savedLineages.find(
        (lineage) => normalizeLineageRelation(lineage.relation) === relation,
      );

      return index < 2 ? true : hasLineageSummaryContent(matchingLineage);
    }),
    maternalLineages: maternalLineageDefinitions.map(({ relation }) => {
      const matchingLineage = savedLineages.find(
        (lineage) => normalizeLineageRelation(lineage.relation) === relation,
      );

      return buildLineageValueFromSummary(matchingLineage);
    }),
  };
}

export function mapEnrollmentStepTwoFormToPayload(
  values: EnrollmentStepTwoFormValues,
): EnrollmentStepTwoUpsertRequest {
  return {
    maternalLineages: maternalLineageDefinitions.flatMap(
      ({ relation }, index) => {
        const shouldInclude = index < 2 || values.includedLineages[index];

        if (!shouldInclude) {
          return [];
        }

        const lineage = values.maternalLineages[index];
        const id = toOptionalString(lineage.id);
        const maidenName = toOptionalString(lineage.maidenName);
        const dateOfBirth = toOptionalString(lineage.dateOfBirth);
        const placeOfBirth = toOptionalString(lineage.placeOfBirth);
        const approximateBirthYear = toOptionalString(
          lineage.approximateBirthYear,
        );
        const regionOfOrigin = toOptionalString(lineage.regionOfOrigin);
        const familyOccupation = toOptionalString(lineage.familyOccupation);
        const additionalNotes = toOptionalString(lineage.additionalNotes);

        return [
          {
            ...(id ? { id } : {}),
            relation,
            fullName: trimValue(lineage.fullName),
            ...(maidenName ? { maidenName } : {}),
            ...(dateOfBirth ? { dateOfBirth } : {}),
            ...(placeOfBirth ? { placeOfBirth } : {}),
            livingStatus: resolveRequiredSelection(
              lineage.livingStatus,
              enrollmentStepTwoLivingStatusValues,
            ),
            ...(approximateBirthYear
              ? {
                  approximateBirthYear: Number.parseInt(
                    approximateBirthYear,
                    10,
                  ),
                }
              : {}),
            ...(regionOfOrigin ? { regionOfOrigin } : {}),
            ...(familyOccupation ? { familyOccupation } : {}),
            ...(additionalNotes ? { additionalNotes } : {}),
          },
        ];
      },
    ),
  };
}
