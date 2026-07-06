import { useTranslations } from "next-intl";

import { CommunityQuickLinkCard } from "@/features/community/components/community-quick-link-card";
import { communityQuickLinks } from "@/features/community/constants/community-quick-links";
import { cn } from "@/lib/utils";

import sharedStyles from "../styles/community-shared.module.scss";

export function CommunityQuickLinksSection() {
  const t = useTranslations("community.quickLinks");

  return (
    <section className="py-7 pb-14 sm:py-8 sm:pb-16 lg:py-10 lg:pb-20">
      <div className={cn(sharedStyles.sectionContainer, "relative")}>
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-foreground text-[1.55rem] font-semibold tracking-tight sm:text-[1.75rem]">
            {t("title")}
          </h2>
          <p className="text-muted-foreground mt-2 text-[0.92rem] leading-6 sm:text-[0.98rem]">
            {t("subtitle")}
          </p>
        </div>

        <div className="mt-6 grid gap-3 sm:mt-7 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
          {communityQuickLinks.map((linkItem) => (
            <CommunityQuickLinkCard
              key={linkItem.key}
              description={t(`items.${linkItem.key}.description`)}
              href={linkItem.href}
              iconBackgroundClassName={linkItem.iconBackgroundClassName}
              iconSrc={linkItem.iconSrc}
              title={t(`items.${linkItem.key}.title`)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
