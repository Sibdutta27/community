import { render, screen } from "@testing-library/react";
import { UserRound } from "lucide-react";
import { describe, expect, it, vi } from "vitest";

import { EnrollmentFormSection } from "@/features/enrollment/components/enrollment-form-section";

vi.mock("next/image", () => ({
  default: ({ alt, src }: { alt?: string; src?: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt ?? ""} src={typeof src === "string" ? src : ""} />
  ),
}));

describe("EnrollmentFormSection", () => {
  it("renders the title, description and children", () => {
    render(
      <EnrollmentFormSection
        description="Provide your basic details."
        icon={UserRound}
        title="Basic Information"
      >
        <div>First field</div>
      </EnrollmentFormSection>,
    );

    expect(
      screen.getByRole("heading", { name: "Basic Information" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Provide your basic details.")).toBeInTheDocument();
    expect(screen.getByText("First field")).toBeInTheDocument();
  });

  it("renders an optional footer", () => {
    render(
      <EnrollmentFormSection
        description="desc"
        footer="Footer note"
        title="Section"
      >
        <div>field</div>
      </EnrollmentFormSection>,
    );

    expect(screen.getByText("Footer note")).toBeInTheDocument();
  });

  it("uses minimal surface styling without cream backgrounds", () => {
    const { container } = render(
      <EnrollmentFormSection description="desc" title="Section">
        <div>field</div>
      </EnrollmentFormSection>,
    );

    expect(container.innerHTML).not.toContain("#FFFDEC");
    expect(container.innerHTML).not.toContain("#00594e");
    expect(container.querySelector(".bg-surface")).not.toBeNull();
  });
});
