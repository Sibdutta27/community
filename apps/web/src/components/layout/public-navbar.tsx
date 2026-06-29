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
      <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
        <div className="border-border/90 bg-surface/95 supports-backdrop-filter:bg-surface/92 flex items-center justify-between rounded-full border px-4 py-3 shadow-[0_16px_32px_-24px_rgba(21,17,13,0.18)] backdrop-blur-md">
          <Link href="/" className="shrink-0">
            <BrandMark showSubtitle={false} />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {publicNavigation.map((item) => {
              const isActive = isActivePath(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-surface-muted text-primary"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <Button variant="ghost" size="sm" asChild>
              <Link
                className={cn(isSignInPage && "text-primary")}
                href="/sign-in"
              >
                Sign In
              </Link>
            </Button>
            <Button className="text-white!" size="sm" asChild>
              <Link href="/sign-up">Apply Now</Link>
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
              className="border-border bg-surface mt-3 rounded-3xl border p-4 shadow-[0_18px_34px_-24px_rgba(21,17,13,0.2)] lg:hidden"
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
                        "rounded-2xl px-4 py-3 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-surface-muted text-primary"
                          : "text-muted-foreground hover:bg-surface-muted hover:text-foreground",
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Button variant="outline" asChild>
                  <Link
                    className={cn(isSignInPage && "text-primary")}
                    href="/sign-in"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                </Button>
                <Button className="text-white!" asChild>
                  <Link
                    href="/sign-up"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Apply Now
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
