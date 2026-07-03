import Image from "next/image";
import Link from "next/link";

import { BrandMark } from "@/components/shared/brand-mark";
import {
  footerBottomLinks,
  footerQuickLinks,
  footerSocialLinks,
  footerSupportLinks,
  type FooterLink,
  type FooterSocialLink,
} from "@/constants/footer";

type FooterLinkListProps = Readonly<{
  title: string;
  links: ReadonlyArray<FooterLink>;
}>;

function FooterLinkList({ title, links }: FooterLinkListProps) {
  return (
    <section>
      <h3 className="text-foreground text-[15px] font-semibold">{title}</h3>

      <ul className="text-muted-foreground mt-3.5 space-y-2.5 text-[0.95rem] leading-6 sm:mt-4 sm:text-base">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              className="hover:text-foreground transition-colors"
              href={link.href}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function SocialIconButton({ href, label, iconSrc }: FooterSocialLink) {
  return (
    <a
      aria-label={label}
      className="inline-flex size-8 items-center justify-center transition-transform hover:scale-105 sm:size-9"
      href={href}
      rel="noreferrer"
      target="_blank"
    >
      <Image alt="" aria-hidden="true" height={20} src={iconSrc} width={20} />
    </a>
  );
}

export function PublicFooter() {
  return (
    <footer className="border-border text-foreground bg-surface border-t">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
        <div className="grid gap-8 sm:gap-10 lg:grid-cols-[1.35fr_0.78fr_0.78fr_0.88fr] lg:gap-12">
          <div>
            <Link className="inline-flex" href="/">
              <BrandMark compact showLabel={false} />
            </Link>

            <p className="text-muted-foreground mt-5 max-w-lg text-[0.98rem] leading-7 sm:mt-6 sm:text-[1.05rem] sm:leading-8">
              Preserving Indigenous heritage through land, lineage, and
              community connection.
            </p>

            <div className="bg-border mt-6 h-px w-full max-w-96" />

            <div className="mt-4 flex items-center gap-2 sm:gap-2.5">
              {footerSocialLinks.map((item) => (
                <SocialIconButton key={item.label} {...item} />
              ))}
            </div>
          </div>

          <FooterLinkList title="Quick Links" links={footerQuickLinks} />

          <FooterLinkList title="Support" links={footerSupportLinks} />

          <section>
            <h3 className="text-foreground text-[15px] font-semibold">
              Contact
            </h3>

            <div className="text-muted-foreground mt-3.5 space-y-2.5 text-[0.95rem] leading-6 sm:mt-4 sm:text-base">
              <a
                className="hover:text-foreground block transition-colors"
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
          <p>
            © 2024 Taíno Nation of Borikén. All rights reserved. Living
            Indigenous Sovereignty.
          </p>

          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 lg:justify-end">
            {footerBottomLinks.map((link, index) => (
              <span key={link.label} className="flex items-center">
                {index > 0 ? <span className="text-border mx-2">•</span> : null}
                <Link
                  className="hover:text-foreground transition-colors"
                  href={link.href}
                >
                  {link.label}
                </Link>
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
