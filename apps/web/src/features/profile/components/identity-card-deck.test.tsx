import { act, fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { IdCardData } from "@/features/profile/lib/id-card-data";
import { renderWithIntl } from "@/test/i18n";

import { IdentityCardDeck } from "./identity-card-deck";

// The two faces are exercised by their own tests (and drag in the export libs
// and the territory-geometry query). Here only the deck's own behaviour —
// turning, the teaser, inertness — is under test.
vi.mock("./tribal-identification-card", () => ({
  TribalIdentificationCard: () => (
    <button type="button">Download the tribal ID</button>
  ),
}));

vi.mock("./yucayeke-identity-card", () => ({
  YucayekeIdentityCard: () => (
    <button type="button">Explore the yukayeke</button>
  ),
}));

const idCardData: IdCardData = {
  status: "approved",
  isApproved: true,
  fullName: "Ana Rivera",
  initials: "AR",
  memberId: "TN-0001-TST",
  dateOfBirth: "03/12/1985",
  yucayeke: "Guainía",
  enrollmentDate: "January 15, 2023",
  documentNumber: "TN-2023-00001",
  photoUrl: "",
};

/** Total run time of the teaser, from mount to the "seen" mark. */
const TEASER_TOTAL_MS = 900 + 780 + 620;

function renderDeck() {
  return renderWithIntl(
    <IdentityCardDeck
      idCardData={idCardData}
      yucayekeUnknown={false}
      yucayekeValue="Guainía"
    />,
  );
}

/** The turning region — the node the rotation is applied to. */
function deckRotation() {
  return document.getElementById("identity-card-deck")?.style.transform;
}

async function advance(ms: number) {
  await act(async () => {
    vi.advanceTimersByTime(ms);
  });
}

function stubReducedMotion(matches: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
}

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("IdentityCardDeck — turn affordance", () => {
  it("leans the card and settles it back once, then never teases again", async () => {
    vi.useFakeTimers();

    const first = renderDeck();

    // Nothing moves on the first paint — the page gets to settle first.
    expect(deckRotation()).toBe("rotateY(0deg)");

    await advance(900);
    expect(deckRotation()).toBe("rotateY(52deg)");

    await advance(780);
    expect(deckRotation()).toBe("rotateY(0deg)");

    // The showing is recorded only once it has actually finished.
    await advance(620);
    expect(
      window.localStorage.getItem("yucayeke:identity-deck-teaser-seen"),
    ).toBe("1");

    first.unmount();

    // A returning member is not nagged.
    renderDeck();
    await advance(TEASER_TOTAL_MS * 2);
    expect(deckRotation()).toBe("rotateY(0deg)");
  });

  it("stays completely still when the member prefers reduced motion", async () => {
    vi.useFakeTimers();
    stubReducedMotion(true);

    renderDeck();

    await advance(TEASER_TOTAL_MS * 2);

    expect(deckRotation()).toBe("rotateY(0deg)");
    // Nothing was spent, so the teaser is not marked as seen either.
    expect(
      window.localStorage.getItem("yucayeke:identity-deck-teaser-seen"),
    ).toBeNull();

    // The static cue carries discoverability on its own.
    expect(
      screen.getByRole("button", { name: "Turn to your yukayeke" }),
    ).toBeInTheDocument();
  });

  it("does not preview the turn on hover under reduced motion", async () => {
    const user = userEvent.setup();
    stubReducedMotion(true);

    renderDeck();

    await user.hover(screen.getByRole("button", { name: /turn to your/i }));

    expect(deckRotation()).toBe("rotateY(0deg)");
  });

  it("previews the turn while the control is hovered, then lets it settle", async () => {
    const user = userEvent.setup();

    renderDeck();

    const turn = screen.getByRole("button", { name: "Turn to your yukayeke" });

    await user.hover(turn);
    expect(deckRotation()).toBe("rotateY(11deg)");

    await user.unhover(turn);
    expect(deckRotation()).toBe("rotateY(0deg)");
  });

  it("turns the deck both ways from the labelled control", async () => {
    const user = userEvent.setup();

    renderDeck();

    await user.click(
      screen.getByRole("button", { name: "Turn to your yukayeke" }),
    );
    expect(deckRotation()).toBe("rotateY(180deg)");
    expect(screen.getByRole("tab", { name: "Your yukayeke" })).toHaveAttribute(
      "aria-selected",
      "true",
    );

    // The label names the face it leads to, so it swaps with the deck.
    const back = screen.getByRole("button", { name: "Turn to your tribal ID" });
    await user.click(back);
    expect(deckRotation()).toBe("rotateY(0deg)");
    expect(screen.getByRole("tab", { name: "Tribal ID" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("retires a running teaser as soon as the member turns the card", async () => {
    vi.useFakeTimers();

    renderDeck();

    await advance(900);
    expect(deckRotation()).toBe("rotateY(52deg)");

    // `fireEvent`, not `userEvent`: the latter's own delays deadlock against
    // Vitest's fake timers.
    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: "Turn to your yukayeke" }),
      );
    });
    expect(deckRotation()).toBe("rotateY(180deg)");

    // The retired teaser must not drag the card back afterwards, and it is
    // spent — a member who found the back on their own is never hinted again.
    await advance(TEASER_TOTAL_MS * 2);
    expect(deckRotation()).toBe("rotateY(180deg)");
    expect(
      window.localStorage.getItem("yucayeke:identity-deck-teaser-seen"),
    ).toBe("1");
  });
});

describe("IdentityCardDeck — existing deck behaviour", () => {
  it("switches faces from the dots and keeps the hidden face inert", async () => {
    const user = userEvent.setup();

    const { container } = renderDeck();

    const [idFace, yucayekeFace] = Array.from(
      container.querySelectorAll("#identity-card-deck > div"),
    );

    expect(idFace).not.toHaveAttribute("inert");
    expect(yucayekeFace).toHaveAttribute("inert");

    await user.click(screen.getByRole("tab", { name: "Your yukayeke" }));

    expect(deckRotation()).toBe("rotateY(180deg)");
    expect(idFace).toHaveAttribute("inert");
    expect(yucayekeFace).not.toHaveAttribute("inert");

    await user.click(screen.getByRole("tab", { name: "Tribal ID" }));

    expect(deckRotation()).toBe("rotateY(0deg)");
    expect(idFace).not.toHaveAttribute("inert");
    expect(yucayekeFace).toHaveAttribute("inert");
  });

  it("names the deck's tablist and points every control at the deck", () => {
    renderDeck();

    expect(
      screen.getByRole("tablist", { name: "Identity cards" }),
    ).toBeInTheDocument();

    for (const control of screen.getAllByRole("tab")) {
      expect(control).toHaveAttribute("aria-controls", "identity-card-deck");
    }

    expect(
      screen.getByRole("button", { name: "Turn to your yukayeke" }),
    ).toHaveAttribute("aria-controls", "identity-card-deck");

    // The target of those `aria-controls` actually exists.
    expect(document.getElementById("identity-card-deck")).toBeInTheDocument();
  });
});
