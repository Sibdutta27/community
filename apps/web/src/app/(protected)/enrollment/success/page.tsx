import type { Metadata } from "next";

import { getTranslations } from "next-intl/server";

import { EnrollmentSuccess } from "@/features/enrollment/components/enrollment-success";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("enrollment.success");

  return { title: t("metaTitle") };
}

export default function EnrollmentSuccessPage() {
  return <EnrollmentSuccess className="-mx-4 sm:-mx-6 lg:-mx-8" />;
}
