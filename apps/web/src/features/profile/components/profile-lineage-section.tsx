"use client";

import { useId, useState } from "react";

import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

import sharedStyles from "../styles/profile-shared.module.scss";
import { ProfileActivityPanel } from "./profile-activity-panel";
import { ProfileKinshipPanel } from "./profile-kinship-panel";
import { ProfileLineageTabs } from "./profile-lineage-tabs";
import { ProfileDocumentsPanel } from "./profile-documents-panel";
import { ProfileOverviewPanel } from "./profile-overview-panel";
import { ProfileSettingsPanel } from "./profile-settings-panel";
import { ProfileYucayekePanel } from "./profile-yucayeke-panel";
import {
  type ProfileActivityData,
  type ProfileDocumentsData,
  type ProfileKinshipData,
  type ProfileLineageTabValue,
  type ProfileOverviewData,
  type ProfileSettingsData,
  type ProfileYucayekeData,
} from "../config/profile-config";

export function ProfileLineageSection({
  kinshipData,
  overviewData,
  yucayekeData,
  documentsData,
  activityData,
  settingsData,
}: Readonly<{
  activityData: ProfileActivityData;
  kinshipData: ProfileKinshipData;
  overviewData: ProfileOverviewData;
  yucayekeData: ProfileYucayekeData;
  documentsData: ProfileDocumentsData;
  settingsData: ProfileSettingsData;
}>) {
  const t = useTranslations("profile");
  const [activeTab, setActiveTab] =
    useState<ProfileLineageTabValue>("overview");
  const tabPanelBaseId = useId();
  const activeTabLabel = t(`tabs.${activeTab}`);

  return (
    <section
      aria-label={t("tabs.ariaLabel")}
      className="border-border bg-surface shadow-card mt-8 w-full overflow-hidden rounded-2xl border sm:mt-10"
    >
      <ProfileLineageTabs
        activeTab={activeTab}
        idBase={tabPanelBaseId}
        onChange={setActiveTab}
      />

      <div className="p-5 sm:p-6 lg:p-8">
        {activeTab === "overview" ? (
          <div
            aria-labelledby={`${tabPanelBaseId}-overview-tab`}
            id={`${tabPanelBaseId}-overview-panel`}
            role="tabpanel"
          >
            <ProfileOverviewPanel overviewData={overviewData} />
          </div>
        ) : activeTab === "kinship" ? (
          <div
            aria-labelledby={`${tabPanelBaseId}-kinship-tab`}
            id={`${tabPanelBaseId}-kinship-panel`}
            role="tabpanel"
          >
            <ProfileKinshipPanel kinshipData={kinshipData} />
          </div>
        ) : activeTab === "yucayeke" ? (
          <div
            aria-labelledby={`${tabPanelBaseId}-yucayeke-tab`}
            id={`${tabPanelBaseId}-yucayeke-panel`}
            role="tabpanel"
          >
            <ProfileYucayekePanel yucayekeData={yucayekeData} />
          </div>
        ) : activeTab === "documents" ? (
          <div
            aria-labelledby={`${tabPanelBaseId}-documents-tab`}
            id={`${tabPanelBaseId}-documents-panel`}
            role="tabpanel"
          >
            <ProfileDocumentsPanel documentsData={documentsData} />
          </div>
        ) : activeTab === "activity" ? (
          <div
            aria-labelledby={`${tabPanelBaseId}-activity-tab`}
            id={`${tabPanelBaseId}-activity-panel`}
            role="tabpanel"
          >
            <ProfileActivityPanel activityData={activityData} />
          </div>
        ) : activeTab === "settings" ? (
          <div
            aria-labelledby={`${tabPanelBaseId}-settings-tab`}
            id={`${tabPanelBaseId}-settings-panel`}
            role="tabpanel"
          >
            <ProfileSettingsPanel settingsData={settingsData} />
          </div>
        ) : (
          <div
            aria-labelledby={`${tabPanelBaseId}-${activeTab}-tab`}
            className={cn(sharedStyles.emptyStateRaised, "px-4 py-8")}
            id={`${tabPanelBaseId}-${activeTab}-panel`}
            role="tabpanel"
          >
            <p
              className={cn(
                sharedStyles.emptyTitle,
                "text-[16px] sm:text-[17px]",
              )}
            >
              {activeTabLabel}
            </p>
            <p
              className={cn(
                sharedStyles.emptyDescription,
                "mt-2 text-[13px] sm:text-[14px]",
              )}
            >
              {t("tabs.notImplemented")}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
