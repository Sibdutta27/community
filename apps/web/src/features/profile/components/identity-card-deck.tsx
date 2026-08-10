"use client";

import { useState } from "react";

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
 */
export function IdentityCardDeck({
  idCardData,
  yucayekeValue,
  yucayekeUnknown,
}: IdentityCardDeckProps) {
  const t = useTranslations("profile.deck");
  const [face, setFace] = useState<Face>("id");

  const showingId = face === "id";

  return (
    <div className="flex w-full max-w-[26rem] shrink-0 flex-col lg:w-[23rem] lg:max-w-none xl:w-[25rem]">
      <div className="[perspective:1600px]">
        <div
          className={cn(
            "grid transition-transform duration-700 ease-out [transform-style:preserve-3d]",
            "motion-reduce:transition-none",
            !showingId && "[transform:rotateY(180deg)]",
          )}
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

      {/* Dot indicator: signals there is a second face, and switches to it. */}
      <div
        aria-label={t("srLabel")}
        className="mt-3.5 flex items-center justify-center gap-2"
        role="tablist"
      >
        {FACES.map((option) => (
          <button
            key={option}
            aria-controls="identity-card-deck"
            aria-label={t(faceLabelKeys[option])}
            aria-selected={face === option}
            className={cn(
              "focus-visible:ring-primary rounded-full transition-all duration-300 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
              face === option
                ? "bg-primary h-1.5 w-6"
                : "bg-primary/25 hover:bg-primary/45 size-1.5",
            )}
            onClick={() => setFace(option)}
            role="tab"
            type="button"
          />
        ))}
      </div>
    </div>
  );
}
