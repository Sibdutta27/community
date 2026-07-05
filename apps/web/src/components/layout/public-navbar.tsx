"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { publicNavigation } from "@/constants/navigation";
import { mobileMenuVariants } from "@/lib/motion";
import { cn } from "@/lib/utils";

import {
  desktopNavLinkClass,
  mobileNavLinkClass,
  navbarFrameClass,
  navbarHeaderClass,
  navbarMobilePanelClass,
  navbarPillClass,
} from "@/components/layout/navbar-chrome";
import { BrandMark } from "@/components/shared/brand-mark";
import { LanguageSwitcher } from "@/components/shared/language-switcher";

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function PublicNavbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isSignInPage = isActivePath(pathname, "/sign-in");

  return (
    <motion.header
      className={navbarHeaderClass}
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.84, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className={navbarFrameClass}>
        <div className={navbarPillClass}>
          <Link
            href="/"
            className="focus-visible:ring-ring focus-visible:ring-offset-surface shrink-0 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          >
            {/* Full wordmark from `sm` up; shortened on the smallest widths
                so the pill never overflows. */}
            <BrandMark
              compact
              className="sm:hidden"
              label="Taíno Nation"
              showSubtitle={false}
            />
            <BrandMark
              compact
              className="hidden sm:inline-flex"
              showSubtitle={false}
            />
          </Link>

          <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
            {publicNavigation.map((item) => {
              const isActive = isActivePath(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={desktopNavLinkClass(isActive)}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden shrink-0 items-center gap-1.5 lg:flex xl:gap-2">
            <LanguageSwitcher />
            <Button variant="ghost" size="sm" asChild>
              <Link
                className={cn(isSignInPage && "text-foreground")}
                href="/sign-in"
              >
                Sign In
              </Link>
            </Button>
            <Button size="sm" variant="emphasis" asChild>
              <Link href="/sign-up">Enroll Today</Link>
            </Button>
          </div>

          <Button
            aria-controls="public-mobile-menu"
            aria-expanded={isMobileMenuOpen}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            className="size-10 lg:hidden"
            size="icon"
            variant="ghost"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
          >
            {isMobileMenuOpen ? (
              <X aria-hidden="true" />
            ) : (
              <Menu aria-hidden="true" />
            )}
          </Button>
        </div>

        <AnimatePresence initial={false}>
          {isMobileMenuOpen ? (
            <motion.div
              key="mobile-menu"
              id="public-mobile-menu"
              className={navbarMobilePanelClass}
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={mobileMenuVariants}
            >
              <nav aria-label="Main" className="grid gap-1">
                {publicNavigation.map((item) => {
                  const isActive = isActivePath(pathname, item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={isActive ? "page" : undefined}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={mobileNavLinkClass(isActive)}
                    >
                      {item.label}
                    </Link>
                  );
                })}

                <LanguageSwitcher variant="row" />
              </nav>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Button variant="outline" asChild>
                  <Link
                    className={cn(isSignInPage && "text-foreground")}
                    href="/sign-in"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                </Button>
                <Button variant="emphasis" asChild>
                  <Link
                    href="/sign-up"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Enroll Today
                  </Link>
                </Button>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
