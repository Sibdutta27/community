export type CommunityQuickLinkItem = Readonly<{
  description: string;
  href: string;
  iconBackgroundClassName: string;
  iconSrc: string;
  title: string;
}>;

export const communityQuickLinks: readonly CommunityQuickLinkItem[] = [
  {
    description:
      "Explore available member services, practical resources, and support options for everyday community needs.",
    href: "/services",
    iconBackgroundClassName: "bg-[#9f2f2f]",
    iconSrc: "/icons/events/service-directory.svg",
    title: "Service Directory",
  },
  {
    description:
      "Open your saved records, member materials, and essential documents from one organized place.",
    href: "/profile",
    iconBackgroundClassName: "bg-[#239ea0]",
    iconSrc: "/icons/events/document-library.svg",
    title: "Document Library",
  },
  {
    description:
      "Get guidance, support answers, and trusted help resources for platform and membership questions.",
    href: "/contact",
    iconBackgroundClassName: "bg-[#2ea9c8]",
    iconSrc: "/icons/events/help-center.svg",
    title: "Help Center",
  },
] as const;
