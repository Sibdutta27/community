import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Input } from "@/components/ui/input";

describe("Input", () => {
  it("renders an input element", () => {
    render(<Input placeholder="Email" />);
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
  });

  it("forwards native props", () => {
    render(<Input aria-label="email" type="email" defaultValue="a@b.co" />);
    const input = screen.getByLabelText("email") as HTMLInputElement;
    expect(input.type).toBe("email");
    expect(input.value).toBe("a@b.co");
  });

  it("applies the shared hairline border style", () => {
    render(<Input aria-label="styled" />);
    expect(screen.getByLabelText("styled")).toHaveClass("border-border");
  });

  it("uses the azul focus glow, not the legacy teal", () => {
    render(<Input aria-label="glow" />);
    const className = (screen.getByLabelText("glow") as HTMLInputElement)
      .className;
    expect(className).toContain("rgba(10,86,168");
    expect(className).not.toContain("rgba(45,110,126");
  });
});
