import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/features/enrollment/lib/enrollment-queries", () => ({
  useAccountInfoQuery: () => ({ data: undefined, isPending: false }),
}));

import {
  EnrollmentStepFooter,
  EnrollmentStepLayout,
} from "@/features/enrollment/components/enrollment-step-layout";

/** The elevated form card the active folder tab merges into. */
function getStepCard() {
  const card = document.querySelector("[data-slot='enrollment-step-card']");
  expect(card).not.toBeNull();
  return card as HTMLElement;
}

describe("EnrollmentStepLayout — folder tabs + elevated card", () => {
  it("attaches the folder-tab stepper to an elevated bg-surface card holding the step content", () => {
    render(
      <EnrollmentStepLayout step={1}>
        <p>Step body</p>
      </EnrollmentStepLayout>,
    );

    // All five folder tabs render as links (free jump-nav).
    expect(screen.getAllByRole("link")).toHaveLength(6); // 5 tabs + Back

    const card = getStepCard();
    // Elevated card: warm-white surface, hairline border, folder-card radii
    // (square where the tab row attaches, rounded elsewhere).
    expect(card.className).toContain("bg-surface");
    expect(card.className).toContain("border-border");
    expect(card.className).toContain("rounded-b-2xl");
    expect(card.className).toContain("rounded-tr-2xl");
    // The step content lives inside the card.
    expect(card).toHaveTextContent("Step body");
  });

  it("renders the step heading inside the card with a 'Step N of 5' progress label", () => {
    render(
      <EnrollmentStepLayout step={1}>
        <p>Step body</p>
      </EnrollmentStepLayout>,
    );

    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent("1. Add your demographics");
    expect(getStepCard()).toContainElement(heading);
    expect(screen.getByText(/step 1 of 5/i)).toBeInTheDocument();
  });

  it("renders the persistent 'Enrollment Application' title in the utility row on every step", () => {
    const { unmount } = render(
      <EnrollmentStepLayout step={1}>
        <p>Body</p>
      </EnrollmentStepLayout>,
    );

    // Governance-styled flow title: kicker + refined heading, charcoal (no teal).
    const title = screen.getByText("Enrollment Application");
    expect(title).toBeInTheDocument();
    expect(title.className).toContain("text-foreground");
    const kicker = screen.getByText(/tribal citizenship/i);
    expect(kicker.className).toContain("text-muted-foreground");
    expect(kicker.className).toContain("uppercase");
    // It sits in the utility row (with Back + "Step N of 5"), not inside the card.
    expect(getStepCard()).not.toHaveTextContent("Enrollment Application");
    expect(screen.getByText(/step 1 of 5/i)).toBeInTheDocument();
    unmount();

    render(
      <EnrollmentStepLayout step={4}>
        <p>Body</p>
      </EnrollmentStepLayout>,
    );
    expect(screen.getByText("Enrollment Application")).toBeInTheDocument();
  });

  it("routes Back to the dashboard on step 1 and to the previous step afterwards", () => {
    const { unmount } = render(
      <EnrollmentStepLayout step={1}>
        <p>Body</p>
      </EnrollmentStepLayout>,
    );
    expect(screen.getByRole("link", { name: /back/i })).toHaveAttribute(
      "href",
      "/dashboard",
    );
    unmount();

    render(
      <EnrollmentStepLayout step={3}>
        <p>Body</p>
      </EnrollmentStepLayout>,
    );
    expect(screen.getByRole("link", { name: /back/i })).toHaveAttribute(
      "href",
      "/enrollment/step-2",
    );
  });
});

describe("EnrollmentStepFooter", () => {
  it("renders a divided footer band with a Back link and the primary action", () => {
    render(
      <EnrollmentStepFooter backHref="/enrollment/step-1">
        <button type="submit">Next</button>
      </EnrollmentStepFooter>,
    );

    expect(screen.getByRole("link", { name: /back/i })).toHaveAttribute(
      "href",
      "/enrollment/step-1",
    );
    expect(screen.getByRole("button", { name: /next/i })).toBeInTheDocument();

    const band = document.querySelector(
      "[data-slot='enrollment-step-footer']",
    ) as HTMLElement;
    expect(band).not.toBeNull();
    expect(band.className).toContain("border-t");
  });

  it("renders a secondary 'Save & finish later' action when onSaveDraft is provided", () => {
    const onSaveDraft = vi.fn();

    render(
      <EnrollmentStepFooter
        backHref="/enrollment/step-1"
        onSaveDraft={onSaveDraft}
      >
        <button type="submit">Next</button>
      </EnrollmentStepFooter>,
    );

    const draftButton = screen.getByRole("button", {
      name: /save & finish later/i,
    });
    expect(draftButton).toHaveAttribute("type", "button");

    fireEvent.click(draftButton);
    expect(onSaveDraft).toHaveBeenCalledTimes(1);
  });

  it("omits the 'Save & finish later' action when onSaveDraft is not provided", () => {
    render(
      <EnrollmentStepFooter backHref="/enrollment/step-1">
        <button type="submit">Next</button>
      </EnrollmentStepFooter>,
    );

    expect(
      screen.queryByRole("button", { name: /save & finish later/i }),
    ).toBeNull();
  });

  it("disables the 'Save & finish later' action while the draft save is pending", () => {
    render(
      <EnrollmentStepFooter
        backHref="/enrollment/step-1"
        onSaveDraft={vi.fn()}
        saveDraftPending
      >
        <button type="submit">Next</button>
      </EnrollmentStepFooter>,
    );

    expect(
      screen.getByRole("button", { name: /saving|finish later/i }),
    ).toBeDisabled();
  });

  it("disables Back while a mutation is in flight", () => {
    render(
      <EnrollmentStepFooter backDisabled backHref="/enrollment/step-1">
        <button type="submit">Submit</button>
      </EnrollmentStepFooter>,
    );

    expect(screen.queryByRole("link", { name: /back/i })).toBeNull();
    expect(screen.getByRole("button", { name: /back/i })).toBeDisabled();
  });
});
