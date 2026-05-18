export type FooterLink = Readonly<{
  label: string;
  href: string;
}>;

export type FooterSocialLink = Readonly<{
  label: string;
  href: string;
  iconSrc: string;
}>;

export const footerQuickLinks = [
  { label: "About Us", href: "/about" },
  { label: "Enrollment Process", href: "/enrollment" },
  { label: "Yucayeke Regions", href: "/yucayeke" },
  { label: "Member Services", href: "/services" },
  { label: "Community Events", href: "/community" },
  { label: "Cultural Resources", href: "/community" },
] as const satisfies ReadonlyArray<FooterLink>;

export const footerSupportLinks = [
  { label: "Help Center", href: "/contact" },
  { label: "Enrollment FAQ", href: "/enrollment#enrollment-faq" },
  { label: "Contact Support", href: "/contact" },
  { label: "Document Assistance", href: "/contact" },
  { label: "Technical Support", href: "/contact" },
  { label: "Privacy Policy", href: "/privacy-policy" },
] as const satisfies ReadonlyArray<FooterLink>;

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
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms of Service", href: "/terms-of-service" },
  { label: "Cookie Policy", href: "/cookie-policy" },
] as const satisfies ReadonlyArray<FooterLink>;
