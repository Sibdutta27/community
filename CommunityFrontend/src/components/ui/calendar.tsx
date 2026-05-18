"use client";

import * as React from "react";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      className={cn("p-3", className)}
      classNames={{
        button_next: cn(
          buttonVariants({ size: "icon", variant: "ghost" }),
          "text-muted-foreground hover:bg-surface-muted absolute top-1 right-1 size-8 rounded-full bg-transparent shadow-none",
        ),
        button_previous: cn(
          buttonVariants({ size: "icon", variant: "ghost" }),
          "text-muted-foreground hover:bg-surface-muted absolute top-1 left-1 size-8 rounded-full bg-transparent shadow-none",
        ),
        caption_label:
          "text-foreground text-sm font-semibold tracking-[-0.02em]",
        day: "text-center text-sm",
        day_button:
          "text-foreground hover:bg-surface-muted flex size-9 items-center justify-center rounded-full font-medium transition-colors",
        dropdown:
          "text-foreground h-9 cursor-pointer appearance-none rounded-lg border border-border bg-surface px-3 pr-8 text-sm font-medium shadow-[0_8px_16px_-16px_rgba(21,17,13,0.2)] outline-none transition-colors focus-visible:border-primary/45 focus-visible:ring-2 focus-visible:ring-primary/15",
        dropdown_root: "relative",
        dropdowns: "flex items-center justify-center gap-2",
        disabled: "text-muted-foreground opacity-50",
        hidden: "invisible",
        month: "space-y-4",
        month_caption:
          "relative flex min-h-9 items-center justify-center px-10 text-center",
        month_grid: "w-full border-collapse",
        months: "flex flex-col",
        outside: "text-muted-foreground opacity-65",
        selected: "bg-primary! text-primary-foreground! hover:bg-primary!",
        today: "bg-surface-muted text-primary",
        week: "mt-2 flex w-full",
        weekday:
          "text-muted-foreground w-9 text-[0.78rem] font-medium uppercase tracking-[0.08em]",
        weekdays: "flex",
        ...classNames,
      }}
      components={{
        Chevron: ({
          className: chevronClassName,
          orientation,
          ...chevronProps
        }) =>
          orientation === "left" ? (
            <ChevronLeft
              className={cn("size-4", chevronClassName)}
              {...chevronProps}
            />
          ) : (
            <ChevronRight
              className={cn("size-4", chevronClassName)}
              {...chevronProps}
            />
          ),
      }}
      showOutsideDays={showOutsideDays}
      {...props}
    />
  );
}

export { Calendar };
