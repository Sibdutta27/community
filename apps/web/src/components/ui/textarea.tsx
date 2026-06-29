"use client";

import * as React from "react";

import { inputBaseClassName } from "@/components/ui/input";
import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(inputBaseClassName, "min-h-[7.5rem] py-3", className)}
      data-slot="textarea"
      {...props}
    />
  );
}

export { Textarea };
