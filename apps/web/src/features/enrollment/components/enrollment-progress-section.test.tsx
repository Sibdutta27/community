import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EnrollmentProgressSection } from "@/features/enrollment/components/enrollment-progress-section";

describe("EnrollmentProgressSection", () => {
  it("renders every enrollment step title", () => {
    render(<EnrollmentProgressSection currentStage={1} />);

    expect(screen.getByText("Personal Information")).toBeInTheDocument();
    expect(screen.getByText("Maternal Lineage")).toBeInTheDocument();
    expect(screen.getByText("Cultural Connection")).toBeInTheDocument();
    expect(screen.getByText("Document Upload")).toBeInTheDocument();
  });

  it("marks the current stage with aria-current", () => {
    render(<EnrollmentProgressSection currentStage={2} />);

    const current = document.querySelector('[aria-current="step"]');
    expect(current).not.toBeNull();
    expect(current).toHaveTextContent("Maternal Lineage");
  });

  it("uses the minimal monochrome active marker (no hardcoded earthy colors)", () => {
    const { container } = render(<EnrollmentProgressSection currentStage={1} />);

    // Active/completed markers use the black foreground token, not the old red brand.
    expect(container.querySelector(".bg-foreground")).not.toBeNull();
    expect(container.innerHTML).not.toContain("#173f4c");
    expect(container.innerHTML).not.toContain("#b7b7b7");
  });
});
