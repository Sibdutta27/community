import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { EnrollmentStepper } from "@/features/enrollment/components/enrollment-stepper";
import { enrollmentStepDefinitions } from "@/features/enrollment/config/enrollment-steps";
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

/** The circle element (first child span) inside a stepper tab link. */
function circleOf(tab: HTMLElement) {
  const circle = tab.querySelector("span");
  expect(circle).not.toBeNull();
  return circle as HTMLElement;
}

describe("EnrollmentStepper", () => {
  it("renders five number+name tabs that all navigate to their step", () => {
    render(<EnrollmentStepper currentStep={1} stepState={stepState()} />);

    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(5);

    for (const definition of enrollmentStepDefinitions) {
      const tab = screen.getByRole("link", {
        name: new RegExp(`step ${definition.step}: ${definition.title}`, "i"),
      });
      expect(tab).toHaveAttribute("href", definition.href);
      // Number and section name are both visible inside the tab.
      expect(tab).toHaveTextContent(String(definition.step));
      expect(tab).toHaveTextContent(definition.title);
    }
  });

  it("keeps every tab navigable while the step state is still loading", () => {
    render(<EnrollmentStepper currentStep={2} stepState={null} />);

    expect(screen.getAllByRole("link")).toHaveLength(5);
    expect(
      screen.getByRole("link", { name: /step 4: Documents/i }),
    ).toHaveAttribute("href", "/enrollment/step-4");
  });

  it("marks the current step active: teal circle, emphasized name, aria-current", () => {
    render(<EnrollmentStepper currentStep={3} stepState={stepState()} />);

    const active = screen.getByRole("link", {
      name: /step 3: Paternal Kinship/i,
    });
    expect(active).toHaveAttribute("aria-current", "step");
    expect(circleOf(active).className).toContain("bg-primary");
    // Governance palette: the active circle uses the primary (deep-teal) token.
    expect(active.className).not.toMatch(/blue/);
    expect(active).toHaveTextContent("Paternal Kinship");

    const upcoming = screen.getByRole("link", { name: /step 4: Documents/i });
    expect(upcoming).not.toHaveAttribute("aria-current");
    expect(circleOf(upcoming).className).not.toContain("bg-primary");
    expect(circleOf(upcoming).className).toContain("border-border");
  });

  it("shows completed steps as pale-teal circles with a check, keeping the name", () => {
    render(
      <EnrollmentStepper
        currentStep={3}
        stepState={stepState({ "1": true })}
      />,
    );

    const completed = screen.getByRole("link", {
      name: /step 1: Demographics/i,
    });
    expect(circleOf(completed).className).toContain("bg-secondary");
    expect(circleOf(completed).className).not.toContain("bg-primary");
    expect(completed.querySelector("svg")).not.toBeNull();
    expect(completed).toHaveTextContent("Demographics");

    const upcoming = screen.getByRole("link", { name: /step 5/i });
    expect(upcoming.querySelector("svg")).toBeNull();
  });

  it("is keyboard operable: tabs are focusable in order with a visible focus ring", async () => {
    const user = userEvent.setup();
    render(<EnrollmentStepper currentStep={1} stepState={stepState()} />);

    const links = screen.getAllByRole("link");

    await user.tab();
    expect(links[0]).toHaveFocus();
    expect(links[0].className).toContain("focus-visible:ring-primary");

    await user.tab();
    expect(links[1]).toHaveFocus();
  });
});
