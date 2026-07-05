export type YucayekeHighlightTone = "teal" | "copper" | "green";

/**
 * Resolved card shapes passed to the leaf components. The copy is authored in
 * `messages/{en,es}.json` under `yucayeke.*` and resolved in the section
 * components; only structural (locale-neutral) data lives in the arrays below.
 */
export type YucayekeHighlight = Readonly<{
  description: string;
  iconSrc: string;
  title: string;
  tone: YucayekeHighlightTone;
}>;

export type YucayekeLegacyPeriod = Readonly<{
  description: string;
  title: string;
  yearLabel: string;
}>;

export type YucayekeConnectionLink = Readonly<{
  ctaLabel: string;
  description: string;
  href: string;
  iconSrc: string;
  title: string;
}>;

export const yucayekeMap = {
  alt: "yucayeke.welcome.mapAlt",
  src: "/images/yucayeke-map.svg",
} as const;

export const yucayekeHighlights = [
  {
    key: "maritime",
    iconSrc: "/icons/yucayeke/maritime-heritage.svg",
    tone: "teal",
  },
  {
    key: "trade",
    iconSrc: "/icons/yucayeke/trade-networks.svg",
    tone: "copper",
  },
  {
    key: "community",
    iconSrc: "/icons/yucayeke/strong-community.svg",
    tone: "green",
  },
] as const satisfies readonly {
  key: string;
  iconSrc: string;
  tone: YucayekeHighlightTone;
}[];

export const yucayekeLegacyPeriods = [
  { key: "preColonial", yearLabel: "1493" },
  { key: "colonial", yearLabel: "1898" },
  { key: "modern", yearLabel: "1900" },
] as const satisfies readonly { key: string; yearLabel: string }[];

export const yucayekeConnectionLinks = [
  {
    key: "events",
    href: "/community",
    iconSrc: "/icons/events/events-calendar.svg",
  },
  {
    key: "services",
    href: "/services",
    iconSrc: "/icons/events/service-directory.svg",
  },
  { key: "help", href: "/services", iconSrc: "/icons/events/help-center.svg" },
] as const satisfies readonly { key: string; href: string; iconSrc: string }[];
