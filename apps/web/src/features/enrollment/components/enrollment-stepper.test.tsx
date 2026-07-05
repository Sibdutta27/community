import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { EnrollmentStepper } from "@/features/enrollment/components/enrollment-stepper";
import { renderWithIntl as render } from "@/test/i18n";
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

/** The number badge inside a folder tab. */
function badgeOf(tab: HTMLElement) {
  const badge = tab.querySelector("[data-slot='enrollment-tab-number']");
  expect(badge).not.toBeNull();
  return badge as HTMLElement;
}

describe("EnrollmentStepper — folder tabs", () => {
  it("renders five folder-tab links (number + name) that all navigate to their step", () => {
    render(<EnrollmentStepper currentStep={1} stepState={stepState()} />);

    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(5);

    for (const definition of enrollmentStepDefinitions) {
      const tab = screen.getByRole("link", {
        name: new RegExp(`step ${definition.step}: ${definition.title}`, "i"),
      });
      expect(tab).toHaveAttribute("href", definition.href);
      // Number and section name are both rendered inside the tab.
      expect(tab).toHaveTextContent(String(definition.step));
      expect(tab).toHaveTextContent(definition.title);
      // Folder-tab silhouette: rounded top corners only.
      expect(tab.className).toContain("rounded-t-xl");
    }
  });

  it("keeps every tab navigable while the step state is still loading (free jump-nav)", () => {
    render(<EnrollmentStepper currentStep={2} stepState={null} />);

    expect(screen.getAllByRole("link")).toHaveLength(5);
    expect(
      screen.getByRole("link", { name: /step 4: Documents/i }),
    ).toHaveAttribute("href", "/enrollment/step-4");
  });

  it("merges the active tab into the card: same surface, open bottom edge, aria-current", () => {
    render(<EnrollmentStepper currentStep={3} stepState={stepState()} />);

    const active = screen.getByRole("link", {
      name: /step 3: Paternal Kinship/i,
    });
    expect(active).toHaveAttribute("aria-current", "step");
    expect(active).toHaveAttribute("data-state", "active");
    // Same background as the form card…
    expect(active.className).toContain("bg-surface");
    expect(active.className).not.toContain("bg-surface-muted");
    // …and no visible bottom border so the tab flows into the card.
    expect(active.className).toContain("border-b-transparent");
    // The one accent: the active number badge fills deep azul.
    expect(badgeOf(active).className).toContain("bg-primary");
  });

  it("recesses upcoming tabs on the muted surface, sitting on the card's top divider", () => {
    render(<EnrollmentStepper currentStep={3} stepState={stepState()} />);

    const upcoming = screen.getByRole("link", { name: /step 4: Documents/i });
    expect(upcoming).not.toHaveAttribute("aria-current");
    expect(upcoming).toHaveAttribute("data-state", "upcoming");
    expect(upcoming.className).toContain("bg-surface-muted");
    // The divider line continues under inactive tabs (their own bottom border).
    expect(upcoming.className).not.toContain("border-b-transparent");
    expect(badgeOf(upcoming).className).not.toContain("bg-primary");
  });

  it("marks completed steps with a pale-celeste check badge, keeping the name", () => {
    render(
      <EnrollmentStepper
        currentStep={3}
        stepState={stepState({ "1": true })}
      />,
    );

    const completed = screen.getByRole("link", {
      name: /step 1: Demographics/i,
    });
    expect(completed).toHaveAttribute("data-state", "completed");
    expect(badgeOf(completed).className).toContain("bg-secondary");
    expect(badgeOf(completed).className).not.toContain("bg-primary");
    expect(completed.querySelector("svg")).not.toBeNull();
    expect(completed).toHaveTextContent("Demographics");

    const upcoming = screen.getByRole("link", { name: /step 5/i });
    expect(upcoming.querySelector("svg")).toBeNull();
  });

  it("keeps the tab row horizontally scrollable so it never overflows on mobile", () => {
    render(<EnrollmentStepper currentStep={1} stepState={stepState()} />);

    const list = screen.getByRole("list", { name: /enrollment steps/i });
    expect(list.className).toContain("overflow-x-auto");
    // Tabs must not wrap or shrink — they scroll instead.
    const firstTab = screen.getByRole("link", { name: /step 1/i });
    expect(firstTab.className).toContain("whitespace-nowrap");
  });

  it("is keyboard operable: tabs focus in order with a visible azul focus ring", async () => {
    const user = userEvent.setup();
    render(<EnrollmentStepper currentStep={1} stepState={stepState()} />);

    const links = screen.getAllByRole("link");

    await user.tab();
    expect(links[0]).toHaveFocus();
    expect(links[0].className).toContain("focus-visible:ring-ring");

    await user.tab();
    expect(links[1]).toHaveFocus();
  });
});
