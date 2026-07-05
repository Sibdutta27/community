import Image from "next/image";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Shared "elevated surface card" — the enrollment-application card look
 * (white `bg-surface` on the cool page, hairline border, `rounded-2xl`,
 * soft layered ink shadow) promoted to a reusable primitive so every
 * feature page reads as one product.
 *
 * - `tone="soft"` (default) uses `shadow-card-soft` for grid/list cards;
 *   `tone="elevated"` uses the full `shadow-card` for hero-level panels
 *   (mirrors the enrollment step card).
 * - `padding="compact"` (default) suits grid cards; `"roomy"` mirrors the
 *   enrollment step card's `p-6 sm:p-8 lg:p-10`; `"none"` for callers that
 *   manage their own padding (e.g. full-bleed footers).
 */

type SurfaceCardElement = "div" | "section" | "article" | "aside" | "li";

type SurfaceCardProps = Readonly<
  {
    as?: SurfaceCardElement;
    children: ReactNode;
    className?: string;
    padding?: "none" | "compact" | "roomy";
    tone?: "soft" | "elevated";
  } & Omit<ComponentPropsWithoutRef<"section">, "className" | "children">
>;

const paddingClassNames = {
  none: undefined,
  compact: "p-5 sm:p-6",
  roomy: "p-6 sm:p-8 lg:p-10",
} as const;

export function SurfaceCard({
  as: Tag = "section",
  children,
  className,
  padding = "compact",
  tone = "soft",
  ...rest
}: SurfaceCardProps) {
  return (
    <Tag
      className={cn(
        "border-border bg-surface rounded-2xl border",
        tone === "elevated" ? "shadow-card" : "shadow-card-soft",
        paddingClassNames[padding],
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/**
 * Quiet section header — small neutral icon tile + title + muted
 * description, exactly the enrollment-form-section header pattern.
 * `headingAs` keeps the document outline logical (h2 by default; pass
 * "h3" when the header sits under a card-level h2).
 */
type SectionHeaderProps = Readonly<{
  action?: ReactNode;
  className?: string;
  description?: string;
  headingAs?: "h2" | "h3";
  headingClassName?: string;
  icon?: LucideIcon;
  iconSrc?: string;
  title: string;
}>;

export function SectionHeader({
  action,
  className,
  description,
  headingAs: Heading = "h2",
  headingClassName,
  icon: Icon,
  iconSrc,
  title,
}: SectionHeaderProps) {
  const hasIcon = Boolean(Icon) || Boolean(iconSrc);

  return (
    <div
      className={cn(
        "flex flex-col gap-3.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4",
        className,
      )}
    >
      <div className="flex min-w-0 items-start gap-3.5 sm:gap-4">
        {hasIcon ? (
          <div className="border-border bg-surface-muted text-foreground flex size-12 shrink-0 items-center justify-center rounded-xl border">
            {iconSrc ? (
              <Image
                alt=""
                aria-hidden="true"
                className="h-6 w-6 object-contain"
                height={24}
                src={iconSrc}
                width={24}
              />
            ) : Icon ? (
              <Icon aria-hidden="true" className="size-6" />
            ) : null}
          </div>
        ) : null}

        <div className="min-w-0 pt-0.5">
          <Heading
            className={cn(
              "text-foreground text-[1.05rem] leading-tight font-semibold tracking-tight sm:text-[1.15rem]",
              headingClassName,
            )}
          >
            {title}
          </Heading>
          {description ? (
            <p className="text-muted-foreground mt-1 max-w-3xl text-[0.8rem] leading-5 sm:text-[0.86rem]">
              {description}
            </p>
          ) : null}
        </div>
      </div>

      {action ? (
        <div className="shrink-0 self-start sm:pt-0.5">{action}</div>
      ) : null}
    </div>
  );
}
