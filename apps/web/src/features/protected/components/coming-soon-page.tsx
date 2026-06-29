import { ShieldCheck } from "lucide-react";

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
      <div className="border-border bg-surface overflow-hidden rounded-[32px] border shadow-[0_28px_60px_-40px_rgba(16,47,52,0.28)]">
        <div className="relative overflow-hidden px-6 py-8 sm:px-8 sm:py-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(47,207,195,0.14),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(43,116,216,0.12),transparent_30%)]" />

          <div className="relative">
            <p className="text-sm font-semibold tracking-[0.28em] text-[#1f8ca5] uppercase">
              Protected Area
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
              {title}
            </h1>
            <p className="mt-4 max-w-2xl text-[15px] leading-7 text-slate-600 sm:text-base">
              This page will be implemented soon. You are logged in and your
              session is active.
            </p>

            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#e8f6fb] px-3 py-1 text-xs font-semibold text-[#1f8ca5]">
              <ShieldCheck className="size-3.5" />
              Member ID: {user.publicId ?? user.id}
            </div>
          </div>
        </div>
      </div>

      <div className="border-border bg-surface rounded-[32px] border p-6 shadow-[0_18px_34px_-26px_rgba(16,47,52,0.24)] sm:p-8">
        <p className="text-foreground text-lg font-semibold tracking-[-0.03em]">
          {title} placeholder
        </p>
        <p className="mt-2 max-w-2xl text-[15px] leading-7 text-slate-600">
          The signed-in user is visible here so you can verify the protected
          shell before the real feature set is added.
        </p>
      </div>
    </section>
  );
}
