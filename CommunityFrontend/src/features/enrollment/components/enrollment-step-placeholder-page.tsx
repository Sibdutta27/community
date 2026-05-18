import { ArrowRight, ShieldCheck } from "lucide-react";

import type { EnrollmentStepDefinition } from "@/features/enrollment/config/enrollment-steps";
import type { AuthUser } from "@/lib/auth";

type EnrollmentStepPlaceholderPageProps = Readonly<{
  step: EnrollmentStepDefinition;
  user: AuthUser;
}>;

export function EnrollmentStepPlaceholderPage({
  step,
  user,
}: EnrollmentStepPlaceholderPageProps) {
  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 pt-24 sm:pt-28 lg:pt-32">
      <div className="overflow-hidden rounded-[32px] border border-[#d5e1da] bg-[#fffdec] shadow-[0_28px_60px_-40px_rgba(16,47,52,0.28)]">
        <div className="relative overflow-hidden px-6 py-8 sm:px-8 sm:py-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(47,207,195,0.12),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(11,98,93,0.14),transparent_30%)]" />

          <div className="relative">
            <p className="text-sm font-semibold tracking-[0.28em] text-[#1f8ca5] uppercase">
              Enrollment Step {step.step}
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-[#12393d] sm:text-5xl">
              {step.title}
            </h1>
            <p className="mt-4 max-w-3xl text-[15px] leading-7 text-slate-600 sm:text-base">
              {step.placeholderDescription}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#e8f6fb] px-3 py-1 text-xs font-semibold text-[#1f8ca5]">
                <ShieldCheck className="size-3.5" />
                Member ID: {user.publicId ?? user.id}
              </div>
              <div className="text-primary inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold shadow-[0_10px_24px_-20px_rgba(197,49,51,0.28)]">
                Form Route Ready
                <ArrowRight className="size-3.5" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[32px] border border-[#d5e1da] bg-white p-6 shadow-[0_18px_34px_-26px_rgba(16,47,52,0.24)] sm:p-8">
        <p className="text-lg font-semibold tracking-[-0.03em] text-[#12393d]">
          Step summary
        </p>
        <p className="mt-2 max-w-3xl text-[15px] leading-7 text-slate-600">
          {step.description} This page is intentionally wired as a protected
          destination so the dashboard can navigate to a concrete route while
          the full form implementation is completed step by step.
        </p>
      </div>
    </section>
  );
}
