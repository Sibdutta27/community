"use client";

import { useCallback, useEffect, useRef } from "react";

import { useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";

import {
  SAMPLE_CARD_YUCAYEKE,
  SAMPLE_ID_CARD,
} from "@/features/home/content/sample-id-card";
import { TribalIdCardFace } from "@/features/profile/components/tribal-id-card-face";
import { YucayekeIdentityCard } from "@/features/profile/components/yucayeke-identity-card";

/**
 * Resting drift, in degrees per second. Slow enough to read the face it is
 * showing — a full turn takes ~16s — and always rightward.
 */
const DRIFT_DEG_PER_SEC = 22;

/** How far a pixel of horizontal drag turns the card. */
const DEG_PER_PX = 0.6;

/** Per-frame decay applied to a fling, normalised to 60fps below. */
const FLING_DECAY_PER_FRAME = 0.94;

/** A fling below this is spent, and the card is back to its own drift. */
const FLING_FLOOR_DEG_PER_SEC = 2;

/** Caps a violent flick so the card never becomes an unreadable blur. */
const MAX_FLING_DEG_PER_SEC = 1100;

/** The turning element itself — the node that carries `rotateY`. */
export const ROTOR_ID = "hero-id-card-rotor";

/**
 * A sample tribal ID turning in space, which visitors can grab and spin.
 *
 * The rotation is written straight to the node's `style.transform` from a
 * `requestAnimationFrame` loop rather than through React state or a framer
 * motion value: at 60fps this is a per-frame DOM write either way, and going
 * through React would re-render both faces — one of which owns an SVG map —
 * sixty times a second.
 *
 * Both faces share one grid cell with `backface-visibility: hidden`, the
 * pattern `profile/components/identity-card-deck` established: the front face
 * is content-driven and the reverse pins `aspect-[1.73]`, so the cell takes
 * the taller of the two and the card keeps one physical shape all the way
 * round. Both are `inert` — a continuously rotating element is no place for
 * links or readable text, so the whole thing is announced once, as an image.
 *
 * NOTE on motion: the app-wide `MotionConfig reducedMotion="user"` and the
 * global `prefers-reduced-motion` CSS block both govern framer and CSS
 * animation. Neither stops a `requestAnimationFrame` loop, so the drift is
 * gated here explicitly. Under reduced motion the card rests face-on and
 * stays draggable, since a drag is the visitor's own doing.
 */
export function SpinningIdCard() {
  const t = useTranslations("home.hero.card");
  const reduceMotion = useReducedMotion();

  const rotorRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);

  const angleRef = useRef(0);
  const flingRef = useRef(0);
  const draggingRef = useRef(false);
  const lastXRef = useRef(0);
  const lastMoveAtRef = useRef(0);

  /** Paints the current angle: the card, and the contact shadow beneath it. */
  const paint = useCallback(() => {
    const angle = angleRef.current;

    if (rotorRef.current) {
      rotorRef.current.style.transform = `rotateY(${angle.toFixed(2)}deg)`;
    }

    if (shadowRef.current) {
      // The card is a plane, so its ground shadow narrows to nothing as it
      // turns edge-on. That squeeze is most of what sells the card as an
      // object sitting in the page rather than a picture rotating on it.
      const face = Math.abs(Math.cos((angle * Math.PI) / 180));
      shadowRef.current.style.transform = `scaleX(${(0.55 + face * 0.45).toFixed(3)})`;
      shadowRef.current.style.opacity = (0.15 + face * 0.35).toFixed(3);
    }
  }, []);

  // Resting drift. Skipped entirely under reduced motion — the effect never
  // schedules a frame, so there is no loop to stop.
  useEffect(() => {
    paint();

    if (reduceMotion) {
      return;
    }

    let frame = 0;
    let last = performance.now();

    const step = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1); // clamp tab-switch jumps
      last = now;

      if (!draggingRef.current) {
        angleRef.current =
          (angleRef.current + (DRIFT_DEG_PER_SEC + flingRef.current) * dt) %
          360;

        // Decay normalised to 60fps so a slow frame does not slow the fling.
        flingRef.current *= FLING_DECAY_PER_FRAME ** (dt * 60);

        if (Math.abs(flingRef.current) < FLING_FLOOR_DEG_PER_SEC) {
          flingRef.current = 0;
        }

        paint();
      }

      frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);

    return () => cancelAnimationFrame(frame);
  }, [paint, reduceMotion]);

  const handlePointerDown = useCallback((event: React.PointerEvent) => {
    draggingRef.current = true;
    lastXRef.current = event.clientX;
    lastMoveAtRef.current = performance.now();
    flingRef.current = 0;
    event.currentTarget.setPointerCapture(event.pointerId);
  }, []);

  const handlePointerMove = useCallback(
    (event: React.PointerEvent) => {
      if (!draggingRef.current) {
        return;
      }

      const now = performance.now();
      const dx = event.clientX - lastXRef.current;
      const dt = Math.max(now - lastMoveAtRef.current, 1) / 1000;

      angleRef.current = (angleRef.current + dx * DEG_PER_PX) % 360;
      // Kept per-move so the release below reads the *last* gesture speed,
      // not the average over the whole drag.
      flingRef.current = Math.max(
        -MAX_FLING_DEG_PER_SEC,
        Math.min(MAX_FLING_DEG_PER_SEC, (dx * DEG_PER_PX) / dt),
      );

      lastXRef.current = event.clientX;
      lastMoveAtRef.current = now;
      paint();
    },
    [paint],
  );

  const handlePointerUp = useCallback((event: React.PointerEvent) => {
    if (!draggingRef.current) {
      return;
    }

    draggingRef.current = false;

    // A drag that ends after a pause is a placement, not a throw.
    if (performance.now() - lastMoveAtRef.current > 120) {
      flingRef.current = 0;
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }, []);

  return (
    <div
      aria-label={t("aria")}
      className="relative w-full max-w-[22rem] lg:max-w-none"
      role="img"
    >
      <div className="[perspective:1600px]">
        <div
          ref={rotorRef}
          // `touch-action: pan-y` is load-bearing on phones: a horizontal drag
          // spins the card while a vertical swipe still scrolls the page past
          // it. Without it the hero swallows the scroll.
          className="grid cursor-grab touch-pan-y will-change-transform select-none [transform-style:preserve-3d] active:cursor-grabbing"
          id={ROTOR_ID}
          onPointerCancel={handlePointerUp}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          style={{ transform: "rotateY(0deg)" }}
        >
          <div className="[backface-visibility:hidden] [grid-area:1/1]" inert>
            <TribalIdCardFace blank data={SAMPLE_ID_CARD} />
          </div>

          <div
            className="[transform:rotateY(180deg)] [backface-visibility:hidden] [grid-area:1/1]"
            inert
          >
            <YucayekeIdentityCard
              bare
              yucayekeUnknown={false}
              yucayekeValue={SAMPLE_CARD_YUCAYEKE}
            />
          </div>
        </div>
      </div>

      {/* Ground shadow, outside the perspective wrapper so it stays flat on
          the page while the card turns above it. */}
      <div
        aria-hidden="true"
        className="pointer-events-none mx-auto mt-5 h-3 w-[78%] rounded-[50%] bg-[radial-gradient(ellipse_at_center,color-mix(in_srgb,var(--foreground)_55%,transparent),transparent_70%)] blur-md"
        ref={shadowRef}
        style={{ opacity: 0.5 }}
      />

      <p className="text-muted-foreground mt-3 text-center text-[0.72rem] font-semibold tracking-[0.1em] uppercase">
        {t("caption")}
      </p>
    </div>
  );
}
