import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EnrollmentStepper } from "@/features/enrollment/components/enrollment-stepper";
import type {
  EnrollmentStepKey,
  EnrollmentStepState,
} from "@/types/enrollment";

function stepState(
  overrides: Partial<Record<EnrollmentStepKey, boolean>> = {},
): EnrollmentStepState {
  return {
    "1": false,
    "2": false,
    "3": false,
    "4": false,
    "5": false,
    ...overrides,
  };
}

describe("EnrollmentStepper", () => {
  it("renders five circles that all navigate, even with nothing completed", () => {
    render(<EnrollmentStepper currentStep={1} stepState={stepState()} />);

    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(5);
    expect(
      screen.getByRole("link", { name: /step 1: Demographics/i }),
    ).toHaveAttribute("href", "/enrollment/step-1");
    expect(
      screen.getByRole("link", { name: /step 5: Confirmation/i }),
    ).toHaveAttribute("href", "/enrollment/step-5");
  });

  it("keeps every circle navigable while the step state is still loading", () => {
    render(<EnrollmentStepper currentStep={2} stepState={null} />);

    expect(screen.getAllByRole("link")).toHaveLength(5);
    expect(
      screen.getByRole("link", { name: /step 4: Documents/i }),
    ).toHaveAttribute("href", "/enrollment/step-4");
  });

  it("marks the current step as active with a filled brand-red circle", () => {
    render(<EnrollmentStepper currentStep={3} stepState={stepState()} />);

    const active = screen.getByRole("link", {
      name: /step 3: Paternal Kinship/i,
    });
    expect(active).toHaveAttribute("aria-current", "step");
    expect(active.className).toContain("bg-primary");
    // Warm palette: the active circle uses the primary (red) token, never a blue.
    expect(active.className).not.toMatch(/blue/);

    const upcoming = screen.getByRole("link", { name: /step 4: Documents/i });
    expect(upcoming).not.toHaveAttribute("aria-current");
    expect(upcoming.className).not.toContain("bg-primary");
  });

  it("shows completed steps as filled and checked", () => {
    render(
      <EnrollmentStepper
        currentStep={3}
        stepState={stepState({ "1": true })}
      />,
    );

    const completed = screen.getByRole("link", {
      name: /step 1: Demographics/i,
    });
    expect(completed.className).toContain("bg-primary");
    expect(completed.querySelector("svg")).not.toBeNull();

    const upcoming = screen.getByRole("link", { name: /step 5/i });
    expect(upcoming.querySelector("svg")).toBeNull();
  });
});
