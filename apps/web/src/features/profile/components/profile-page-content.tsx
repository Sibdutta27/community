"use client";

import { useMemo } from "react";

import type { AuthUser } from "@/lib/auth";

import { ProfileAvatar } from "./profile-avatar";
import { ProfileLineageSection } from "./profile-lineage-section";
import { ProfileSummary } from "./profile-summary";
import { useProfileInfoQuery } from "../lib/profile-queries";
import { buildProfileViewData } from "../lib/profile-view-data";

export function ProfilePageContent({ user }: Readonly<{ user: AuthUser }>) {
  const profileInfoQuery = useProfileInfoQuery();

  const profileViewData = useMemo(
    () =>
      buildProfileViewData({
        accountInfo: profileInfoQuery.data ?? null,
        authUser: user,
      }),
    [profileInfoQuery.data, user],
  );

  const profileInfoErrorMessage =
    !profileInfoQuery.data && profileInfoQuery.error instanceof Error
      ? profileInfoQuery.error.message
      : null;

  return (
    <section
      aria-label={`Profile summary for ${profileViewData.copy.name}`}
      className="mx-auto w-full max-w-5xl pt-24 sm:pt-28 lg:pt-32"
      data-auth-user-id={user.id}
    >
      {profileInfoErrorMessage ? (
        <div className="mb-5 rounded-[20px] border border-[#e9d8aa] bg-[#fff9eb] px-4 py-3 text-sm font-medium text-[#8a6000] sm:px-5">
          {profileInfoErrorMessage} Showing fallback profile values where
          needed.
        </div>
      ) : null}

      <div className="mr-auto flex max-w-[48rem] flex-col items-start gap-4 text-left lg:flex-row lg:items-center lg:gap-4 xl:max-w-[52rem] xl:gap-5">
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

      <ProfileLineageSection
        activityData={profileViewData.activityData}
        documentsData={profileViewData.documentsData}
        lineageEntries={profileViewData.lineageEntries}
        lineageTreeData={profileViewData.lineageTreeData}
        lineageStats={profileViewData.lineageStats}
        overviewData={profileViewData.overviewData}
        settingsData={profileViewData.settingsData}
        yucayekeData={profileViewData.yucayekeData}
      />
    </section>
  );
}
