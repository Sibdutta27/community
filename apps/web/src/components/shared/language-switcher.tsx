"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

import { Check, Globe } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { resolveLocale, type Locale } from "@/i18n/config";
import { setUserLocale } from "@/i18n/locale-actions";
import { cn } from "@/lib/utils";

const languages = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
] as const satisfies ReadonlyArray<{ code: Locale; label: string }>;

type LanguageSwitcherProps = Readonly<{
  className?: string;
  /**
   * `compact` — icon + current code pill for the desktop navbar.
   * `row` — full-width labeled row for the mobile menus.
   */
  variant?: "compact" | "row";
}>;

/**
 * Globe language switcher — persists the choice in the `community_locale`
 * cookie (via a Server Action) and refreshes the router so the whole app
 * re-renders in the selected locale. No URL changes.
 */
export function LanguageSwitcher({
  className,
  variant = "compact",
}: LanguageSwitcherProps) {
  const t = useTranslations("common");
  const activeLocale = resolveLocale(useLocale());
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  // Optimistic selection: shows the new language immediately while the
  // cookie write + server refresh are in flight.
  const [language, setLanguage] = useState<Locale>(activeLocale);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const closeMenu = (restoreFocus: boolean) => {
    setIsOpen(false);

    if (restoreFocus) {
      triggerRef.current?.focus();
    }
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      const targetNode = event.target as Node | null;

      if (
        targetNode &&
        containerRef.current &&
        !containerRef.current.contains(targetNode)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const selectedIndex = Math.max(
    languages.findIndex((item) => item.code === language),
    0,
  );

  // Move focus onto the current language once the menu renders.
  useEffect(() => {
    if (isOpen) {
      itemRefs.current[selectedIndex]?.focus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleTriggerKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setIsOpen(true);
    }
  };

  const handleMenuKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const items = itemRefs.current.filter(Boolean);
      const activeIndex = items.findIndex(
        (item) => item === document.activeElement,
      );
      const step = event.key === "ArrowDown" ? 1 : -1;
      const nextIndex =
        (activeIndex + step + items.length) % Math.max(items.length, 1);
      items[nextIndex]?.focus();
      return;
    }

    if (event.key === "Tab") {
      closeMenu(false);
    }
  };

  const handleSelect = (code: Locale) => {
    const previous = language;
    setLanguage(code);
    closeMenu(true);

    if (code === previous) {
      return;
    }

    startTransition(async () => {
      await setUserLocale(code);
      // Re-render server components (layout, pages) in the new locale —
      // the URL stays exactly the same.
      router.refresh();
    });
  };

  const isRow = variant === "row";
  const currentLanguage = languages[selectedIndex];

  return (
    <div
      ref={containerRef}
      className={cn("relative", isRow && "w-full", className)}
    >
      <button
        ref={triggerRef}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={t("changeLanguage", { language: currentLanguage.label })}
        type="button"
        className={cn(
          "text-muted-foreground hover:text-foreground hover:bg-surface-muted focus-visible:ring-ring focus-visible:ring-offset-surface flex cursor-pointer items-center font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
          isRow
            ? "w-full gap-3 rounded-2xl px-4 py-3 text-sm"
            : "min-h-10 gap-1.5 rounded-full px-2.5 py-2 text-sm",
        )}
        onClick={() => {
          if (isOpen) {
            closeMenu(true);
          } else {
            setIsOpen(true);
          }
        }}
        onKeyDown={handleTriggerKeyDown}
      >
        <Globe aria-hidden="true" className="size-[18px] shrink-0" />
        {isRow ? (
          <span className="flex-1 text-left">{t("language")}</span>
        ) : null}
        <span
          className={cn(
            "text-xs font-semibold tracking-wide uppercase",
            isRow && "text-muted-foreground",
          )}
        >
          {language}
        </span>
      </button>

      {isOpen ? (
        <div
          aria-label={t("language")}
          role="menu"
          className={cn(
            "border-border bg-surface absolute top-[calc(100%+0.5rem)] z-50 rounded-2xl border p-1.5 shadow-[0_18px_34px_-24px_rgba(20,26,34,0.22)]",
            isRow ? "inset-x-0" : "right-0 w-40",
          )}
          onKeyDown={handleMenuKeyDown}
        >
          {languages.map((item, index) => {
            const isSelected = item.code === language;

            return (
              <button
                key={item.code}
                ref={(node) => {
                  itemRefs.current[index] = node;
                }}
                aria-checked={isSelected}
                role="menuitemradio"
                type="button"
                className={cn(
                  "hover:bg-surface-muted focus-visible:bg-surface-muted focus-visible:ring-ring flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-inset focus-visible:outline-none",
                  isSelected ? "text-foreground" : "text-muted-foreground",
                )}
                onClick={() => handleSelect(item.code)}
              >
                {item.label}
                {isSelected ? (
                  <Check aria-hidden="true" className="text-primary size-4" />
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
