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
  // Roving tabindex: keyboard selection must also move focus so the
  // tablist stays operable after an arrow-key change.
  const selectTab = (value: ProfileLineageTabValue) => {
    onChange(value);
    requestAnimationFrame(() => {
      document.getElementById(`${idBase}-${value}-tab`)?.focus();
    });
  };

  return (
    <nav
      aria-label="Profile sections"
      className="border-border bg-surface-muted border-b"
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
                "border-border flex min-h-11 min-w-[7rem] flex-1 cursor-pointer items-center justify-center gap-2 border-r px-3 py-3 text-[12px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset sm:min-w-[7.5rem] sm:px-4 sm:text-[13px] lg:min-w-[8rem] lg:px-4 lg:text-[14px]",
                isActive
                  ? "bg-surface text-primary font-semibold"
                  : "text-muted-foreground hover:bg-surface/60 hover:text-foreground",
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
                  selectTab(profileConfig.lineageTabs[nextIndex].value);
                }

                if (event.key === "ArrowLeft") {
                  event.preventDefault();
                  const nextIndex =
                    (currentIndex - 1 + profileConfig.lineageTabs.length) %
                    profileConfig.lineageTabs.length;
                  selectTab(profileConfig.lineageTabs[nextIndex].value);
                }

                if (event.key === "Home") {
                  event.preventDefault();
                  selectTab(profileConfig.lineageTabs[0].value);
                }

                if (event.key === "End") {
                  event.preventDefault();
                  selectTab(
                    profileConfig.lineageTabs[
                      profileConfig.lineageTabs.length - 1
                    ].value,
                  );
                }
              }}
            >
              <SvgIcon
                className="shrink-0"
                sizeClassName="size-4"
                toneColor={
                  isActive ? "var(--primary)" : "var(--muted-foreground)"
                }
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
