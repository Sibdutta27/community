import { Inter } from "next/font/google";

// Minimal Inter / black-&-white design system: Inter is the single typeface for
// the whole app (H1/H2, body, nav, labels). The legacy export names below are kept
// as Inter aliases so existing callers keep working during the redesign — each maps
// to the same CSS variable it always did, only the underlying font is now Inter.

const interDisplay = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-display",
});

const interBody = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-body",
});

const interBodyAlt = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-body-alt",
});

// Primary UI + body font.
export const inter = interBody;

// Compatibility aliases for existing component imports during the redesign — all Inter.
export const cinzel = interDisplay;
export const montserrat = interBody;
export const lato = interBodyAlt;
export const poppins = interBodyAlt;
