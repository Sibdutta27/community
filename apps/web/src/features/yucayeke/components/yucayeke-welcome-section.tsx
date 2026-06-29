import Image from "next/image";

import { yucayekeWelcomeContent } from "@/features/yucayeke/constants/yucayeke-content";
import { cn } from "@/lib/utils";

import sharedStyles from "../styles/yucayeke-shared.module.scss";

export function YucayekeWelcomeSection() {
  const { map, paragraphs, title } = yucayekeWelcomeContent;

  return (
    <section className="overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(255,235,182,0.42),transparent_36%),linear-gradient(180deg,#fffef7_0%,#fff8e7_100%)]">
      <div
        className={cn(sharedStyles.sectionContainer, "py-8 sm:py-10 lg:py-12")}
      >
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.96fr)_minmax(17rem,0.78fr)] lg:items-center lg:gap-8 xl:gap-10">
          <div className="max-w-xl">
            <h2 className="text-foreground text-center text-[1.75rem] font-semibold tracking-tight sm:text-[2rem] lg:text-left lg:text-[2.25rem] lg:leading-[1.08]">
              {title}
            </h2>

            <div className="mt-3 space-y-3 text-justify text-[0.9rem] leading-6 font-semibold text-[#171717] sm:mt-4 sm:text-[0.94rem] sm:leading-7 lg:text-[0.96rem] lg:leading-7">
              {paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>

          <div className="mx-auto w-full max-w-[26rem] lg:max-w-[24rem] xl:max-w-[26rem]">
            <div className="relative h-[16rem] overflow-hidden rounded-[1.6rem] border border-[#d6e2d8] bg-[#ddecf5] shadow-[0_24px_60px_-50px_rgba(22,67,106,0.42)] sm:h-[20rem] lg:h-[24rem] xl:h-[26rem]">
              <Image
                alt={map.alt}
                className="object-cover"
                fill
                priority={false}
                sizes="(min-width: 1280px) 26rem, (min-width: 1024px) 24rem, 92vw"
                src={map.src}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
