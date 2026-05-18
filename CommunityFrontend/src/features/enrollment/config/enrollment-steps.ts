import type { LucideIcon } from "lucide-react";

import { FileCheck2, FileUp, TreePine, UserRound } from "lucide-react";

import type {
  AccountInfoResponse,
  EnrollmentStepState,
} from "@/types/enrollment";

export type EnrollmentStepDefinition = Readonly<{
  step: number;
  title: string;
  description: string;
  progressTitle: string;
  progressDescription: string;
  ctaLabel: string;
  href: string;
  icon: LucideIcon;
  progress: number;
  isEnabled: boolean;
  placeholderDescription: string;
}>;

export type EnrollmentProgressStage = Readonly<{
  step: number;
  title: string;
  description: string;
}>;

export const enrollmentStepDefinitions = [
  {
    step: 1,
    title: "Personal Information",
    description: "Provide your basic details and contact information.",
    progressTitle: "Personal Information",
    progressDescription: "Provide your basic details and contact information",
    ctaLabel: "Start Step 1",
    href: "/enrollment/step-1",
    icon: UserRound,
    progress: 0,
    isEnabled: true,
    placeholderDescription:
      "This placeholder route will host the personal-information form that members complete after starting enrollment and accepting the active consents.",
  },
  {
    step: 2,
    title: "Maternal Lineage",
    description: "Document your maternal ancestry and family history.",
    progressTitle: "Maternal Lineage",
    progressDescription: "Document your ancestral maternal line",
    ctaLabel: "Start Step 2",
    href: "/enrollment/step-2",
    icon: TreePine,
    progress: 0,
    isEnabled: false,
    placeholderDescription:
      "This placeholder route will host the maternal-lineage form once the next enrollment step is implemented.",
  },
  {
    step: 3,
    title: "Cultural Connection",
    description:
      "Share your cultural ties, traditions, and community connection.",
    progressTitle: "Cultural Connection",
    progressDescription: "Share traditions and community ties",
    ctaLabel: "Start Step 3",
    href: "/enrollment/step-3",
    icon: FileCheck2,
    progress: 0,
    isEnabled: false,
    placeholderDescription:
      "This placeholder route will host the cultural-connection step when that part of the enrollment workflow is implemented.",
  },
  {
    step: 4,
    title: "Document Upload",
    description:
      "Upload the supporting records required for enrollment review.",
    progressTitle: "Document Upload",
    progressDescription: "Upload supporting lineage documents",
    ctaLabel: "Start Step 4",
    href: "/enrollment/step-4",
    icon: FileUp,
    progress: 0,
    isEnabled: false,
    placeholderDescription:
      "This placeholder route will host the document-upload experience after the earlier enrollment forms are completed.",
  },
] as const satisfies readonly EnrollmentStepDefinition[];

export const enrollmentProgressStages = enrollmentStepDefinitions.map(
  ({ step, progressTitle, progressDescription }) => ({
    step,
    title: progressTitle,
    description: progressDescription,
  }),
) satisfies readonly EnrollmentProgressStage[];

export function getEnrollmentStepDefinition(stepNumber: number) {
  return (
    enrollmentStepDefinitions.find((step) => step.step === stepNumber) ?? null
  );
}

const defaultEnrollmentStepState: EnrollmentStepState = {
  "1": false,
  "2": false,
  "3": false,
  "4": false,
};

function getStepKey(stepNumber: number) {
  return String(stepNumber) as keyof EnrollmentStepState;
}

export function buildDashboardEnrollmentSteps(
  stepState?: EnrollmentStepState | null,
) {
  const resolvedStepState = stepState ?? defaultEnrollmentStepState;

  return enrollmentStepDefinitions.map((step) => {
    const stepKey = getStepKey(step.step);
    const previousStepKey =
      step.step > 1 ? getStepKey(step.step - 1) : undefined;
    const isCompleted = resolvedStepState[stepKey];
    const isEnabled =
      step.step === 1
        ? true
        : Boolean(previousStepKey && resolvedStepState[previousStepKey]);

    return {
      ...step,
      isEnabled,
      progress: isCompleted ? 1 : 0,
    };
  });
}

export function resolveEnrollmentStepState(
  accountInfo?: Pick<
    AccountInfoResponse,
    "enrollment" | "enrollmentStep"
  > | null,
) {
  return accountInfo?.enrollment?.steps ?? accountInfo?.enrollmentStep ?? null;
}

export function getEnrollmentStatusDisplay(
  enrollmentStatus: string | null | undefined,
  hasEnrollment: boolean | undefined,
) {
  if (!hasEnrollment) {
    return "Not Started";
  }

  if (!enrollmentStatus) {
    return "Draft";
  }

  return enrollmentStatus
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
