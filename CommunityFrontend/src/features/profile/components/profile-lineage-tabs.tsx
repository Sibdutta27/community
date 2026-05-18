"use client";

import { SvgIcon } from "@/components/shared/svg-icon";
import { cn } from "@/lib/utils";

import {
  profileConfig,
  type ProfileLineageTabValue,
} from "../config/profile-config";

type ProfileLineageTabsProps = Readonly<{
  activeTab: ProfileLineageTabValue;
  idBase: string;
  onChange: (value: ProfileLineageTabValue) => void;
}>;

export function ProfileLineageTabs({
  activeTab,
  idBase,
  onChange,
}: ProfileLineageTabsProps) {
  return (
    <nav
      aria-label="Profile sections"
      className="border-b border-[#d7d1c3] bg-[#efefef]"
    >
      <div
        aria-orientation="horizontal"
        className="flex overflow-x-auto"
        role="tablist"
      >
        {profileConfig.lineageTabs.map((tab) => {
          const isActive = activeTab === tab.value;

          return (
            <button
              key={tab.label}
              aria-controls={`${idBase}-${tab.value}-panel`}
              aria-selected={isActive}
              className={cn(
                "flex min-w-[7rem] flex-1 cursor-pointer items-center justify-center gap-2 border-r border-[#d7d1c3] px-3 py-2.5 text-[12px] font-medium transition-colors sm:min-w-[7.5rem] sm:px-4 sm:py-3 sm:text-[13px] lg:min-w-[8rem] lg:px-4 lg:text-[14px]",
                isActive
                  ? "bg-[#f6f8f6] font-bold text-[#1B4C54]"
                  : "text-[#757575] hover:bg-[#f8f8f8]",
              )}
              id={`${idBase}-${tab.value}-tab`}
              role="tab"
              tabIndex={isActive ? 0 : -1}
              type="button"
              onClick={() => onChange(tab.value)}
              onKeyDown={(event) => {
                const currentIndex = profileConfig.lineageTabs.findIndex(
                  (item) => item.value === activeTab,
                );

                if (event.key === "ArrowRight") {
                  event.preventDefault();
                  const nextIndex =
                    (currentIndex + 1) % profileConfig.lineageTabs.length;
                  onChange(profileConfig.lineageTabs[nextIndex].value);
                }

                if (event.key === "ArrowLeft") {
                  event.preventDefault();
                  const nextIndex =
                    (currentIndex - 1 + profileConfig.lineageTabs.length) %
                    profileConfig.lineageTabs.length;
                  onChange(profileConfig.lineageTabs[nextIndex].value);
                }

                if (event.key === "Home") {
                  event.preventDefault();
                  onChange(profileConfig.lineageTabs[0].value);
                }

                if (event.key === "End") {
                  event.preventDefault();
                  onChange(
                    profileConfig.lineageTabs[
                      profileConfig.lineageTabs.length - 1
                    ].value,
                  );
                }
              }}
            >
              <SvgIcon
                className={cn("shrink-0", !isActive && "opacity-80")}
                sizeClassName="size-4"
                toneColor={isActive ? "#1B4C54" : undefined}
                src={tab.iconSrc}
              />
              <span className="whitespace-nowrap">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
