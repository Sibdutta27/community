import type { ReactNode } from "react";

import { SiteShell } from "@/components/layout/site-shell";

type AuthLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function AuthLayout({ children }: AuthLayoutProps) {
  return <SiteShell>{children}</SiteShell>;
}
