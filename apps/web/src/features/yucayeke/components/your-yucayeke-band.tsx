"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { useOptionalProfileInfoQuery } from "@/features/profile/lib/profile-queries";
import { fadeInUpItem } from "@/lib/motion";
import { cn } from "@/lib/utils";

import { resolveTerritory } from "../content/territories";
import sharedStyles from "../styles/yucayeke-shared.module.scss";

/**
 * Personalized strip above the directory: the signed-in member's own
 * yucayeke, or the nudge to declare one. Renders nothing at all for
 * signed-out visitors — `/yucayeke` stays a public page, so the profile
 * query simply never resolves for them.
 */
export function YourYucayekeBand() {
  const t = useTranslations("yucayeke.yourBand");

  const profileQuery = useOptionalProfileInfoQuery();

  if (!profileQuery.isSuccess) return null;

  const personalInfo = profileQuery.data?.enrollment?.personalInfo;
  const territory = resolveTerritory(personalInfo?.yucayeke);
  const yucayekeUnknown = Boolean(personalInfo?.yucayekeUnknown);

  return (
    <section className="bg-background">
      <div className={cn(sharedStyles.sectionContainer, "pt-2 pb-0")}>
        <motion.div
          variants={fadeInUpItem}
          initial="hidden"
          animate="visible"
          className={cn(
            "flex flex-col items-start gap-3 rounded-2xl border px-5 py-4 sm:flex-row sm:items-center sm:justify-between",
            territory
              ? "border-primary bg-surface"
              : "border-border bg-surface-muted",
          )}
        >
          <div className="min-w-0">
            <p className="text-muted-foreground text-[10.5px] font-semibold tracking-[0.14em] uppercase">
              {t("title")}
            </p>

            {territory ? (
              <p className="text-foreground mt-1 text-[1.35rem] leading-tight font-semibold tracking-tight">
                {territory.displayName}
              </p>
            ) : (
              <p className="text-foreground mt-1 text-[0.9rem] leading-6">
                {yucayekeUnknown ? t("unknown") : t("unassigned")}
              </p>
            )}
          </div>

          {territory ? (
            <Button asChild size="sm" variant="primary">
              <Link href={`/yucayeke/${territory.slug}`}>
                {t("cta", { name: territory.displayName })}
              </Link>
            </Button>
          ) : !yucayekeUnknown ? (
            <Button asChild size="sm" variant="secondary">
              <Link href="/enrollment">{t("unassignedCta")}</Link>
            </Button>
          ) : null}
        </motion.div>
      </div>
    </section>
  );
}
