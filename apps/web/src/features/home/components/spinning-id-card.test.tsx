import { fireEvent, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  ROTOR_ID,
  SpinningIdCard,
} from "@/features/home/components/spinning-id-card";
import { renderWithIntl } from "@/test/i18n";

// The reverse face pulls TanStack Query and the territory GeoJSON. This suite
// is about the turning, the drag and the blank front face, so the back is
// stubbed — the same shape `identity-card-deck.test.tsx` uses.
vi.mock("@/features/profile/components/yucayeke-identity-card", () => ({
  YucayekeIdentityCard: () => <div data-testid="yucayeke-face" />,
}));

let reduceMotion = false;

vi.mock("framer-motion", async (importOriginal) => ({
  ...(await importOriginal<typeof import("framer-motion")>()),
  useReducedMotion: () => reduceMotion,
}));

function rotor() {
  const node = document.getElementById(ROTOR_ID);
  if (!node) throw new Error("rotor not found");
  return node;
}

function degrees() {
  return Number(
    /rotateY\((-?[\d.]+)deg\)/.exec(rotor().style.transform)?.[1] ?? NaN,
  );
}

beforeEach(() => {
  reduceMotion = false;
  // jsdom implements neither pointer capture nor rAF timing we can trust, so
  // capture is stubbed and frames are driven by hand in the tests below.
  Element.prototype.setPointerCapture = vi.fn();
  Element.prototype.releasePointerCapture = vi.fn();
  Element.prototype.hasPointerCapture = vi.fn(() => true);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("SpinningIdCard", () => {
  it("renders an unissued card: no bearer, no likeness, no links", () => {
    renderWithIntl(<SpinningIdCard />);

    // The chrome is real …
    expect(screen.getByText("Tribal Identification")).toBeInTheDocument();
    expect(screen.getByText("Unissued")).toBeInTheDocument();

    // … and everything that would name or belong to a person is not.
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.queryByText("Pending")).toBeNull();
    expect(screen.queryByRole("img", { name: /portrait/i })).toBeNull();
  });

  it("announces itself once as an image, with both faces inert", () => {
    renderWithIntl(<SpinningIdCard />);

    expect(
      screen.getByRole("img", {
        name: /sample Taíno Nation of Borikén tribal/i,
      }),
    ).toBeInTheDocument();

    for (const face of Array.from(rotor().children)) {
      expect(face).toHaveAttribute("inert");
    }
  });

  it("drifts to the right once the browser starts handing out frames", () => {
    const frames: FrameRequestCallback[] = [];
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      frames.push(cb);
      return frames.length;
    });

    renderWithIntl(<SpinningIdCard />);

    expect(degrees()).toBe(0);
    expect(frames).toHaveLength(1);

    const start = performance.now();
    frames[0](start); // establishes the clock
    frames[1](start + 1000); // one second of drift

    expect(degrees()).toBeGreaterThan(0);
  });

  it("schedules no frames at all under prefers-reduced-motion", () => {
    reduceMotion = true;
    const raf = vi.spyOn(window, "requestAnimationFrame");

    renderWithIntl(<SpinningIdCard />);

    expect(raf).not.toHaveBeenCalled();
    expect(degrees()).toBe(0);
  });

  it("turns under a drag, and keeps turning after the release", () => {
    const frames: FrameRequestCallback[] = [];
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      frames.push(cb);
      return frames.length;
    });

    renderWithIntl(<SpinningIdCard />);

    fireEvent.pointerDown(rotor(), { clientX: 0, pointerId: 1 });
    fireEvent.pointerMove(rotor(), { clientX: 120, pointerId: 1 });

    const dragged = degrees();
    expect(dragged).toBeGreaterThan(0);

    fireEvent.pointerUp(rotor(), { clientX: 120, pointerId: 1 });

    // The drift is unconditional: releasing hands the card back to the loop
    // rather than parking it.
    const start = performance.now();
    frames[0](start);
    frames[1](start + 500);

    expect(degrees()).not.toBe(dragged);
  });

  it("stays draggable when motion is reduced", () => {
    reduceMotion = true;
    renderWithIntl(<SpinningIdCard />);

    fireEvent.pointerDown(rotor(), { clientX: 0, pointerId: 1 });
    fireEvent.pointerMove(rotor(), { clientX: 90, pointerId: 1 });

    expect(degrees()).toBeGreaterThan(0);
  });

  it("lets a vertical swipe scroll the page past it", () => {
    renderWithIntl(<SpinningIdCard />);

    expect(rotor().className).toContain("touch-pan-y");
  });
});
