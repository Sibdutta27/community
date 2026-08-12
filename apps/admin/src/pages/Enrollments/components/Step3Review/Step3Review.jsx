// EnrollmentStep3Review.jsx
//
// Step 3 — Paternal Kinship: father + paternal grandparents.
// Contract: { father, paternalGrandmother, paternalGrandfather },
// each null or { name, dateOfBirth (father only), nationality,
// municipality, yucayeke, isBorikuaTaino }.

import { useQuery } from "@tanstack/react-query";

import { fetchEnrollmentStep3 } from "@/api/enrollment.api";

import KinshipReview, {
  KinshipReviewSkeleton,
} from "../KinshipReview/KinshipReview";

import { reviewQuery } from "../../reviewQuery";
import StepUnavailable from "../../StepUnavailable";

export default function EnrollmentStep3Review({ enrollmentId }) {
  const { data, isLoading, error } = useQuery(
    reviewQuery(["admin-enrollment-step3", enrollmentId], () =>
      fetchEnrollmentStep3(enrollmentId),
    ),
  );

  /**
   * Loading
   */
  if (isLoading) {
    return <KinshipReviewSkeleton />;
  }

  /**
   * Error
   */
  if (error) {
    return <StepUnavailable error={error} what="paternal kinship" />;
  }

  return (
    <KinshipReview
      enrollmentId={enrollmentId}
      queryKey={["admin-enrollment-step3", enrollmentId]}
      entries={[
        {
          label: "Father",
          relation: "FATHER",
          person: data?.father,
          showDateOfBirth: true,
        },
        {
          label: "Paternal Grandmother",
          relation: "PATERNAL_GRANDMOTHER",
          person: data?.paternalGrandmother,
        },
        {
          label: "Paternal Grandfather",
          relation: "PATERNAL_GRANDFATHER",
          person: data?.paternalGrandfather,
        },
      ]}
    />
  );
}
