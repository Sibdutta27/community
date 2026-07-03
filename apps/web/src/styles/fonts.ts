import { Inter } from "next/font/google";

// Elegant governance design system: Inter is the single typeface for both
// display/headings and body/UI. The compatibility exports below keep every
// existing import working — `cinzel`, `montserrat`, `lato`, `poppins` and
// `inter` all resolve to Inter.

const interDisplay = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
});

const interBody = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
});

const interBodyAlt = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body-alt",
});

export const inter = interBody;

// Compatibility aliases for existing component imports.
export const cinzel = interDisplay;
export const montserrat = interBody;
export const lato = interBodyAlt;
export const poppins = interBodyAlt;
