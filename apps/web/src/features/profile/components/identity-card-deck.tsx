"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { RotateCw } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import type { IdCardData } from "@/features/profile/lib/id-card-data";

import { TribalIdentificationCard } from "./tribal-identification-card";
import { YucayekeIdentityCard } from "./yucayeke-identity-card";

const FACES = ["id", "yucayeke"] as const;
type Face = (typeof FACES)[number];

const faceLabelKeys = {
  id: "faceId",
  yucayeke: "faceYucayeke",
} as const satisfies Record<Face, string>;

/** The turn control names the face you'd land on, not the one you're reading. */
const turnLabelKeys = {
  id: "turnToYucayeke",
  yucayeke: "turnToId",
} as const satisfies Record<Face, string>;

/** Target of every `aria-controls` in the deck; set on the turning region. */
const DECK_ID = "identity-card-deck";

/** Records that this browser has already been shown the one-time teaser. */
const TEASER_SEEN_KEY = "yucayeke:identity-deck-teaser-seen";

/*
 * Teaser choreography, in milliseconds and degrees. The card waits for the
 * page to settle, leans toward its reverse, and eases back — once, ever.
 * The lean deliberately stops well short of 90°, so the hidden face never
 * half-appears (its map loads lazily) and the ID stays legible throughout.
 * Under this perspective the lean also foreshortens the card *inwards*, so
 * it never reaches over the summary column beside it.
 */
const TEASER_DELAY_MS = 900;
const TEASER_LEAN_MS = 780;
const TEASER_SETTLE_MS = 620;
const TEASER_LEAN_DEG = 52;

/** Hover/focus preview on the turn control: the same gesture, barely begun. */
const PEEK_DEG = 11;
const PEEK_MS = 380;

/** A committed face change. */
const FLIP_MS = 700;

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function readTeaserSeen() {
  try {
    return window.localStorage.getItem(TEASER_SEEN_KEY) !== null;
  } catch {
    // Storage is blocked (private mode, cookies off). Treat it as already
    // seen: with nowhere to record it, the teaser would replay every visit,
    // and nagging is worse than never teasing.
    return true;
  }
}

function markTeaserSeen() {
  try {
    window.localStorage.setItem(TEASER_SEEN_KEY, "1");
  } catch {
    // Nothing to do — the teaser simply gets one more chance next visit.
  }
}

type IdentityCardDeckProps = Readonly<{
  idCardData: IdCardData;
  yucayekeValue: string | null;
  yucayekeUnknown: boolean;
}>;

/**
 * The two faces of a member's identity — tribal ID and ancestral yucayeke —
 * as one card the reader turns over, rather than two stacked panels.
 *
 * Both faces are laid out in the same grid cell so the deck takes the height
 * of the taller one and never jumps mid-flip. The face turned away is
 * `inert`, so its links stay out of the tab order and off screen readers
 * even though it remains in the DOM (it must, to hold the height and to
 * keep the ID's export ref mounted).
 *
 * Discoverability of the second face rests on two things: a labelled turn
 * control that names where it leads (permanent, and the only cue under
 * `prefers-reduced-motion`), and a one-time lean on first view that shows
 * the card is a physical thing with a back.
 *
 * The teaser cannot corrupt the ID's PDF/PNG export: the rotation lives on
 * this wrapper, while `html-to-image` clones the card node and copies only
 * *that node's* computed style — ancestor transforms are never captured.
 */
export function IdentityCardDeck({
  idCardData,
  yucayekeValue,
  yucayekeUnknown,
}: IdentityCardDeckProps) {
  const t = useTranslations("profile.deck");
  const [face, setFace] = useState<Face>("id");
  // Rotation layered on top of the face angle by the teaser and the hover
  // preview. Never a resting state — it always returns to 0.
  const [lean, setLean] = useState({ deg: 0, ms: FLIP_MS });
  const teaserTimers = useRef<number[]>([]);

  const showingId = face === "id";
  // Both cues lean the way the flip itself travels: 0° → 180° from the ID
  // face, and back again from the reverse.
  const leanDirection = showingId ? 1 : -1;

  /**
   * Stops a running teaser and spends it for good. Called from every
   * deliberate interaction: once a member has reached for the second face,
   * the hint has done its job and must not come back.
   */
  const retireTeaser = useCallback(() => {
    if (teaserTimers.current.length === 0) {
      return;
    }

    teaserTimers.current.forEach((id) => window.clearTimeout(id));
    teaserTimers.current = [];
    markTeaserSeen();
  }, []);

  // First view only. The "seen" mark is written when the teaser *finishes*,
  // not when it is scheduled — so a member who navigates away mid-teaser
  // still gets it next time, and React's development StrictMode remount
  // doesn't swallow the only showing.
  useEffect(() => {
    if (prefersReducedMotion() || readTeaserSeen()) {
      return;
    }

    const at = (ms: number, run: () => void) => {
      teaserTimers.current.push(window.setTimeout(run, ms));
    };

    at(TEASER_DELAY_MS, () =>
      setLean({ deg: TEASER_LEAN_DEG, ms: TEASER_LEAN_MS }),
    );
    at(TEASER_DELAY_MS + TEASER_LEAN_MS, () =>
      setLean({ deg: 0, ms: TEASER_SETTLE_MS }),
    );
    at(TEASER_DELAY_MS + TEASER_LEAN_MS + TEASER_SETTLE_MS, () => {
      markTeaserSeen();
      teaserTimers.current = [];
    });

    // Unmounting is not "seen": leaving mid-teaser earns another showing.
    return () => {
      teaserTimers.current.forEach((id) => window.clearTimeout(id));
      teaserTimers.current = [];
    };
  }, []);

  const selectFace = useCallback(
    (next: Face) => {
      retireTeaser();
      setLean({ deg: 0, ms: FLIP_MS });
      setFace(next);
    },
    [retireTeaser],
  );

  /** Hover/focus on the turn control tips the card the way it would turn. */
  const peek = useCallback(
    (on: boolean) => {
      // Read live rather than from state: this only ever runs from a browser
      // event, so there is no render or SSR snapshot to keep in sync.
      if (prefersReducedMotion()) {
        return;
      }

      if (on) {
        retireTeaser();
      }

      setLean({ deg: on ? PEEK_DEG * leanDirection : 0, ms: PEEK_MS });
    },
    [leanDirection, retireTeaser],
  );

  return (
    <div className="flex w-full max-w-[26rem] shrink-0 flex-col lg:w-[23rem] lg:max-w-none xl:w-[25rem]">
      <div className="[perspective:1600px]">
        <div
          // `motion-reduce:transition-none` drops transition-property, so it
          // still wins over the inline duration below: reduced motion gets an
          // instant face change and no in-between frames.
          className="grid transition-transform ease-out [transform-style:preserve-3d] motion-reduce:transition-none"
          id={DECK_ID}
          style={{
            transform: `rotateY(${(showingId ? 0 : 180) + lean.deg}deg)`,
            transitionDuration: `${lean.ms}ms`,
          }}
        >
          <div
            className="[backface-visibility:hidden] [grid-area:1/1]"
            inert={!showingId}
          >
            <TribalIdentificationCard data={idCardData} />
          </div>

          <div
            className="[transform:rotateY(180deg)] [backface-visibility:hidden] [grid-area:1/1]"
            inert={showingId}
          >
            <YucayekeIdentityCard
              yucayekeValue={yucayekeValue}
              yucayekeUnknown={yucayekeUnknown}
            />
          </div>
        </div>
      </div>

      {/* Below the deck: which face you are on, and how to turn it. The dots
          alone never said a second face existed — the labelled control does,
          and it outlives the one-time teaser. */}
      <div className="mt-3.5 flex items-center justify-center gap-3">
        <div
          aria-label={t("srLabel")}
          className="flex items-center gap-2"
          role="tablist"
        >
          {FACES.map((option) => (
            <button
              key={option}
              aria-controls={DECK_ID}
              aria-label={t(faceLabelKeys[option])}
              aria-selected={face === option}
              className={cn(
                "focus-visible:ring-primary rounded-full transition-all duration-300 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
                face === option
                  ? "bg-primary h-1.5 w-6"
                  : "bg-primary/25 hover:bg-primary/45 size-1.5",
              )}
              onClick={() => selectFace(option)}
              role="tab"
              type="button"
            />
          ))}
        </div>

        <span aria-hidden="true" className="bg-border h-3 w-px shrink-0" />

        <button
          aria-controls={DECK_ID}
          className="text-muted-foreground hover:text-primary focus-visible:ring-primary inline-flex items-center gap-1.5 rounded-full text-[0.66rem] font-semibold tracking-[0.08em] uppercase transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          onBlur={() => peek(false)}
          onClick={() => selectFace(showingId ? "yucayeke" : "id")}
          onFocus={() => peek(true)}
          onMouseEnter={() => peek(true)}
          onMouseLeave={() => peek(false)}
          type="button"
        >
          <RotateCw aria-hidden="true" className="size-3" />
          {t(turnLabelKeys[face])}
        </button>
      </div>
    </div>
  );
}
