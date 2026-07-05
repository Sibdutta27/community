import type { Metadata } from "next";
import { Suspense } from "react";

import { getTranslations } from "next-intl/server";

import { SignUpPageContent } from "@/features/auth/components/sign-up-page-content";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.signUp");

  return { title: t("metaTitle") };
}

export default function SignUpPage() {
  return (
    <Suspense fallback={null}>
      <SignUpPageContent />
    </Suspense>
  );
}
