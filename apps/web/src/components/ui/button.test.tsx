import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("renders its children as a button element", () => {
    render(<Button>Apply Now</Button>);
    const button = screen.getByRole("button", { name: "Apply Now" });
    expect(button).toBeInTheDocument();
  });

  it("renders each variant with the pill radius base class", () => {
    const variants = [
      "primary",
      "outline",
      "secondary",
      "accent",
      "ghost",
    ] as const;

    for (const variant of variants) {
      const { unmount } = render(<Button variant={variant}>{variant}</Button>);
      const button = screen.getByRole("button", { name: variant });
      expect(button).toHaveClass("rounded-[200px]");
      unmount();
    }
  });

  it("renders the outline variant with a border", () => {
    render(<Button variant="outline">Outline</Button>);
    expect(screen.getByRole("button", { name: "Outline" })).toHaveClass(
      "border",
    );
  });

  it("is disabled while loading", () => {
    render(<Button loading>Saving</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });
});
