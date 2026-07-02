"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

const inputBaseClassName =
  "text-foreground flex min-h-11 w-full rounded-md border border-border bg-surface px-4 text-[15px] transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-foreground focus-visible:ring-2 focus-visible:ring-ring/25 disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-12";

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
