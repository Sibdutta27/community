import { CommunityQuickLinkCard } from "@/features/community/components/community-quick-link-card";
import { communityQuickLinks } from "@/features/community/constants/community-quick-links";
import { cn } from "@/lib/utils";

import sharedStyles from "../styles/community-shared.module.scss";

export function CommunityQuickLinksSection() {
  return (
    <section className="py-7 pb-14 sm:py-8 sm:pb-16 lg:py-10 lg:pb-20">
      <div className={cn(sharedStyles.sectionContainer, "relative")}>
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-foreground text-[1.55rem] font-semibold tracking-tight sm:text-[1.75rem]">
            Quick Links
          </h2>
          <p className="text-muted-foreground mt-2 text-[0.92rem] leading-6 sm:text-[0.98rem]">
            Access important community resources and information without digging
            through multiple pages.
          </p>
        </div>

        <div className="mt-6 grid gap-3 sm:mt-7 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
          {communityQuickLinks.map((linkItem) => (
            <CommunityQuickLinkCard key={linkItem.title} {...linkItem} />
          ))}
        </div>
      </div>
    </section>
  );
}
