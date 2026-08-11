import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/features/enrollment/lib/enrollment-queries", () => ({
  useAccountInfoQuery: () => ({ data: undefined, isPending: false }),
}));

import { useEnrollmentSaveDraft } from "@/features/enrollment/components/enrollment-save-draft-context";
import {
  EnrollmentStepFooter,
  EnrollmentStepLayout,
} from "@/features/enrollment/components/enrollment-step-layout";
import { renderWithIntl, withIntl } from "@/test/i18n";

const render = renderWithIntl;

/** The elevated form card the active folder tab merges into. */
function getStepCard() {
  const card = document.querySelector("[data-slot='enrollment-step-card']");
  expect(card).not.toBeNull();
  return card as HTMLElement;
}

/** Stand-in for a step form that registers a "Save & finish later" handler. */
function RegisteringStepBody({
  disabled = false,
  onSaveDraft,
  pending = false,
}: Readonly<{
  disabled?: boolean;
  onSaveDraft: () => void;
  pending?: boolean;
}>) {
  useEnrollmentSaveDraft({ disabled, onSaveDraft, pending });
  return <p>Step body</p>;
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

    // Governance-styled flow title: kicker + refined heading, ink (no azul fill).
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

  it("renders the utility row and step heading in PR-Spanish under the es catalog", () => {
    renderWithIntl(
      <EnrollmentStepLayout step={1}>
        <p>Body</p>
      </EnrollmentStepLayout>,
      "es",
    );

    // Persistent flow title + kicker translate.
    expect(screen.getByText("Solicitud de Inscripción")).toBeInTheDocument();
    expect(screen.getByText("Ciudadanía Tribal")).toBeInTheDocument();
    // Progress label translates with ICU values.
    expect(screen.getByText(/paso 1 de 5/i)).toBeInTheDocument();
    // The step heading inside the card translates.
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "1. Añada sus datos demográficos",
    );
    // Folder-tab names translate too (step 1 tab).
    expect(screen.getByText("Datos demográficos")).toBeInTheDocument();
  });

  it("routes Back to the enrollment overview on step 1 and to the previous step afterwards", () => {
    const { unmount } = render(
      <EnrollmentStepLayout step={1}>
        <p>Body</p>
      </EnrollmentStepLayout>,
    );
    // The overview now sits between the dashboard and step 1.
    expect(screen.getByRole("link", { name: /back/i })).toHaveAttribute(
      "href",
      "/enrollment/start",
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

describe("EnrollmentStepLayout — step 0 (the enrollment overview)", () => {
  it("labels the utility row 'Overview' instead of 'Step N of 5'", () => {
    render(
      <EnrollmentStepLayout step={0}>
        <p>Intro body</p>
      </EnrollmentStepLayout>,
    );

    expect(screen.getByText("Overview")).toBeInTheDocument();
    expect(screen.queryByText(/step \d+ of 5/i)).toBeNull();
  });

  it("renders the given heading verbatim — no '0. ' numeric prefix", () => {
    render(
      <EnrollmentStepLayout
        description="What to expect."
        heading="Before you begin"
        step={0}
      >
        <p>Intro body</p>
      </EnrollmentStepLayout>,
    );

    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent("Before you begin");
    expect(heading.textContent).not.toMatch(/^0\./);
    expect(screen.getByText("What to expect.")).toBeInTheDocument();
    expect(getStepCard()).toContainElement(heading);
  });

  it("keeps the five folder tabs visible with no active tab — seeing the steps is part of the introduction", () => {
    render(
      <EnrollmentStepLayout step={0}>
        <p>Intro body</p>
      </EnrollmentStepLayout>,
    );

    // 5 tabs + Back.
    expect(screen.getAllByRole("link")).toHaveLength(6);
    expect(document.querySelector("[aria-current='step']")).toBeNull();
    expect(document.querySelectorAll("[data-state='active']")).toHaveLength(0);
  });

  it("routes Back to the dashboard", () => {
    render(
      <EnrollmentStepLayout step={0}>
        <p>Intro body</p>
      </EnrollmentStepLayout>,
    );

    expect(screen.getByRole("link", { name: /back/i })).toHaveAttribute(
      "href",
      "/dashboard",
    );
  });
});

describe("EnrollmentStepLayout — top 'Save & finish later' (context bridge)", () => {
  it("renders the action in the utility row when the step registers a handler, and clicking it invokes that handler", () => {
    const onSaveDraft = vi.fn();

    render(
      <EnrollmentStepLayout step={1}>
        <RegisteringStepBody onSaveDraft={onSaveDraft} />
      </EnrollmentStepLayout>,
    );

    const button = screen.getByRole("button", {
      name: /save and finish later/i,
    });
    // Icon-only collapse on small screens keeps an accessible name.
    expect(button).toHaveAttribute("aria-label", "Save and finish later");
    // It sits in the top utility row, not inside the elevated card.
    expect(getStepCard()).not.toContainElement(button);
    // Subtle secondary action in the governance palette — never the azul fill.
    expect(button.className).not.toContain("bg-primary");

    fireEvent.click(button);
    expect(onSaveDraft).toHaveBeenCalledTimes(1);
  });

  it("hides the action entirely when no handler is registered for the step", () => {
    render(
      <EnrollmentStepLayout step={4}>
        <p>Step body</p>
      </EnrollmentStepLayout>,
    );

    expect(
      screen.queryByRole("button", { name: /save and finish later/i }),
    ).toBeNull();
  });

  it("disables the action while the draft save is pending", () => {
    render(
      <EnrollmentStepLayout step={2}>
        <RegisteringStepBody onSaveDraft={vi.fn()} pending />
      </EnrollmentStepLayout>,
    );

    expect(
      screen.getByRole("button", { name: /save and finish later/i }),
    ).toBeDisabled();
  });

  it("disables the action when the step marks it disabled (e.g. submit in flight)", () => {
    render(
      <EnrollmentStepLayout step={3}>
        <RegisteringStepBody disabled onSaveDraft={vi.fn()} />
      </EnrollmentStepLayout>,
    );

    expect(
      screen.getByRole("button", { name: /save and finish later/i }),
    ).toBeDisabled();
  });

  it("removes the action when the registering step unmounts", () => {
    const { rerender } = render(
      <EnrollmentStepLayout step={1}>
        <RegisteringStepBody onSaveDraft={vi.fn()} />
      </EnrollmentStepLayout>,
    );

    expect(
      screen.getByRole("button", { name: /save and finish later/i }),
    ).toBeInTheDocument();

    rerender(
      withIntl(
        <EnrollmentStepLayout step={1}>
          <p>Step body</p>
        </EnrollmentStepLayout>,
      ),
    );

    expect(
      screen.queryByRole("button", { name: /save and finish later/i }),
    ).toBeNull();
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
