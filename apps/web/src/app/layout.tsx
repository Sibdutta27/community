import type { Metadata } from "next";
import type { ReactNode } from "react";

import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

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
};

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default async function RootLayout({ children }: RootLayoutProps) {
  // Locale is resolved server-side from the `community_locale` cookie
  // (see src/i18n/request.ts) — no URL prefix involved.
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      data-scroll-behavior="smooth"
      className={`${cinzel.variable} ${lato.variable} ${montserrat.variable}`}
    >
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AppProviders>{children}</AppProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
