"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

const inputBaseClassName =
  "text-foreground flex min-h-11 w-full rounded-xl border border-border bg-surface px-4 text-[14px] shadow-[0_8px_18px_-18px_rgba(21,17,13,0.2)] transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-primary/45 focus-visible:ring-2 focus-visible:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-12";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(inputBaseClassName, className)}
      data-slot="input"
      type={type}
      {...props}
    />
  );
}

export { Input, inputBaseClassName };
