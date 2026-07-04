"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { useQueryClient } from "@tanstack/react-query";
import {
  ChevronDown,
  Loader2,
  LogOut,
  Menu,
  ShieldCheck,
  User,
  X,
} from "lucide-react";

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
import { Button } from "@/components/ui/button";
import { useLogoutMutation } from "@/features/auth/lib/auth-mutations";
import type { AuthUser } from "@/lib/auth";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "My Profile", href: "/profile" },
  { label: "Yucayeke", href: "/yucayeke" },
  { label: "Community", href: "/community" },
  { label: "Services", href: "/services" },
] as const;

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function ProtectedNavbar({ user }: Readonly<{ user: AuthUser }>) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const logoutMutation = useLogoutMutation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isProfileMenuOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!profileMenuRef.current) {
        return;
      }

      const targetNode = event.target as Node | null;

      if (targetNode && !profileMenuRef.current.contains(targetNode)) {
        setIsProfileMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isProfileMenuOpen]);

  const handleLogout = async () => {
    logoutMutation.reset();

    try {
      await logoutMutation.mutateAsync();
      queryClient.clear();
      setIsMobileMenuOpen(false);
      setIsProfileMenuOpen(false);
      router.replace("/sign-in");
      router.refresh();
    } catch {
      return;
    }
  };

  const isLoggingOut = logoutMutation.isPending;
  const logoutError =
    logoutMutation.error instanceof Error ? logoutMutation.error.message : null;
  const dropdownItemClass =
    "text-foreground hover:bg-surface-muted flex w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold no-underline transition-colors";

  return (
    <header className={navbarHeaderClass}>
      <div className={navbarFrameClass}>
        <div className={navbarPillClass}>
          <Link href="/" className="shrink-0">
            {/* Small wordmark so the brand fits next to the app nav + avatar;
                logo-only on the very smallest widths to avoid overflow. */}
            <BrandMark compact showLabel={false} className="min-[420px]:hidden" />
            <BrandMark
              compact
              className="hidden min-[420px]:inline-flex"
              label="Taíno Nation"
              showSubtitle={false}
              wordmarkSize="sm"
            />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => {
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

          <div className="hidden items-center gap-3 lg:flex lg:gap-2.5 xl:gap-3">
            <LanguageSwitcher />
            <div className="relative" ref={profileMenuRef}>
              <button
                aria-expanded={isProfileMenuOpen}
                aria-haspopup="menu"
                className="flex cursor-pointer list-none items-center gap-3 rounded-full px-2 py-1.5 outline-none lg:gap-2.5 lg:px-1.5 lg:py-1 xl:gap-3 xl:px-2 xl:py-1.5"
                type="button"
                onClick={() => setIsProfileMenuOpen((value) => !value)}
              >
                <div className="text-secondary-foreground bg-secondary relative flex size-11 items-center justify-center rounded-full border-border border text-sm font-semibold shadow-[0_12px_24px_-18px_rgba(20,26,34,0.2)] lg:size-10 lg:text-[0.82rem] xl:size-11 xl:text-sm">
                  {getInitials(user.name)}
                  <span className="bg-primary absolute right-0 bottom-0 flex size-4 items-center justify-center rounded-full border-2 border-white text-[10px] text-white lg:size-3.5 xl:size-4">
                    <ShieldCheck className="size-2.5 lg:size-2 xl:size-2.5" />
                  </span>
                </div>

                {/* Name/ID text needs more room than the lg pill has once the
                    wordmark shows — avatar-only at lg, text from xl. */}
                <div className="hidden text-left leading-tight xl:block">
                  <p className="text-foreground max-w-[12rem] truncate text-sm font-semibold whitespace-nowrap">
                    {user.name}
                  </p>
                  <p className="text-muted-foreground max-w-[12rem] truncate text-xs whitespace-nowrap">
                    Member ID: {user.publicId ?? user.id}
                  </p>
                </div>

                <ChevronDown
                  className={cn(
                    "text-muted-foreground size-4 transition-transform lg:size-3.5 xl:size-4",
                    isProfileMenuOpen && "rotate-180",
                  )}
                />
              </button>

              {isProfileMenuOpen ? (
                <div className="border-border bg-surface absolute top-[calc(100%+0.75rem)] right-0 w-56 rounded-2xl border p-2 shadow-[0_18px_34px_-24px_rgba(20,26,34,0.22)]">
                  <Link
                    className={dropdownItemClass}
                    href="/profile"
                    onClick={() => setIsProfileMenuOpen(false)}
                  >
                    <User className="size-4" />
                    Profile
                  </Link>
                  <button
                    className={dropdownItemClass}
                    onClick={handleLogout}
                    type="button"
                  >
                    <LogOut className="size-4" />
                    {isLoggingOut ? "Signing out..." : "Sign out"}
                  </button>
                  {logoutError ? (
                    <p className="px-3 py-2 text-xs leading-5 text-destructive">
                      {logoutError}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>

          <Button
            aria-expanded={isMobileMenuOpen}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            className="size-10 lg:hidden"
            size="icon"
            variant="ghost"
            onClick={() => setIsMobileMenuOpen((value) => !value)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>

        {isMobileMenuOpen ? (
          <div className={navbarMobilePanelClass}>
            <div className="border-border bg-surface-muted flex items-center gap-3 rounded-2xl border p-3">
              <div className="text-secondary-foreground bg-secondary relative flex size-12 items-center justify-center rounded-full border-border border text-sm font-semibold shadow-[0_12px_24px_-18px_rgba(20,26,34,0.2)]">
                {getInitials(user.name)}
                <span className="bg-primary absolute right-0 bottom-0 flex size-4 items-center justify-center rounded-full border-2 border-white text-[10px] text-white">
                  <ShieldCheck className="size-2.5" />
                </span>
              </div>

              <div className="min-w-0">
                <p className="text-foreground truncate text-sm font-semibold">
                  {user.name}
                </p>
                <p className="text-muted-foreground truncate text-xs">
                  Member ID: {user.publicId ?? user.id}
                </p>
              </div>
            </div>

            <nav className="mt-4 grid gap-1">
              {navItems.map((item) => {
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

            <button
              className="border-border bg-surface text-foreground hover:bg-surface-muted focus-visible:ring-ring focus-visible:ring-offset-background mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border px-4 py-3 text-sm font-semibold whitespace-nowrap shadow-[0_12px_24px_-18px_rgba(20,26,34,0.18)] transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              onClick={handleLogout}
              type="button"
            >
              {isLoggingOut ? (
                <Loader2
                  className="size-4 shrink-0 animate-spin"
                  aria-hidden="true"
                />
              ) : (
                <LogOut className="size-4 shrink-0" aria-hidden="true" />
              )}
              <span className="leading-none whitespace-nowrap">
                {isLoggingOut ? "Signing out..." : "Sign out"}
              </span>
            </button>
            {logoutError ? (
              <p className="mt-3 text-sm leading-6 text-destructive">
                {logoutError}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </header>
  );
}
