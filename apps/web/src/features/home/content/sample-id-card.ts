import type { IdCardData } from "@/features/profile/lib/id-card-data";

/**
 * The territory drawn on the card's reverse.
 *
 * The reverse face needs a real yucayeke or it falls back to its "no yukayeke
 * declared" empty state, which would be a dead end in a hero. A named
 * territory is nation-level fact rather than an invented person, so the card
 * stays unattributed either way. Any canonical name in
 * `features/yucayeke/content/territories` resolves — swap freely.
 *
 * This is the enrollment-facing name, which is what `resolveTerritory` takes.
 * The card renders the territory's *display* name, so "Guanía" shows as
 * "Wainia" — that is the client's spelling, not a mismatch.
 */
export const SAMPLE_CARD_YUCAYEKE = "Guanía";

/**
 * An unissued tribal ID, for the marketing hero.
 *
 * Deliberately empty: no name, no likeness, no document number, not even a
 * fictional member. The card shows its chrome and ruled blanks, so what the
 * visitor sees is the credential they do not have yet rather than someone
 * else's. It also means nothing here can be screenshotted and passed off as
 * an issued card.
 *
 * `status: "notStarted"` keeps `isApproved` false, so no export path or
 * document number can ever be reached from it.
 */
export const SAMPLE_ID_CARD: IdCardData = Object.freeze({
  status: "notStarted",
  isApproved: false,
  fullName: "",
  initials: "",
  memberId: "",
  dateOfBirth: "",
  yucayeke: "",
  enrollmentDate: "",
  documentNumber: "",
  photoUrl: "",
});
