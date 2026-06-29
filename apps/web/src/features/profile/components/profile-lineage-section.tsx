"use client";

import { useId, useState } from "react";

import { cn } from "@/lib/utils";

import sharedStyles from "../styles/profile-shared.module.scss";
import { ProfileActivityPanel } from "./profile-activity-panel";
import { ProfileLineageStatCards } from "./profile-lineage-stat-cards";
import { ProfileLineageTabs } from "./profile-lineage-tabs";
import { ProfileLineageTable } from "./profile-lineage-table";
import { ProfileLineageTree } from "./profile-lineage-tree";
import { ProfileLineageViewToggle } from "./profile-lineage-view-toggle";
import { ProfileDocumentsPanel } from "./profile-documents-panel";
import { ProfileOverviewPanel } from "./profile-overview-panel";
import { ProfileSettingsPanel } from "./profile-settings-panel";
import { ProfileYucayekePanel } from "./profile-yucayeke-panel";
import {
  type ProfileActivityData,
  profileConfig,
  type ProfileDocumentsData,
  type ProfileLineageEntry,
  type ProfileLineageStat,
  type ProfileLineageTabValue,
  type ProfileLineageTreeData,
  type ProfileOverviewData,
  type ProfileSettingsData,
  type ProfileYucayekeData,
} from "../config/profile-config";

type ViewMode = "table" | "tree";

export function ProfileLineageSection({
  lineageEntries,
  lineageTreeData,
  lineageStats,
  overviewData,
  yucayekeData,
  documentsData,
  activityData,
  settingsData,
}: Readonly<{
  activityData: ProfileActivityData;
  lineageEntries: readonly ProfileLineageEntry[];
  lineageTreeData: ProfileLineageTreeData;
  lineageStats: readonly ProfileLineageStat[];
  overviewData: ProfileOverviewData;
  yucayekeData: ProfileYucayekeData;
  documentsData: ProfileDocumentsData;
  settingsData: ProfileSettingsData;
}>) {
  const [activeTab, setActiveTab] =
    useState<ProfileLineageTabValue>("overview");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
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
        ) : activeTab === "lineage" ? (
          <div
            aria-labelledby={`${tabPanelBaseId}-lineage-tab`}
            id={`${tabPanelBaseId}-lineage-panel`}
            role="tabpanel"
          >
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between lg:gap-5">
              <div className="max-w-3xl">
                <h2 className="text-[1.45rem] leading-[1.05] font-semibold tracking-[-0.04em] text-[#245f6d] sm:text-[1.7rem] lg:text-[2rem]">
                  Maternal Lineage Summary
                </h2>
                <p className="mt-2 text-[0.88rem] leading-5 text-[#245f6d] sm:text-[0.93rem] lg:text-[0.98rem]">
                  Your documented ancestral line connecting you to Indigenous
                  Taíno heritage
                </p>
              </div>

              <ProfileLineageViewToggle
                value={viewMode}
                onChange={setViewMode}
              />
            </div>

            {viewMode === "table" ? (
              <ProfileLineageTable entries={lineageEntries} />
            ) : (
              <ProfileLineageTree treeData={lineageTreeData} />
            )}

            <ProfileLineageStatCards stats={lineageStats} />
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
              This section is not implemented yet. Overview, Lineage, Yucayeke,
              Documents, Activity, and Settings tabs are currently available.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
