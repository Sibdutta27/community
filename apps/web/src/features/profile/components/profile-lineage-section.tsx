"use client";

import { useId, useState } from "react";

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
  profileConfig,
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
  const [activeTab, setActiveTab] =
    useState<ProfileLineageTabValue>("overview");
  const tabPanelBaseId = useId();
  const activeTabLabel =
    profileConfig.lineageTabs.find((tab) => tab.value === activeTab)?.label ??
    "Section";

  return (
    <section
      aria-label="Profile sections"
      className="mt-8 w-full overflow-hidden rounded-[24px] border border-[#d8d2c3] bg-[#fbf7e8] shadow-[0_22px_52px_-40px_rgba(80,85,65,0.2)] sm:mt-10"
    >
      <ProfileLineageTabs
        activeTab={activeTab}
        idBase={tabPanelBaseId}
        onChange={setActiveTab}
      />

      <div className="px-3.5 py-4 sm:px-4 sm:py-5 lg:px-6 lg:py-6">
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
              This section is not implemented yet. Overview, Kinship, Yucayeke,
              Documents, Activity, and Settings tabs are currently available.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
