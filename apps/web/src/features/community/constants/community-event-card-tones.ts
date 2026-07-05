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

// Governance restyle: every event card shares the one elevated-surface
// recipe (hairline border + soft ink shadow) instead of per-category
// multicolor borders — the tone map survives only as an API shim.
const eventCardClasses = "border-border shadow-card-soft";

export const communityEventCardClasses: Record<CommunityEventCardTone, string> =
  {
    cultural: eventCardClasses,
    workshop: eventCardClasses,
    ceremony: eventCardClasses,
    social: eventCardClasses,
  };

// Category badges are neutral/info chips: celeste tint with deep-azul text.
const eventBadgeClasses = "bg-secondary text-secondary-foreground";

export const communityEventBadgeClasses: Record<
  CommunityEventCardTone,
  string
> = {
  cultural: eventBadgeClasses,
  workshop: eventBadgeClasses,
  ceremony: eventBadgeClasses,
  social: eventBadgeClasses,
};

// Neutral icon tile (surface-muted + ink) — matches the enrollment
// section-header tile.
export const communityUpcomingEventIconWrapClass =
  "border-border bg-surface-muted text-foreground";

export function getCommunityEventTone(categoryKey?: string | null) {
  return (
    communityEventToneByCategoryKey[categoryKey ?? "cultural_events"] ??
    "cultural"
  );
}
