import type { IdCardData } from "@/features/profile/lib/id-card-data";

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
