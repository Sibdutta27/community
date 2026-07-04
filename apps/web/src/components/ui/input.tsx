"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

const inputBaseClassName =
  "text-foreground flex min-h-11 w-full rounded-lg border border-border bg-surface px-4 text-[15px] transition-[color,border-color,box-shadow] duration-200 outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/25 focus-visible:shadow-[0_6px_16px_-10px_rgba(10,86,168,0.4)] disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-12";

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
