import Image from "next/image";

import { useTranslations } from "next-intl";

import { SupportSection } from "@/components/shared/support-section";
import { SurfaceCard } from "@/components/shared/surface-card";
import { AuthInfoCard } from "@/features/auth/components/auth-info-card";
import { SignUpForm } from "@/features/auth/components/sign-up-form";
import { cn } from "@/lib/utils";
import sharedStyles from "@/features/auth/styles/auth-shared.module.scss";

const nextStepKeys = [
  "createAccount",
  "completeApplication",
  "uploadDocuments",
  "review",
  "receiveId",
] as const;

const authInfoCards = [
  {
    key: "timeline",
    iconSrc: "/icons/auth/timeline-clock.svg",
    className: "bg-surface-muted",
  },
  {
    key: "privacy",
    iconSrc: "/icons/auth/shield-privacy.svg",
    className: "bg-surface",
  },
  {
    key: "community",
    iconSrc: "/icons/auth/community-users.svg",
    className: "bg-surface-muted",
  },
] as const;

export function SignUpPageContent() {
  const t = useTranslations("auth.signUp.panel");

  return (
    <main className="bg-background pt-20 pb-10 sm:pt-24 sm:pb-12 lg:pt-28 lg:pb-14">
      <div className={sharedStyles.pageFrame}>
        <section className="grid gap-4 sm:gap-5 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)]">
          <SurfaceCard
            className="overflow-hidden"
            padding="roomy"
            tone="elevated"
          >
            <SignUpForm />
          </SurfaceCard>

          <div className="space-y-4 sm:space-y-6">
            <div
              className={cn(sharedStyles.featurePanel, "p-5 sm:p-6 lg:p-8")}
            >
              <div
                aria-hidden="true"
                className={sharedStyles.featurePanelOverlay}
              />

              <div className="relative flex h-full flex-col">
                <Image
                  alt=""
                  aria-hidden="true"
                  className="h-12 w-12 object-contain sm:h-14 sm:w-14"
                  height={64}
                  src="/icons/auth/lightbulb.svg"
                  width={64}
                />

                <div className="mt-5 max-w-md">
                  <h2 className="text-[2rem] font-semibold tracking-[-0.04em] sm:text-[2.15rem]">
                    {t("heading")}
                  </h2>
                </div>

                <ol className="mt-7 space-y-4 sm:space-y-5">
                  {nextStepKeys.map((stepKey, index) => (
                    <li key={stepKey} className="flex items-start gap-4">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-full border border-white/80 text-sm font-semibold text-white">
                        {index + 1}
                      </div>
                      <p className="pt-0.5 text-[0.95rem] leading-6 text-white/95 sm:text-[1rem]">
                        {t(`steps.${stepKey}`)}
                      </p>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {authInfoCards.map((card) => (
                <AuthInfoCard
                  key={card.key}
                  iconSrc={card.iconSrc}
                  title={t(`cards.${card.key}.title`)}
                  description={t(`cards.${card.key}.description`)}
                  className={card.className}
                />
              ))}
            </div>
          </div>
        </section>
      </div>

      <div className="mt-12 sm:mt-16 lg:mt-20">
        <SupportSection />
      </div>
    </main>
  );
}
