// EnrollmentStep2Review.jsx
//
// Step 2 — Maternal Kinship: mother + maternal grandparents.
// Contract: { mother, maternalGrandmother, maternalGrandfather },
// each null or { name, dateOfBirth (mother only), nationality,
// municipality, yucayeke, isBorikuaTaino }.

import { useQuery } from "@tanstack/react-query";

import { fetchEnrollmentStep2 } from "@/api/enrollment.api";

import KinshipReview, {
  KinshipReviewSkeleton,
} from "../KinshipReview/KinshipReview";

import { reviewQuery } from "../../reviewQuery";
import StepUnavailable from "../../StepUnavailable";

export default function EnrollmentStep2Review({ enrollmentId }) {
  const { data, isLoading, error } = useQuery(
    reviewQuery(["admin-enrollment-step2", enrollmentId], () =>
      fetchEnrollmentStep2(enrollmentId),
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
    return <StepUnavailable error={error} what="maternal kinship" />;
  }

  return (
    <KinshipReview
      enrollmentId={enrollmentId}
      queryKey={["admin-enrollment-step2", enrollmentId]}
      entries={[
        {
          label: "Mother",
          relation: "MOTHER",
          person: data?.mother,
          showDateOfBirth: true,
        },
        {
          label: "Maternal Grandmother",
          relation: "MATERNAL_GRANDMOTHER",
          person: data?.maternalGrandmother,
        },
        {
          label: "Maternal Grandfather",
          relation: "MATERNAL_GRANDFATHER",
          person: data?.maternalGrandfather,
        },
      ]}
    />
  );
}
