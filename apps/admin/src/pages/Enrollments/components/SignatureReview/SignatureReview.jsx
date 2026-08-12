// EnrollmentSignatureReview.jsx

import { useQuery } from "@tanstack/react-query";

import { Box, Chip, Skeleton } from "@mui/material";

import { Cancel, Draw, Verified } from "@mui/icons-material";

import { fetchEnrollmentStep1 } from "@/api/enrollment.api";

import { SectionHeader } from "@components/Panel/Panel";
import { Fact, Facts } from "@components/RecordFields/RecordFields";

import { reviewQuery } from "../../reviewQuery";
import StepUnavailable from "../../StepUnavailable";

export default function EnrollmentSignatureReview({ enrollmentId }) {
  const { data, isLoading, error } = useQuery(
    reviewQuery(["admin-enrollment-step1", enrollmentId], () =>
      fetchEnrollmentStep1(enrollmentId),
    ),
  );

  /**
   * Loading UI
   */
  if (isLoading) {
    return (
      <Box>
        <Skeleton variant="text" width={220} height={22} />

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(3, minmax(0, 1fr))",
            },
            columnGap: 3,
          }}
        >
          {[1, 2, 3].map((field) => (
            <Box key={field} sx={{ py: 0.75 }}>
              <Skeleton variant="text" width={90} height={14} />
              <Skeleton variant="text" width="70%" height={18} />
            </Box>
          ))}
        </Box>
      </Box>
    );
  }

  /**
   * Error UI
   */
  if (error) {
    return <StepUnavailable error={error} what="e-signature" />;
  }

  const signature = data?.signature;

  return (
    <Box>
      <Box
        sx={{
          pb: 0.75,
          mb: 0.5,
          borderBottom: "2px solid",
          borderColor: "divider",
        }}
      >
        <SectionHeader
          icon={<Draw />}
          title="E-signature"
          description="How the applicant confirmed and submitted"
        />
      </Box>

      <Box component="dl" sx={{ m: 0 }}>
        <Facts>
          <Fact label="Signature Name" value={signature?.signatureName} />

          <Fact
            label="Signature Date"
            value={
              signature?.signatureDate
                ? new Date(signature.signatureDate).toLocaleDateString()
                : null
            }
          />

          <Fact
            label="Agreed to Terms"
            value={
              <Chip
                icon={signature?.agreedToTerms ? <Verified /> : <Cancel />}
                label={signature?.agreedToTerms ? "Agreed" : "Not agreed"}
                color={signature?.agreedToTerms ? "success" : "error"}
                variant="outlined"
              />
            }
          />
        </Facts>
      </Box>
    </Box>
  );
}
