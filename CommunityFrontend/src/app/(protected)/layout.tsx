import type { ReactNode } from "react";

import { PublicFooter } from "@/components/layout/public-footer";
import { ProtectedNavbar } from "@/components/layout/protected-navbar";
import { getRequiredSessionUser } from "@/lib/auth-session";

type ProtectedLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default async function ProtectedLayout({
  children,
}: ProtectedLayoutProps) {
  const user = await getRequiredSessionUser();

  return (
    <div className="bg-background text-foreground relative flex min-h-screen flex-col">
      <ProtectedNavbar user={user} />
      <main className="flex-1 px-4 pb-4 sm:px-6 sm:pb-6 lg:px-8 lg:pb-8">
        {children}
      </main>
      <PublicFooter />
    </div>
  );
}
