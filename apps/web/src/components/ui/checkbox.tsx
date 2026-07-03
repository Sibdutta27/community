"use client";

import * as React from "react";

import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      className={cn(
        "text-primary-foreground focus-visible:ring-ring/40 peer border-border data-[state=checked]:border-primary data-[state=checked]:bg-primary bg-surface size-[1.125rem] shrink-0 cursor-pointer rounded-[5px] border transition-[color,box-shadow,border-color] duration-200 outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      data-slot="checkbox"
      {...props}
    >
      <CheckboxPrimitive.Indicator
        className="text-primary-foreground flex items-center justify-center transition-none"
        data-slot="checkbox-indicator"
      >
        <Check className="size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
