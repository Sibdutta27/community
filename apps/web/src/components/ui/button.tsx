import * as React from "react";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-[200px] font-medium transition-[color,background-color,border-color,box-shadow,transform] duration-200 select-none outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:translate-y-px [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Solid black pill.
        primary:
          "bg-primary text-primary-foreground hover:opacity-90",
        // Prominent outline pill — the Figma default: hairline border, transparent
        // bg, dark text; fills to solid black on hover.
        outline:
          "border border-foreground bg-transparent text-foreground hover:bg-foreground hover:text-background",
        // Dark-grey solid pill.
        secondary:
          "bg-secondary text-secondary-foreground hover:opacity-90",
        // Mid-grey solid pill.
        accent:
          "bg-accent text-accent-foreground hover:opacity-90",
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
