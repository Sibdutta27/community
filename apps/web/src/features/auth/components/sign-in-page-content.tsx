import Image from "next/image";

import { SurfaceCard } from "@/components/shared/surface-card";
import { cn } from "@/lib/utils";
import { SignInBenefitCard } from "@/features/auth/components/sign-in-benefit-card";
import { SignInForm } from "@/features/auth/components/sign-in-form";
import sharedStyles from "@/features/auth/styles/auth-shared.module.scss";

const benefitCards = [
  {
    iconSrc: "/icons/auth/idcard.svg",
    title: "View Your Tribal ID",
    description:
      "Access your official member identification and verification details.",
  },
  {
    iconSrc: "/icons/auth/clipboard.svg",
    title: "Track Application Status",
    description:
      "Monitor your enrollment progress and review application feedback.",
  },
  {
    iconSrc: "/icons/auth/explore.svg",
    title: "Explore Your Lineage",
    description: "View your documented maternal ancestry and family tree.",
  },
] as const;

export function SignInPageContent() {
  return (
    <main className="bg-background pt-20 pb-10 sm:pt-24 sm:pb-12 lg:pt-28 lg:pb-14">
      <div className={sharedStyles.pageFrame}>
        <section className="grid gap-4 sm:gap-5 lg:grid-cols-[minmax(0,0.96fr)_minmax(0,1.04fr)]">
          <div
            className={cn(
              sharedStyles.featurePanel,
              "order-2 p-5 sm:p-6 lg:order-1 lg:p-8",
            )}
          >
            <div aria-hidden="true" className={sharedStyles.featurePanelOverlay} />

            <div className="relative flex h-full flex-col">
              <div className="flex size-12 items-center justify-center rounded-xl border border-white/20 bg-white/12 text-white sm:size-[3.25rem]">
                <Image
                  alt=""
                  aria-hidden="true"
                  className="h-6 w-6 object-contain"
                  height={24}
                  src="/icons/auth/lightbulb.svg"
                  width={24}
                />
              </div>

              <div className="mt-5 max-w-md">
                <h2 className="text-[2.05rem] font-semibold tracking-[-0.04em] sm:text-[2.2rem]">
                  Access Your Tribal Portal
                </h2>
                <p className="mt-3 text-[0.98rem] leading-6 text-white/90 sm:text-[1.02rem]">
                  Sign in to manage your enrollment application, view your
                  tribal profile, and connect with the Taíno community.
                </p>
              </div>

              <div className="mt-6 space-y-3">
                {benefitCards.map((card) => (
                  <SignInBenefitCard
                    key={card.title}
                    iconSrc={card.iconSrc}
                    title={card.title}
                    description={card.description}
                  />
                ))}
              </div>
            </div>
          </div>

          <SurfaceCard
            className="order-1 overflow-hidden lg:order-2"
            padding="none"
            tone="elevated"
          >
            <div className="flex h-full items-center p-6 sm:p-8 lg:p-10">
              <SignInForm />
            </div>
          </SurfaceCard>
        </section>
      </div>
    </main>
  );
}
