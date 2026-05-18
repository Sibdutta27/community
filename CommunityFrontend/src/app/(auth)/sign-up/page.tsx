import type { Metadata } from "next";
import { Suspense } from "react";

import { SignUpPageContent } from "@/features/auth/components/sign-up-page-content";

export const metadata: Metadata = {
  title: "Sign Up",
};

export default function SignUpPage() {
  return (
    <Suspense fallback={null}>
      <SignUpPageContent />
    </Suspense>
  );
}
