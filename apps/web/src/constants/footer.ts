export type FooterLink = Readonly<{
  /** Key into the matching `footer.*` message group. */
  key: string;
  href: string;
}>;

export type FooterSocialLink = Readonly<{
  label: string;
  href: string;
  iconSrc: string;
}>;

export const footerQuickLinks = [
  { key: "about", href: "/about" },
  { key: "enrollment", href: "/enrollment" },
  { key: "yucayeke", href: "/yucayeke" },
  { key: "services", href: "/services" },
  { key: "events", href: "/community" },
  { key: "cultural", href: "/community" },
] as const satisfies ReadonlyArray<FooterLink>;

export const footerSupportLinks = [
  { key: "help", href: "/contact" },
  { key: "faq", href: "/enrollment#enrollment-faq" },
  { key: "contact", href: "/contact" },
  { key: "documents", href: "/contact" },
  { key: "technical", href: "/contact" },
  { key: "privacy", href: "/privacy-policy" },
] as const satisfies ReadonlyArray<FooterLink>;

// Social labels are proper nouns — never translated.
export const footerSocialLinks = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/",
    iconSrc: "/icons/facebook.svg",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com",
    iconSrc: "/icons/instagram.svg",
  },
  {
    label: "Twitter",
    href: "https://twitter.com/",
    iconSrc: "/icons/twitter.svg",
  },
] as const satisfies ReadonlyArray<FooterSocialLink>;

export const footerBottomLinks = [
  { key: "privacy", href: "/privacy-policy" },
  { key: "terms", href: "/terms-of-service" },
  { key: "cookies", href: "/cookie-policy" },
] as const satisfies ReadonlyArray<FooterLink>;
