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
      className="width-before-scroll-bar fixed inset-x-0 top-0 z-50"
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.84, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="border-border bg-background/95 supports-backdrop-filter:bg-background/85 border-b backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="shrink-0">
            {/* Full wordmark is wide — at lg (1024–1280) show a shortened
                mark so the row never overflows; the full wordmark returns
                at xl. */}
            <BrandMark
              className="lg:hidden xl:inline-flex"
              showSubtitle={false}
            />
            <BrandMark
              compact
              className="hidden lg:inline-flex xl:hidden"
              label="Taíno Nation"
              showSubtitle={false}
            />
          </Link>

          <nav className="hidden items-center gap-0.5 lg:flex xl:gap-1">
            {publicNavigation.map((item) => {
              const isActive = isActivePath(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "px-2.5 py-2 text-sm whitespace-nowrap transition-colors xl:px-3",
                    isActive
                      ? "text-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground",
                  )}
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
            <Button size="sm" asChild>
              <Link href="/sign-up">Enroll Today</Link>
            </Button>
          </div>

          <Button
            aria-expanded={isMobileMenuOpen}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            className="lg:hidden"
            size="icon"
            variant="ghost"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>

        <AnimatePresence initial={false}>
          {isMobileMenuOpen ? (
            <motion.div
              key="mobile-menu"
              className="border-border bg-background border-t p-4 lg:hidden"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={mobileMenuVariants}
            >
              <nav className="grid gap-1">
                {publicNavigation.map((item) => {
                  const isActive = isActivePath(pathname, item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={isActive ? "page" : undefined}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "rounded-md px-4 py-3 text-[15px] transition-colors",
                        isActive
                          ? "bg-surface-muted text-foreground font-medium"
                          : "text-muted-foreground hover:bg-surface-muted hover:text-foreground",
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              <LanguageSwitcher className="mt-2" variant="row" />

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
                <Button asChild>
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
