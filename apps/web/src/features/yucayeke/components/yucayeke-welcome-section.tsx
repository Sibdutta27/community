import Image from "next/image";
import { useTranslations } from "next-intl";

import { yucayekeMap } from "@/features/yucayeke/constants/yucayeke-content";
import { cn } from "@/lib/utils";

import sharedStyles from "../styles/yucayeke-shared.module.scss";

export function YucayekeWelcomeSection() {
  const t = useTranslations("yucayeke.welcome");
  const paragraphs = t.raw("paragraphs") as readonly string[];

  return (
    <section className="bg-surface overflow-hidden">
      <div
        className={cn(sharedStyles.sectionContainer, "py-8 sm:py-10 lg:py-12")}
      >
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.96fr)_minmax(17rem,0.78fr)] lg:items-center lg:gap-8 xl:gap-10">
          <div className="max-w-xl">
            <h2 className="text-foreground text-center text-[1.75rem] font-semibold tracking-tight sm:text-[2rem] lg:text-left lg:text-[2.25rem] lg:leading-[1.08]">
              {t("title")}
            </h2>

            <div className="text-muted-foreground mt-3 space-y-3 text-[0.9rem] leading-6 sm:mt-4 sm:text-[0.94rem] sm:leading-7 lg:text-[0.96rem] lg:leading-7">
              {paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>

          <div className="mx-auto w-full max-w-[26rem] lg:max-w-[24rem] xl:max-w-[26rem]">
            <div className="border-border bg-secondary shadow-card relative h-[16rem] overflow-hidden rounded-2xl border sm:h-[20rem] lg:h-[24rem] xl:h-[26rem]">
              <Image
                alt={t("mapAlt")}
                className="object-cover"
                fill
                priority={false}
                sizes="(min-width: 1280px) 26rem, (min-width: 1024px) 24rem, 92vw"
                src={yucayekeMap.src}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
