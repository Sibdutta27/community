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

type NavLink = Readonly<{ label: string; href: string }>;
type NavItem =
  | (NavLink & { kind: "link" })
  | Readonly<{ kind: "menu"; label: string; items: readonly NavLink[] }>;

/**
 * "My Profile" is deliberately absent: it already lives in the account
 * menu under the member's own name, and listing it twice made the bar
 * longer for no navigational gain.
 */
const navItems: readonly NavItem[] = [
  { kind: "link", label: "Dashboard", href: "/dashboard" },
  { kind: "link", label: "Yukayeke", href: "/yucayeke" },
  {
    kind: "menu",
    label: "Programs",
    items: [
      { label: "Community", href: "/community" },
      { label: "Services", href: "/services" },
    ],
  },
];

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

/**
 * Refined initials avatar: celeste-tint fill, crisp white inner border with
 * a hairline outer ring, an inner top highlight and a soft ink drop — reads
 * as a polished token rather than a flat disc.
 */
const avatarBaseClass =
  "text-secondary-foreground bg-secondary ring-border/80 relative flex items-center justify-center rounded-full border-2 border-white ring-1 text-sm font-semibold shadow-[inset_0_1px_0_0_rgba(255,255,255,0.8),0_10px_20px_-14px_rgba(20,26,34,0.3)]";

/** Azul status badge pinned to the avatar (member-verified shield). */
const avatarBadgeClass =
  "bg-primary absolute right-0 bottom-0 flex items-center justify-center rounded-full border-2 border-white text-[10px] text-white shadow-[0_1px_2px_rgba(20,26,34,0.25)]";

export function ProtectedNavbar({ user }: Readonly<{ user: AuthUser }>) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const logoutMutation = useLogoutMutation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [openMenuLabel, setOpenMenuLabel] = useState<string | null>(null);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);
  const profileTriggerRef = useRef<HTMLButtonElement | null>(null);
  const navRef = useRef<HTMLElement | null>(null);

  // Grouped nav menus dismiss like the account menu does: click away, or Esc.
  useEffect(() => {
    if (!openMenuLabel) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      const targetNode = event.target as Node | null;

      if (
        navRef.current &&
        targetNode &&
        !navRef.current.contains(targetNode)
      ) {
        setOpenMenuLabel(null);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenMenuLabel(null);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [openMenuLabel]);

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
        // Keyboard users shouldn't lose their place when the menu closes.
        profileTriggerRef.current?.focus();
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
    "text-foreground hover:bg-surface-muted focus-visible:bg-surface-muted focus-visible:ring-ring flex w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold no-underline transition-colors outline-none focus-visible:ring-2 focus-visible:ring-inset";

  return (
    <header className={navbarHeaderClass}>
      <div className={navbarFrameClass}>
        <div className={navbarPillClass}>
          <Link
            href="/"
            className="focus-visible:ring-ring focus-visible:ring-offset-surface shrink-0 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          >
            {/* Always the full "Taíno Nation of Borikén" wordmark — the mark
                scales its own type to fit next to the app nav + avatar (see
                brand-mark.tsx). */}
            <BrandMark compact showSubtitle={false} />
          </Link>

          <nav
            aria-label="Main"
            className="hidden items-center gap-1 lg:flex"
            ref={navRef}
          >
            {navItems.map((item) => {
              if (item.kind === "menu") {
                // A grouped section reads as active whenever the reader is on
                // any of its destinations.
                const isActive = item.items.some((child) =>
                  isActivePath(pathname, child.href),
                );
                const isOpen = openMenuLabel === item.label;

                return (
                  <div className="relative" key={item.label}>
                    <button
                      aria-controls={`nav-menu-${item.label.toLowerCase()}`}
                      aria-expanded={isOpen}
                      aria-haspopup="menu"
                      className={cn(
                        desktopNavLinkClass(isActive),
                        "inline-flex cursor-pointer items-center gap-1",
                      )}
                      onClick={() =>
                        setOpenMenuLabel(isOpen ? null : item.label)
                      }
                      type="button"
                    >
                      {item.label}
                      <ChevronDown
                        aria-hidden="true"
                        className={cn(
                          "size-3.5 transition-transform",
                          isOpen && "rotate-180",
                        )}
                      />
                    </button>

                    {isOpen ? (
                      <div
                        aria-label={item.label}
                        id={`nav-menu-${item.label.toLowerCase()}`}
                        role="menu"
                        className="border-border/70 bg-surface/95 supports-backdrop-filter:bg-surface/90 absolute top-[calc(100%+0.75rem)] left-0 w-48 rounded-2xl border p-2 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.7),0_2px_8px_-4px_rgba(20,26,34,0.1),0_24px_44px_-24px_rgba(20,26,34,0.3)] backdrop-blur-xl"
                      >
                        {item.items.map((child) => (
                          <Link
                            key={child.href}
                            aria-current={
                              isActivePath(pathname, child.href)
                                ? "page"
                                : undefined
                            }
                            className={dropdownItemClass}
                            href={child.href}
                            role="menuitem"
                            onClick={() => setOpenMenuLabel(null)}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    ) : null}
                  </div>
                );
              }

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
                ref={profileTriggerRef}
                aria-controls="account-menu"
                aria-expanded={isProfileMenuOpen}
                aria-haspopup="menu"
                aria-label="Account menu"
                className="hover:bg-surface-muted/70 focus-visible:ring-ring focus-visible:ring-offset-surface flex cursor-pointer list-none items-center gap-2 rounded-lg px-1.5 py-1 transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 xl:gap-2.5 xl:px-2"
                type="button"
                onClick={() => setIsProfileMenuOpen((value) => !value)}
              >
                <div
                  className={cn(
                    avatarBaseClass,
                    "size-8 text-[0.72rem] xl:size-9 xl:text-[0.78rem]",
                  )}
                >
                  {getInitials(user.name)}
                  <span className={cn(avatarBadgeClass, "size-3 xl:size-3.5")}>
                    <ShieldCheck
                      aria-hidden="true"
                      className="size-2 xl:size-2.5"
                    />
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
                  aria-hidden="true"
                  className={cn(
                    "text-muted-foreground size-4 transition-transform lg:size-3.5 xl:size-4",
                    isProfileMenuOpen && "rotate-180",
                  )}
                />
              </button>

              {isProfileMenuOpen ? (
                <div
                  aria-label="Account"
                  id="account-menu"
                  role="menu"
                  className="border-border/70 bg-surface/95 supports-backdrop-filter:bg-surface/90 absolute top-[calc(100%+0.75rem)] right-0 w-56 rounded-2xl border p-2 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.7),0_2px_8px_-4px_rgba(20,26,34,0.1),0_24px_44px_-24px_rgba(20,26,34,0.3)] backdrop-blur-xl"
                >
                  <Link
                    className={dropdownItemClass}
                    href="/profile"
                    role="menuitem"
                    onClick={() => setIsProfileMenuOpen(false)}
                  >
                    <User aria-hidden="true" className="size-4" />
                    Profile
                  </Link>
                  <button
                    className={dropdownItemClass}
                    role="menuitem"
                    onClick={handleLogout}
                    type="button"
                  >
                    <LogOut aria-hidden="true" className="size-4" />
                    {isLoggingOut ? "Signing out..." : "Sign out"}
                  </button>
                  {logoutError ? (
                    <p className="text-destructive px-3 py-2 text-xs leading-5">
                      {logoutError}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>

          <Button
            aria-controls="protected-mobile-menu"
            aria-expanded={isMobileMenuOpen}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            className="size-9 lg:hidden"
            size="icon"
            variant="ghost"
            onClick={() => setIsMobileMenuOpen((value) => !value)}
          >
            {isMobileMenuOpen ? (
              <X aria-hidden="true" />
            ) : (
              <Menu aria-hidden="true" />
            )}
          </Button>
        </div>

        {isMobileMenuOpen ? (
          <div className={navbarMobilePanelClass} id="protected-mobile-menu">
            <div className="border-border/80 bg-surface-muted/80 flex items-center gap-3 rounded-2xl border p-3">
              <div className={cn(avatarBaseClass, "size-12")}>
                {getInitials(user.name)}
                <span className={cn(avatarBadgeClass, "size-4")}>
                  <ShieldCheck aria-hidden="true" className="size-2.5" />
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

            <nav aria-label="Main" className="mt-4 grid gap-1">
              {navItems.map((item) => {
                // No nested disclosure on mobile — the panel is already a
                // drawer, so a group just becomes a labelled section.
                if (item.kind === "menu") {
                  return (
                    <div className="grid gap-1" key={item.label}>
                      <p className="text-muted-foreground px-4 pt-3 pb-1 text-[11px] font-semibold tracking-[0.12em] uppercase">
                        {item.label}
                      </p>
                      {item.items.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          aria-current={
                            isActivePath(pathname, child.href)
                              ? "page"
                              : undefined
                          }
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={mobileNavLinkClass(
                            isActivePath(pathname, child.href),
                          )}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  );
                }

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
              <p className="text-destructive mt-3 text-sm leading-6">
                {logoutError}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </header>
  );
}
