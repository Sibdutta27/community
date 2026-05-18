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

import { BrandMark } from "@/components/shared/brand-mark";
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
    <header className="width-before-scroll-bar fixed inset-x-0 top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 pt-3 sm:px-6 sm:pt-4 lg:px-8 lg:pt-3">
        <div className="border-border/90 bg-surface/95 supports-backdrop-filter:bg-surface/92 flex items-center justify-between gap-3 rounded-full border px-3.5 py-2.5 shadow-[0_16px_32px_-24px_rgba(21,17,13,0.18)] backdrop-blur-md sm:gap-4 sm:px-4 sm:py-3 lg:gap-3 lg:px-3.5 lg:py-2 xl:px-4 xl:py-2.5">
          <Link href="/" className="shrink-0">
            <BrandMark compact showLabel={false} />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => {
              const isActive = isActivePath(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "shrink-0 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors lg:px-3 lg:py-1.5 lg:text-[0.92rem] xl:px-4 xl:py-2 xl:text-sm",
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

          <div className="hidden items-center gap-3 lg:flex lg:gap-2.5 xl:gap-3">
            <div className="relative" ref={profileMenuRef}>
              <button
                aria-expanded={isProfileMenuOpen}
                aria-haspopup="menu"
                className="flex cursor-pointer list-none items-center gap-3 rounded-full px-2 py-1.5 outline-none lg:gap-2.5 lg:px-1.5 lg:py-1 xl:gap-3 xl:px-2 xl:py-1.5"
                type="button"
                onClick={() => setIsProfileMenuOpen((value) => !value)}
              >
                <div className="text-secondary-foreground bg-secondary relative flex size-11 items-center justify-center rounded-full border border-[#d6c3ad] text-sm font-semibold shadow-[0_12px_24px_-18px_rgba(111,175,196,0.3)] lg:size-10 lg:text-[0.82rem] xl:size-11 xl:text-sm">
                  {getInitials(user.name)}
                  <span className="bg-primary absolute right-0 bottom-0 flex size-4 items-center justify-center rounded-full border-2 border-white text-[10px] text-white lg:size-3.5 xl:size-4">
                    <ShieldCheck className="size-2.5 lg:size-2 xl:size-2.5" />
                  </span>
                </div>

                <div className="text-left leading-tight">
                  <p className="text-foreground text-sm font-semibold lg:text-[0.92rem] xl:text-sm">
                    {user.name}
                  </p>
                  <p className="text-muted-foreground text-xs lg:text-[11px] xl:text-xs">
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
                <div className="border-border bg-surface absolute top-[calc(100%+0.75rem)] right-0 w-56 rounded-2xl border p-2 shadow-[0_18px_34px_-24px_rgba(21,17,13,0.22)]">
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
                    <p className="px-3 py-2 text-xs leading-5 text-red-600">
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
          <div className="border-border bg-surface mt-3 rounded-3xl border p-4 shadow-[0_18px_34px_-24px_rgba(21,17,13,0.22)] lg:hidden">
            <div className="border-border bg-surface-muted flex items-center gap-3 rounded-2xl border p-3">
              <div className="text-secondary-foreground bg-secondary relative flex size-12 items-center justify-center rounded-full border border-[#d6c3ad] text-sm font-semibold shadow-[0_12px_24px_-18px_rgba(111,175,196,0.3)]">
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
                    className={cn(
                      "rounded-2xl px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors",
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

            <button
              className="border-border bg-surface text-foreground hover:bg-surface-muted focus-visible:ring-ring focus-visible:ring-offset-background mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border px-4 py-3 text-sm font-semibold whitespace-nowrap shadow-[0_12px_24px_-18px_rgba(21,17,13,0.18)] transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
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
              <p className="mt-3 text-sm leading-6 text-red-600">
                {logoutError}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </header>
  );
}
