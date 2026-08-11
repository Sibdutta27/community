import type { Metadata } from "next";
import type { ReactNode } from "react";

import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";

import { FeedbackWidget } from "@/features/feedback/components/feedback-widget";
import { AppProviders } from "@/providers/app-providers";
import { cinzel, lato, montserrat } from "@/styles/fonts";

import "./globals.css";

// Metadata follows the cookie locale (same resolution as the page content),
// replacing the static `siteConfig`-based export.
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata");

  return {
    title: {
      default: t("title"),
      template: `%s | ${t("title")}`,
    },
    description: t("description"),
  };
}

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
          <AppProviders>
            {children}
            {/* Root layout is the only tree shared by the public, auth and
                protected route groups — mounting the feedback launcher here
                keeps it reachable from every page. */}
            <FeedbackWidget />
          </AppProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
