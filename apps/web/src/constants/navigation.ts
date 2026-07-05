/**
 * Public nav items carry `nav.*` message keys (not display strings) —
 * components resolve them with `useTranslations("nav")`.
 */
export const publicNavigation = [
  { labelKey: "aboutUs", href: "/about" },
  { labelKey: "enrollment", href: "/enrollment" },
] as const;
