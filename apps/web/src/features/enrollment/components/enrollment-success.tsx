import Link from "next/link";

import { CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type EnrollmentSuccessProps = Readonly<{
  className?: string;
}>;

export function EnrollmentSuccess({ className }: EnrollmentSuccessProps) {
  const t = useTranslations("enrollment.success");

  return (
    <section className={cn("bg-background", className)}>
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center px-4 pt-32 pb-20 text-center sm:px-6 sm:pt-36 sm:pb-24 lg:px-8">
        <div className="border-border bg-surface flex size-16 items-center justify-center rounded-full border sm:size-20">
          <CheckCircle2
            aria-hidden="true"
            className="text-foreground size-8 sm:size-10"
          />
        </div>

        <h1 className="text-foreground mt-6 text-[clamp(2.25rem,6vw,3.5rem)] leading-[1.02] font-semibold tracking-tight sm:mt-8">
          {t("title")}
        </h1>

        <p className="text-muted-foreground mt-5 max-w-xl text-[0.98rem] leading-7 sm:mt-6 sm:text-[1.05rem] sm:leading-8">
          {t("body")}
        </p>

        <Button asChild className="mt-8 min-w-[12rem] sm:mt-10" size="lg">
          <Link href="/dashboard">{t("backToDashboard")}</Link>
        </Button>
      </div>
    </section>
  );
}
