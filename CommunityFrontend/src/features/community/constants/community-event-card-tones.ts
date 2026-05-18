export type CommunityEventCardTone =
  | "cultural"
  | "workshop"
  | "ceremony"
  | "social";

const communityEventToneByCategoryKey: Record<string, CommunityEventCardTone> =
  {
    ceremonies: "ceremony",
    cultural_events: "cultural",
    social_events: "social",
    workshops: "workshop",
  };

export const communityEventCardClasses: Record<CommunityEventCardTone, string> =
  {
    cultural: "border-[#b8dbd6] shadow-[0_18px_42px_-34px_rgba(9,95,88,0.28)]",
    workshop:
      "border-[#b6d6ea] shadow-[0_18px_42px_-34px_rgba(34,94,140,0.22)]",
    ceremony: "border-[#d8c0b8] shadow-[0_18px_42px_-34px_rgba(111,54,40,0.2)]",
    social: "border-[#f2b36a] shadow-[0_18px_42px_-34px_rgba(214,117,32,0.24)]",
  };

export const communityEventBadgeClasses: Record<
  CommunityEventCardTone,
  string
> = {
  cultural: "bg-[#dbe9e6] text-[#0b5f58]",
  workshop: "bg-[#dceaf5] text-[#275c8b]",
  ceremony: "bg-[#f0dfdb] text-[#7f251a]",
  social: "bg-[#ffe3c2] text-[#b35a00]",
};

export const communityUpcomingEventIconWrapClass =
  "border-[#0b5f58] bg-[#bff7ef] shadow-[0_16px_24px_-18px_rgba(9,95,88,0.45)]";

export function getCommunityEventTone(categoryKey?: string | null) {
  return (
    communityEventToneByCategoryKey[categoryKey ?? "cultural_events"] ??
    "cultural"
  );
}
