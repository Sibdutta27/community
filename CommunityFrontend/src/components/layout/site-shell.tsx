import type { ReactNode } from "react";

import { PublicFooter } from "@/components/layout/public-footer";
import { ProtectedNavbar } from "@/components/layout/protected-navbar";
import { PublicNavbar } from "@/components/layout/public-navbar";
import type { AuthUser } from "@/lib/auth";
import { cn } from "@/lib/utils";

type SiteShellProps = Readonly<{
  children: ReactNode;
  className?: string;
  user?: AuthUser | null;
}>;

export function SiteShell({ children, className, user }: SiteShellProps) {
  return (
    <div
      className={cn(
        "bg-background text-foreground relative flex min-h-screen flex-col",
        className,
      )}
    >
      {user ? <ProtectedNavbar user={user} /> : <PublicNavbar />}
      <div className="flex-1">{children}</div>
      <PublicFooter />
    </div>
  );
}
