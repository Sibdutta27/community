import { Cinzel, Lato, Montserrat } from "next/font/google";

// Warm & light design system: Cinzel for display/headings, Montserrat for
// body/UI, Lato as the alternate body face. The compatibility exports below
// keep every existing import working — `poppins` and `inter` resolve to the
// body faces.

export const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
  variable: "--font-display",
});

export const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-body",
});

export const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-body-alt",
});

// Compatibility aliases for existing component imports.
export const poppins = lato;
export const inter = montserrat;
