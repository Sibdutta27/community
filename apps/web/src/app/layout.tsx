import type { Metadata } from "next";
import type { ReactNode } from "react";

import { siteConfig } from "@/config/site";
import { AppProviders } from "@/providers/app-providers";
import { cinzel, lato, montserrat } from "@/styles/fonts";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/images/tanoNewLogo.jpg",
    apple: "/images/tanoNewLogo.jpg",
    shortcut: "/images/tanoNewLogo.jpg",
  },
};

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body
        className={`${cinzel.variable} ${lato.variable} ${montserrat.variable}`}
      >
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
