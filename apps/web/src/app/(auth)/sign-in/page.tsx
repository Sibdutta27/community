import { Suspense } from "react";

import { SignInPageContent } from "@/features/auth/components/sign-in-page-content";

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInPageContent />
    </Suspense>
  );
}
