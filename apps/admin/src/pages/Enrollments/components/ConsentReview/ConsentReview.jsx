// ConsentReview.jsx
//
// Read-only consent summary shown in the approval step: every consent
// attached to the enrollment with its acceptance state and timestamp.
// Contract: GET /admin/enrollment/consents/:enrollmentId →
// { consentAccepted, consents: [{ id, key, version, title, required,
//   accepted, acceptedAt }] }

import { useQuery } from "@tanstack/react-query";

import { Alert, Skeleton } from "@mui/material";

import { fetchEnrollmentConsents } from "@/api/enrollment.api";
import ConsentRecordList from "@/components/ConsentRecord/ConsentRecord";

export default function ConsentReview({ enrollmentId }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-enrollment-consents", enrollmentId],
    queryFn: () => fetchEnrollmentConsents(enrollmentId),
  });

  /**
   * Loading
   */
  if (isLoading) {
    return (
      <div>
        {[1, 2].map((item) => (
          <Skeleton
            key={item}
            variant="rounded"
            height={64}
            sx={{ marginBottom: 1.5 }}
          />
        ))}
      </div>
    );
  }

  /**
   * Error
   */
  if (error) {
    return <Alert severity="error">Failed to load consent data</Alert>;
  }

  const consents = data?.consents ?? [];

  if (consents.length === 0) {
    return (
      <Alert severity="info">
        No consents are attached to this enrollment yet
      </Alert>
    );
  }

  return <ConsentRecordList consents={consents} />;
}
