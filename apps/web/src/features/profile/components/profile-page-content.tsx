"use client";

import { useMemo } from "react";

import { useTranslations } from "next-intl";

import type { AuthUser } from "@/lib/auth";

import { ProfileAvatar } from "./profile-avatar";
import { ProfileLineageSection } from "./profile-lineage-section";
import { ProfileSummary } from "./profile-summary";
import { IdentityCardDeck } from "./identity-card-deck";
import { buildIdCardData } from "../lib/id-card-data";
import { useProfileInfoQuery } from "../lib/profile-queries";
import { buildProfileViewData } from "../lib/profile-view-data";

export function ProfilePageContent({ user }: Readonly<{ user: AuthUser }>) {
  const t = useTranslations("profile");
  const profileInfoQuery = useProfileInfoQuery();

  const profileViewData = useMemo(
    () =>
      buildProfileViewData({
        accountInfo: profileInfoQuery.data ?? null,
        authUser: user,
        t,
      }),
    [profileInfoQuery.data, t, user],
  );

  const idCardData = useMemo(
    () => buildIdCardData(profileInfoQuery.data ?? null, user),
    [profileInfoQuery.data, user],
  );

  const profileInfoErrorMessage =
    !profileInfoQuery.data && profileInfoQuery.error instanceof Error
      ? profileInfoQuery.error.message
      : null;

  return (
    <section
      aria-label={t("summary.ariaLabel", { name: profileViewData.copy.name })}
      className="mx-auto w-full max-w-5xl pt-20 sm:pt-24 lg:pt-28"
      data-auth-user-id={user.id}
    >
      {profileInfoErrorMessage ? (
        <div
          className="border-border bg-surface-muted text-foreground mb-5 rounded-xl border px-4 py-3 text-sm font-medium sm:px-5"
          role="status"
        >
          {profileInfoErrorMessage} {t("summary.fallbackNotice")}
        </div>
      ) : null}

      {/* Summary (left) with the slim ID card lifted into the space to its
          right; on mobile the card stacks below, name-first. */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-6 xl:gap-8">
        <div className="flex min-w-0 flex-1 flex-col items-start gap-4 text-left lg:flex-row lg:items-center lg:gap-4 xl:gap-5">
          <ProfileAvatar
            name={profileViewData.copy.name}
            portraitSrc={profileViewData.copy.portraitSrc}
          />

          <ProfileSummary
            details={profileViewData.details}
            enrollmentStatus={
              profileInfoQuery.data?.enrollmentStatus ??
              profileInfoQuery.data?.enrollment?.status ??
              null
            }
            memberSince={profileViewData.copy.memberSince}
            memberStatus={profileViewData.copy.memberStatus}
            name={profileViewData.copy.name}
          />
        </div>

        <IdentityCardDeck
          idCardData={idCardData}
          yucayekeUnknown={profileViewData.yucayekeData.yucayekeUnknown}
          yucayekeValue={profileViewData.yucayekeData.declaredYucayeke}
        />
      </div>

      <ProfileLineageSection
        activityData={profileViewData.activityData}
        documentsData={profileViewData.documentsData}
        kinshipData={profileViewData.kinshipData}
        overviewData={profileViewData.overviewData}
        settingsData={profileViewData.settingsData}
        yucayekeData={profileViewData.yucayekeData}
      />
    </section>
  );
}
