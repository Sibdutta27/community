import Image from "next/image";

import { SupportSection } from "@/components/shared/support-section";
import { AuthInfoCard } from "@/features/auth/components/auth-info-card";
import { SignUpForm } from "@/features/auth/components/sign-up-form";
import { cn } from "@/lib/utils";
import sharedStyles from "@/features/auth/styles/auth-shared.module.scss";

const nextSteps = [
  "Create your account and verify your email address",
  "Complete your enrollment application with personal and lineage information",
  "Upload supporting documents to verify your maternal lineage",
  "Our review team will carefully examine your application",
  "Receive your Tribal ID and Yukayeke assignment upon approval",
] as const;

const authInfoCards = [
  {
    iconSrc: "/icons/auth/timeline-clock.svg",
    title: "Estimated Timeline",
    description:
      "Complete enrollment process typically takes 4-6 weeks from application submission to approval",
    className: "bg-[rgba(217,217,217,0.28)]",
  },
  {
    iconSrc: "/icons/auth/shield-privacy.svg",
    title: "Your Privacy Matters",
    description:
      "All personal information is encrypted and stored securely on sovereign servers. We never share your data with third parties.",
    className: "bg-[#F4FBF3]",
  },
  {
    iconSrc: "/icons/auth/community-users.svg",
    title: "Join Our Community",
    description:
      "2,847 members have already reconnected with their heritage. You'll be part of a growing Indigenous community.",
    className: "bg-[rgba(217,217,217,0.28)]",
  },
] as const;

export function SignUpPageContent() {
  return (
    <main className="pt-20 pb-10 sm:pt-24 sm:pb-12 lg:pt-28 lg:pb-14">
      <div className={sharedStyles.pageFrame}>
        <section className="grid gap-3 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)]">
          <div className={sharedStyles.surfacePanel}>
            <div className="px-5 py-5 sm:px-7 sm:py-7 lg:px-8 lg:py-8">
              <SignUpForm />
            </div>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <div
              className={cn(
                sharedStyles.featurePanel,
                "px-5 py-5 sm:px-7 sm:py-7 lg:px-8 lg:py-8",
              )}
            >
              <div className={sharedStyles.featurePanelOverlay} />

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
                    What Happens Next?
                  </h2>
                </div>

                <ol className="mt-7 space-y-4 sm:space-y-5">
                  {nextSteps.map((step, index) => (
                    <li key={step} className="flex items-start gap-4">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-full border border-white/80 text-sm font-semibold text-white">
                        {index + 1}
                      </div>
                      <p className="pt-0.5 text-[0.95rem] leading-6 text-white/95 sm:text-[1rem]">
                        {step}
                      </p>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {authInfoCards.map((card) => (
                <AuthInfoCard
                  key={card.title}
                  iconSrc={card.iconSrc}
                  title={card.title}
                  description={card.description}
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
