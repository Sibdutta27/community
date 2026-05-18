export type YucayekeHighlightTone = "teal" | "copper" | "green";

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

export const yucayekeWelcomeContent = {
  title: "Welcome to Guainía",
  paragraphs: [
    "Guainía was one of the most prominent coastal Yucayeke regions in pre-colonial Borikén, strategically positioned along the northwest shores. This region was known for its skilled fishermen, expert canoe builders, and thriving maritime trade networks that connected communities across the Caribbean.",
    "The people of Guainía developed sophisticated fishing techniques, sustainable coastal management practices, and maintained strong spiritual connections to the ocean. Today, descendants from this region continue to honor these traditions while building modern community bonds.",
  ],
  map: {
    alt: "Illustrated topographic map of the Guainía coastal region",
    src: "/images/yucayeke-map.svg",
  },
} as const;

export const yucayekeHighlights: readonly YucayekeHighlight[] = [
  {
    title: "Maritime Heritage",
    description:
      "Deep connection to ocean traditions, fishing practices, and coastal stewardship.",
    iconSrc: "/icons/yucayeke/maritime-heritage.svg",
    tone: "teal",
  },
  {
    title: "Trade Networks",
    description:
      "Historical hub for inter-island commerce and cultural exchange across the Caribbean.",
    iconSrc: "/icons/yucayeke/trade-networks.svg",
    tone: "copper",
  },
  {
    title: "Strong Community",
    description:
      "Active member network with regular gatherings, cultural events, and shared support.",
    iconSrc: "/icons/yucayeke/strong-community.svg",
    tone: "green",
  },
] as const;

export const yucayekeLegacyContent = {
  badge: "Historical Background",
  titlePrefix: "The Legacy of",
  titleHighlight: "Guainía",
  description:
    "Understanding the rich history and cultural significance of your ancestral territory.",
  periods: [
    {
      yearLabel: "1493",
      title: "Pre-Colonial Era (Before 1493)",
      description:
        "Guainía was established as one of the principal Yucayeke regions under the leadership of respected caciques. The community thrived through sustainable fishing practices, advanced agricultural techniques in coastal valleys, and extensive trade networks with neighboring islands. Archaeological evidence shows sophisticated settlement patterns, ceremonial plazas, and evidence of complex social organization.",
    },
    {
      yearLabel: "1898",
      title: "Colonial Period (1493-1898)",
      description:
        "During Spanish colonization, the Guainía region experienced significant upheaval. Many Taíno people were forced into encomienda labor systems, yet communities maintained cultural practices through resistance and adaptation. Coastal settlements became strategic locations for maritime activities, and Indigenous knowledge of local waters proved invaluable. Despite attempts at cultural erasure, maternal lineages preserved traditions, language fragments, and spiritual practices in secret.",
    },
    {
      yearLabel: "1900",
      title: "Modern Revival (1900s-Present)",
      description:
        "The 20th and 21st centuries have seen a powerful resurgence of Taíno identity in the Guainía region. Descendants have reconnected through genealogical research, cultural education programs, and community organizing. Today, Guainía members actively participate in language revitalization efforts, traditional craft workshops, ceremonial gatherings, and advocacy for Indigenous rights. The digital platform has enabled unprecedented connection among regional members.",
    },
  ] as const satisfies readonly YucayekeLegacyPeriod[],
} as const;

export const yucayekeConnectionContent = {
  badge: "Get Involved",
  title: "Connect with Your Yucayeke Community",
  description:
    "Whether you want to attend events, volunteer, or simply connect with other members, we're here to help you engage with your ancestral community.",
  links: [
    {
      title: "Community Events",
      description:
        "Browse upcoming community events, ceremonies, and announcements.",
      ctaLabel: "Explore Events",
      href: "/community",
      iconSrc: "/icons/events/events-calendar.svg",
    },
    {
      title: "Service Directory",
      description:
        "Find available support services, resources, and member assistance.",
      ctaLabel: "Services",
      href: "/services",
      iconSrc: "/icons/events/service-directory.svg",
    },
    {
      title: "Help Center",
      description:
        "Get guidance, answers, and support for community-related questions.",
      ctaLabel: "Contact",
      href: "/services",
      iconSrc: "/icons/events/help-center.svg",
    },
  ] as const satisfies readonly YucayekeConnectionLink[],
} as const;
