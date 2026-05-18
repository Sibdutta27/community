import type { ReactNode } from "react";

import { SiteShell } from "@/components/layout/site-shell";
import { getSessionUser } from "@/lib/auth-session";

type PublicLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default async function PublicLayout({ children }: PublicLayoutProps) {
  const user = await getSessionUser();

  return <SiteShell user={user}>{children}</SiteShell>;
}
