"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";

import { MessageCircle, X } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

import { subscribeToFeedbackWidget } from "../lib/feedback-widget-events";
import { FeedbackPanel } from "./feedback-panel";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "textarea:not([disabled])",
  "select:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

function getFocusableElements(container: HTMLElement | null) {
  if (!container) {
    return [] as HTMLElement[];
  }

  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ).filter((element) => element.offsetParent !== null || element.tabIndex >= 0);
}

/**
 * The always-available feedback launcher.
 *
 * Mounted once in the root layout so it rides along on the public, auth and
 * protected trees alike. It is deliberately a disclosure panel rather than a
 * modal takeover: no scrim, the page stays readable behind it, and the
 * launcher shrinks to an icon on small screens so it never sits on top of a
 * primary action.
 *
 * Motion is intentionally minimal (a hover lift on the launcher, guarded with
 * `motion-reduce:`); the panel itself appears without animation, which is both
 * calmer and reduced-motion safe by construction.
 */
export function FeedbackWidget() {
  const t = useTranslations("feedback");

  const [isOpen, setIsOpen] = useState(false);
  const launcherRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const panelId = useId();
  const titleId = `${panelId}-title`;

  const close = useCallback(() => {
    setIsOpen(false);
    launcherRef.current?.focus();
  }, []);

  // Any surface can ask for the panel (e.g. the support section's card).
  useEffect(() => subscribeToFeedbackWidget(() => setIsOpen(true)), []);

  // Escape closes from anywhere, and a click outside dismisses the panel.
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        close();
      }
    }

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;

      if (
        panelRef.current?.contains(target) ||
        launcherRef.current?.contains(target)
      ) {
        return;
      }

      setIsOpen(false);
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [close, isOpen]);

  // Opening moves focus into the panel; closing hands it back to the launcher
  // (see `close`), so keyboard users never lose their place.
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const [firstFocusable] = getFocusableElements(panelRef.current);
    firstFocusable?.focus();
  }, [isOpen]);

  /** Keep Tab inside the open panel. */
  function handlePanelKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Tab") {
      return;
    }

    const focusable = getFocusableElements(panelRef.current);

    if (focusable.length === 0) {
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
      return;
    }

    if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <>
      {isOpen ? (
        <div
          aria-labelledby={titleId}
          aria-modal="true"
          className={cn(
            "border-border bg-surface shadow-card fixed z-40 rounded-[22px] border",
            "inset-x-4 bottom-24 max-h-[calc(100dvh-9rem)] overflow-y-auto",
            "sm:inset-x-auto sm:right-6 sm:bottom-24 sm:w-[22.5rem]",
          )}
          id={panelId}
          onKeyDown={handlePanelKeyDown}
          ref={panelRef}
          role="dialog"
        >
          <div className="px-5 pt-5 pb-3">
            <h2
              className="text-foreground text-[1rem] font-semibold tracking-[-0.03em]"
              id={titleId}
            >
              {t("panel.title")}
            </h2>
            <p className="text-muted-foreground mt-1.5 text-[0.8rem] leading-[1.5]">
              {t("panel.subtitle")}
            </p>
          </div>

          <FeedbackPanel onClose={close} />
        </div>
      ) : null}

      <button
        aria-controls={panelId}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label={isOpen ? t("launcher.close") : t("launcher.openAria")}
        className={cn(
          "bg-primary text-primary-foreground fixed right-4 bottom-4 z-40 flex cursor-pointer items-center gap-2 rounded-[200px] font-medium sm:right-6 sm:bottom-6",
          "size-14 justify-center sm:size-auto sm:h-12 sm:px-5",
          "shadow-[0_12px_24px_-14px_rgba(10,86,168,0.55)] transition-[box-shadow,transform] duration-200 hover:-translate-y-px hover:shadow-[0_16px_30px_-14px_rgba(10,86,168,0.65)] active:translate-y-px",
          "focus-visible:ring-ring focus-visible:ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
          "motion-reduce:transform-none motion-reduce:transition-none",
        )}
        onClick={() => (isOpen ? close() : setIsOpen(true))}
        ref={launcherRef}
        type="button"
      >
        {isOpen ? (
          <X aria-hidden="true" className="size-5" />
        ) : (
          <MessageCircle aria-hidden="true" className="size-5" />
        )}
        <span className="hidden text-sm sm:inline">
          {isOpen ? t("launcher.close") : t("launcher.open")}
        </span>
      </button>
    </>
  );
}
