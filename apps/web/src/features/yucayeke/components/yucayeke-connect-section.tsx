import { yucayekeConnectionContent } from "@/features/yucayeke/constants/yucayeke-content";
import { cn } from "@/lib/utils";

import { YucayekeConnectCard } from "./yucayeke-connect-card";
import sharedStyles from "../styles/yucayeke-shared.module.scss";

export function YucayekeConnectSection() {
  const { badge, description, links, title } = yucayekeConnectionContent;

  return (
    <section className="overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(197,49,51,0.2),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(111,175,196,0.16),transparent_38%),linear-gradient(135deg,#2d2018_0%,#1f1712_100%)] py-10 sm:py-12 lg:py-14">
      <div className={cn(sharedStyles.sectionContainer, "relative")}>
        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-flex min-w-[11rem] justify-center rounded-full border border-white/24 bg-white/12 px-4 py-1.5 text-xs font-semibold tracking-tight text-white sm:min-w-[13rem] sm:px-5 sm:text-sm">
            {badge}
          </span>

          <h2 className="mt-5 text-[1.6rem] leading-tight font-semibold tracking-tight text-white sm:text-[2rem] lg:text-[2.6rem]">
            {title}
          </h2>

          <p className="mx-auto mt-4 max-w-3xl text-[0.92rem] leading-7 text-white/76 sm:text-[1rem] sm:leading-8">
            {description}
          </p>
        </div>

        <div className="mt-7 grid gap-3 md:grid-cols-2 xl:mt-8 xl:grid-cols-3">
          {links.map((link) => (
            <YucayekeConnectCard key={link.title} link={link} />
          ))}
        </div>
      </div>
    </section>
  );
}
