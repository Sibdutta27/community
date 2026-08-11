import type { Metadata } from "next";

import { getTranslations } from "next-intl/server";

import { EnrollmentIntro } from "@/features/enrollment/components/enrollment-intro";
import { EnrollmentStepLayout } from "@/features/enrollment/components/enrollment-step-layout";
import { enrollmentOverviewStep } from "@/features/enrollment/config/enrollment-steps";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("enrollment.intro");

  return { title: t("metaTitle") };
}

export default async function EnrollmentStartPage() {
  const t = await getTranslations("enrollment.intro");

  return (
    <EnrollmentStepLayout
      description={t("description")}
      heading={t("heading")}
      step={enrollmentOverviewStep}
    >
      <EnrollmentIntro />
    </EnrollmentStepLayout>
  );
}
