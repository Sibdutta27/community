import * as React from "react";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-[200px] font-medium transition-[color,background-color,border-color,box-shadow,transform] duration-200 select-none outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 hover:-translate-y-px active:translate-y-px motion-reduce:transform-none motion-reduce:transition-none [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Solid deep-azul pill — the workhorse for primary CTAs.
        primary:
          "bg-primary text-primary-foreground shadow-[0_12px_24px_-18px_rgba(10,86,168,0.45)] hover:shadow-[0_16px_30px_-18px_rgba(10,86,168,0.55)] hover:brightness-[0.96]",
        // Flag-red pill — RESTRAINED: only the Enroll/hero emphasis CTAs.
        emphasis:
          "bg-emphasis text-emphasis-foreground shadow-[0_12px_24px_-18px_rgba(196,32,50,0.5)] hover:shadow-[0_16px_30px_-18px_rgba(196,32,50,0.6)] hover:brightness-[0.96]",
        // Prominent outline pill: cool hairline border, white bg,
        // ink text; hover raises the muted cool surface.
        outline:
          "border border-border bg-surface text-foreground shadow-[0_10px_22px_-18px_rgba(20,26,34,0.18)] hover:bg-surface-muted",
        // Celeste-tint solid pill with deep-azul text.
        secondary:
          "bg-secondary text-secondary-foreground shadow-[0_12px_24px_-18px_rgba(20,26,34,0.22)] hover:brightness-[0.98]",
        // Azul-celeste solid pill (highlight fill) with dark azul text.
        accent:
          "bg-accent text-accent-foreground shadow-[0_12px_24px_-18px_rgba(20,26,34,0.22)] hover:brightness-[0.97]",
        ghost:
          "bg-transparent text-foreground hover:bg-surface-muted",
      },
      size: {
        sm: "h-10 px-4 text-sm [&_svg]:size-4",
        md: "h-11 px-5 text-sm [&_svg]:size-4",
        lg: "h-12 px-6 text-base [&_svg]:size-5",
        xl: "h-14 px-7 text-base [&_svg]:size-5",
        icon: "size-11 p-0 [&_svg]:size-5",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      fullWidth: false,
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
  loadingText?: string;
}

export function Button({
  asChild = false,
  children,
  className,
  disabled,
  fullWidth,
  leftIcon,
  loading = false,
  loadingText,
  rightIcon,
  size,
  type,
  variant,
  ...props
}: ButtonProps) {
  if (asChild) {
    return (
      <Slot
        aria-busy={loading || undefined}
        aria-disabled={disabled || loading || undefined}
        className={cn(buttonVariants({ variant, size, fullWidth }), className)}
        data-loading={loading ? "true" : undefined}
        {...props}
      >
        {children}
      </Slot>
    );
  }

  return (
    <button
      aria-busy={loading || undefined}
      className={cn(buttonVariants({ variant, size, fullWidth }), className)}
      data-loading={loading ? "true" : undefined}
      disabled={disabled || loading}
      type={type ?? "button"}
      {...props}
    >
      {loading ? (
        <Loader2 className="animate-spin" aria-hidden="true" />
      ) : (
        leftIcon
      )}
      {children ? (
        <span>{loading && loadingText ? loadingText : children}</span>
      ) : null}
      {!loading ? rightIcon : null}
    </button>
  );
}

export { buttonVariants };
