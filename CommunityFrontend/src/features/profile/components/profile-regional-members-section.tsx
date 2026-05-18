"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { SvgIcon } from "@/components/shared/svg-icon";
import { cn } from "@/lib/utils";

import sharedStyles from "../styles/profile-shared.module.scss";
import { ProfileRegionalMemberCard } from "./profile-regional-member-card";
import { filterRegionalMembers } from "./profile-regional-members-utils";
import type { ProfileRegionalMember } from "../config/profile-config";

export function ProfileRegionalMembersSection({
  members,
}: Readonly<{
  members: readonly ProfileRegionalMember[];
}>) {
  const [query, setQuery] = useState("");
  const filteredMembers = filterRegionalMembers(members, query);

  return (
    <section
      aria-label="Regional community members"
      className="mt-12 pb-2 sm:mt-14"
    >
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="max-w-3xl">
          <h2 className="max-w-[15ch] text-[1.45rem] leading-[1.05] font-semibold tracking-[-0.04em] text-[#245f6d] sm:max-w-none sm:text-[1.65rem] lg:text-[1.85rem] xl:text-[1.9rem]">
            Regional Community Members
          </h2>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center xl:flex-none xl:justify-end xl:gap-3">
          <label className="sr-only" htmlFor="regional-members-search">
            Search members
          </label>

          <input
            id="regional-members-search"
            className="h-[42px] w-full rounded-[12px] border border-[#c8d7dc] bg-white px-4 text-center text-[13px] tracking-[-0.02em] text-[#384347] transition outline-none focus:border-[#215A64] focus:ring-2 focus:ring-[#215A64]/15 sm:flex-1 sm:text-[14px] lg:h-[40px] lg:max-w-[14rem] lg:px-3.5 lg:text-[13px] xl:h-[44px] xl:w-[18rem] xl:max-w-[18rem] xl:px-4 xl:text-[14px]"
            placeholder="Search Members"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />

          <Button
            className="h-[42px] w-full rounded-[12px] border-2 border-[#215A64] bg-white px-4 text-[13px] font-semibold tracking-[-0.02em] text-[#215A64] shadow-none hover:bg-[#f4fbfc] hover:text-[#215A64] sm:w-[156px] sm:px-4 sm:text-[14px] lg:h-[40px] lg:w-[104px] lg:px-3 lg:text-[13px] xl:h-[44px] xl:w-[126px] xl:px-3.5 xl:text-[14px]"
            leftIcon={
              <SvgIcon
                sizeClassName="size-4"
                src="/icons/profile/filter.svg"
                toneColor="#215A64"
              />
            }
            variant="ghost"
            type="button"
          >
            Filter
          </Button>
        </div>
      </div>

      <div className="mt-6 grid gap-3 lg:grid-cols-2 lg:gap-x-4 lg:gap-y-4 xl:gap-x-5 xl:gap-y-4">
        {filteredMembers.map((member) => (
          <ProfileRegionalMemberCard
            key={member.memberId}
            memberId={member.memberId}
            name={member.name}
            portraitSrc={member.portraitSrc}
            role={member.role}
          />
        ))}
      </div>

      {filteredMembers.length === 0 ? (
        <div className={cn(sharedStyles.emptyStatePlain, "mt-6 px-4 py-8")}>
          <p className={cn(sharedStyles.emptyTitle, "text-[16px]")}>
            No members found
          </p>
          <p className={cn(sharedStyles.emptyDescription, "mt-2 text-[13px]")}>
            Try a different name or member ID.
          </p>
        </div>
      ) : null}
    </section>
  );
}
