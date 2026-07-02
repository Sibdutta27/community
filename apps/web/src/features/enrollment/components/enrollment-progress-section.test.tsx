import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AccountInfoResponse } from "@/types/enrollment";

const accountInfoDataRef: { current: Partial<AccountInfoResponse> | undefined } =
  { current: undefined };

vi.mock("@/features/enrollment/lib/enrollment-queries", () => ({
  useAccountInfoQuery: () => ({ data: accountInfoDataRef.current }),
}));

import { EnrollmentProgressSection } from "@/features/enrollment/components/enrollment-progress-section";

function setStepState(
  stepState: Partial<Record<"1" | "2" | "3" | "4" | "5", boolean>>,
) {
  accountInfoDataRef.current = {
    enrollmentStep: {
      "1": false,
      "2": false,
      "3": false,
      "4": false,
      "5": false,
      ...stepState,
    },
  } as Partial<AccountInfoResponse>;
}

describe("EnrollmentProgressSection", () => {
  beforeEach(() => {
    accountInfoDataRef.current = undefined;
  });

  it("renders every enrollment step title", () => {
    render(<EnrollmentProgressSection currentStage={1} />);

    expect(screen.getByText("Demographics")).toBeInTheDocument();
    expect(screen.getByText("Maternal Kinship")).toBeInTheDocument();
    expect(screen.getByText("Paternal Kinship")).toBeInTheDocument();
    expect(screen.getByText("Documents")).toBeInTheDocument();
    expect(screen.getByText("Confirmation")).toBeInTheDocument();
  });

  it("marks the current stage with aria-current", () => {
    render(<EnrollmentProgressSection currentStage={2} />);

    const current = document.querySelector('[aria-current="step"]');
    expect(current).not.toBeNull();
    expect(current).toHaveTextContent("Maternal Kinship");
  });

  it("uses the minimal monochrome active marker (no hardcoded earthy colors)", () => {
    const { container } = render(<EnrollmentProgressSection currentStage={1} />);

    // Active/completed markers use the black foreground token, not the old red brand.
    expect(container.querySelector(".bg-foreground")).not.toBeNull();
    expect(container.innerHTML).not.toContain("#173f4c");
    expect(container.innerHTML).not.toContain("#b7b7b7");
  });

  it("links every started or completed step so the user can jump between sections", () => {
    setStepState({ "1": true, "2": true });
    render(<EnrollmentProgressSection currentStage={3} />);

    expect(
      screen.getByRole("link", { name: /step 1: Demographics/i }),
    ).toHaveAttribute("href", "/enrollment/step-1");
    expect(
      screen.getByRole("link", { name: /step 2: Maternal Kinship/i }),
    ).toHaveAttribute("href", "/enrollment/step-2");
  });

  it("does not link the active stage or never-started steps ahead", () => {
    setStepState({ "1": true, "2": true });
    render(<EnrollmentProgressSection currentStage={3} />);

    expect(
      screen.queryByRole("link", { name: /Paternal Kinship/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /Documents/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /Confirmation/i }),
    ).not.toBeInTheDocument();
  });

  it("links a completed later step even when revisiting an earlier one", () => {
    setStepState({ "1": true, "2": true, "3": true, "4": true });
    render(<EnrollmentProgressSection currentStage={2} />);

    expect(
      screen.getByRole("link", { name: /step 4: Documents/i }),
    ).toHaveAttribute("href", "/enrollment/step-4");
    expect(
      screen.getByRole("link", { name: /step 5: Confirmation/i }),
    ).toHaveAttribute("href", "/enrollment/step-5");
  });

  it("only links previously visited steps while the step state is loading", () => {
    render(<EnrollmentProgressSection currentStage={3} />);

    expect(
      screen.getByRole("link", { name: /step 1: Demographics/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /Documents/i }),
    ).not.toBeInTheDocument();
  });
});
