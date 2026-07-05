import { ShieldCheck } from "lucide-react";

import { SurfaceCard } from "@/components/shared/surface-card";
import type { AuthUser } from "@/lib/auth";

export function ComingSoonPage({
  title,
  user,
}: Readonly<{
  title: string;
  user: AuthUser;
}>) {
  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <SurfaceCard padding="roomy" tone="elevated">
        <p className="text-muted-foreground text-xs font-semibold tracking-[0.3em] uppercase">
          Protected Area
        </p>
        <h1 className="text-foreground mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
          {title}
        </h1>
        <p className="text-muted-foreground mt-4 max-w-2xl text-[15px] leading-7 sm:text-base">
          This page will be implemented soon. You are logged in and your session
          is active.
        </p>

        <div className="border-border bg-surface-muted text-muted-foreground mt-6 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold">
          <ShieldCheck aria-hidden="true" className="size-3.5" />
          Member ID: {user.publicId ?? user.id}
        </div>
      </SurfaceCard>

      <SurfaceCard padding="roomy">
        <h2 className="text-foreground text-lg font-semibold tracking-tight">
          {title} placeholder
        </h2>
        <p className="text-muted-foreground mt-2 max-w-2xl text-[15px] leading-7">
          The signed-in user is visible here so you can verify the protected
          shell before the real feature set is added.
        </p>
      </SurfaceCard>
    </section>
  );
}
