import Image from "next/image";
import Link from "next/link";

import { useTranslations } from "next-intl";

import { BrandMark } from "@/components/shared/brand-mark";
import {
  footerBottomLinks,
  footerQuickLinks,
  footerSocialLinks,
  footerSupportLinks,
  type FooterSocialLink,
} from "@/constants/footer";

type ResolvedFooterLink = Readonly<{ label: string; href: string }>;

type FooterLinkListProps = Readonly<{
  title: string;
  links: ReadonlyArray<ResolvedFooterLink>;
}>;

const footerLinkClass =
  "hover:text-foreground focus-visible:ring-ring rounded-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none";

function FooterLinkList({ title, links }: FooterLinkListProps) {
  return (
    <nav aria-label={title}>
      <h3 className="text-foreground text-[15px] font-semibold">{title}</h3>

      <ul className="text-muted-foreground mt-3.5 space-y-2.5 text-[0.95rem] leading-6 sm:mt-4 sm:text-base">
        {links.map((link) => (
          <li key={link.href + link.label}>
            <Link className={footerLinkClass} href={link.href}>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function SocialIconButton({ href, label, iconSrc }: FooterSocialLink) {
  return (
    <a
      aria-label={label}
      className="focus-visible:ring-ring inline-flex size-10 items-center justify-center rounded-full transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transform-none"
      href={href}
      rel="noreferrer"
      target="_blank"
    >
      <Image alt="" aria-hidden="true" height={20} src={iconSrc} width={20} />
    </a>
  );
}

export function PublicFooter() {
  const t = useTranslations("footer");

  const quickLinks = footerQuickLinks.map((link) => ({
    label: t(`quickLinks.${link.key}`),
    href: link.href,
  }));
  const supportLinks = footerSupportLinks.map((link) => ({
    label: t(`support.${link.key}`),
    href: link.href,
  }));
  const bottomLinks = footerBottomLinks.map((link) => ({
    label: t(`bottom.${link.key}`),
    href: link.href,
  }));

  return (
    <footer className="border-border text-foreground bg-surface border-t">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
        <div className="grid gap-8 sm:gap-10 lg:grid-cols-[1.35fr_0.78fr_0.78fr_0.88fr] lg:gap-12">
          <div>
            <Link
              className="focus-visible:ring-ring inline-flex rounded-full focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              href="/"
              aria-label="Taíno Nation of Borikén — home"
            >
              <BrandMark compact showLabel={false} />
            </Link>

            <p className="text-muted-foreground mt-5 max-w-lg text-[0.98rem] leading-7 sm:mt-6 sm:text-[1.05rem] sm:leading-8">
              {t("tagline")}
            </p>

            <div className="bg-border mt-6 h-px w-full max-w-96" />

            <div className="mt-4 flex items-center gap-2 sm:gap-2.5">
              {footerSocialLinks.map((item) => (
                <SocialIconButton key={item.label} {...item} />
              ))}
            </div>
          </div>

          <FooterLinkList title={t("headings.quickLinks")} links={quickLinks} />

          <FooterLinkList title={t("headings.support")} links={supportLinks} />

          <section>
            <h3 className="text-foreground text-[15px] font-semibold">
              {t("headings.contact")}
            </h3>

            <div className="text-muted-foreground mt-3.5 space-y-2.5 text-[0.95rem] leading-6 sm:mt-4 sm:text-base">
              <a
                className="hover:text-foreground focus-visible:ring-ring block w-fit rounded-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                href="mailto:info@tainonation.org"
              >
                info@tainonation.org
              </a>
              <address className="not-italic">
                123 Cacique Avenue
                <br />
                San Juan, PR 00901
              </address>
            </div>
          </section>
        </div>
      </div>

      <div className="border-border border-t">
        <div className="text-muted-foreground mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 text-[0.8rem] sm:px-6 sm:text-[0.85rem] lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <p>{t("copyright")}</p>

          <nav
            aria-label={t("legalAria")}
            className="flex flex-wrap items-center gap-x-2 gap-y-1 lg:justify-end"
          >
            {bottomLinks.map((link, index) => (
              <span key={link.href + link.label} className="flex items-center">
                {index > 0 ? (
                  <span aria-hidden="true" className="text-border mx-2">
                    •
                  </span>
                ) : null}
                <Link className={footerLinkClass} href={link.href}>
                  {link.label}
                </Link>
              </span>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
