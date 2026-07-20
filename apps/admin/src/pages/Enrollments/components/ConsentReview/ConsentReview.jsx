// ConsentReview.jsx
//
// Read-only consent summary shown in the approval step: every consent
// attached to the enrollment with its acceptance state and timestamp.
// Contract: GET /admin/enrollment/consents/:enrollmentId →
// { consentAccepted, consents: [{ id, key, version, title, required,
//   accepted, acceptedAt }] }

import { useQuery } from "@tanstack/react-query";

import { Alert, Chip, Paper, Skeleton, Typography } from "@mui/material";

import { CheckCircle, RadioButtonUnchecked } from "@mui/icons-material";

import { fetchEnrollmentConsents } from "@/api/enrollment.api";

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

  return (
    <div>
      {consents.map((consent) => (
        <Paper
          key={consent.id}
          variant="outlined"
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            padding: 2,
            marginBottom: 1.5,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {consent.accepted ? (
              <CheckCircle color="success" />
            ) : (
              <RadioButtonUnchecked color="disabled" />
            )}

            <div>
              <Typography fontWeight={600}>{consent.title}</Typography>

              <Typography variant="body2" color="text.secondary">
                {consent.accepted && consent.acceptedAt
                  ? `Accepted on ${new Date(consent.acceptedAt).toLocaleString()}`
                  : "Not accepted yet"}
                {` · v${consent.version}`}
              </Typography>
            </div>
          </div>

          <Chip
            size="small"
            label={consent.required ? "Required" : "Optional"}
            color={consent.required ? "primary" : "default"}
            variant="outlined"
          />
        </Paper>
      ))}
    </div>
  );
}
