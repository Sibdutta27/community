/** Keys into the `community.quickLinks.items.*` message group. */
export type CommunityQuickLinkKey = "services" | "documents" | "help";

/**
 * Structural (locale-neutral) data for the community quick links. Titles and
 * descriptions are authored in `messages/{en,es}.json` under
 * `community.quickLinks.items.*` and resolved in the section component.
 *
 * Governance restyle: one neutral charcoal tile for every quick link — the
 * white outline icons stay legible without multicolor tiles.
 */
export const communityQuickLinks = [
  {
    key: "services",
    href: "/services",
    iconBackgroundClassName: "bg-foreground",
    iconSrc: "/icons/events/service-directory.svg",
  },
  {
    key: "documents",
    href: "/profile",
    iconBackgroundClassName: "bg-foreground",
    iconSrc: "/icons/events/document-library.svg",
  },
  {
    key: "help",
    href: "/contact",
    iconBackgroundClassName: "bg-foreground",
    iconSrc: "/icons/events/help-center.svg",
  },
] as const satisfies readonly {
  key: CommunityQuickLinkKey;
  href: string;
  iconBackgroundClassName: string;
  iconSrc: string;
}[];
