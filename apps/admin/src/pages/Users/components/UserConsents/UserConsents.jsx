import { Alert, Chip, Skeleton, Stack, Typography } from "@mui/material";

import Panel from "@/components/Panel/Panel";
import ConsentRecordList from "@/components/ConsentRecord/ConsentRecord";

import { useUserConsents } from "../../hooks/useUser";

/**
 * A member's consent record, shown as a parameter of the user rather than as
 * its own destination.
 *
 * Consents used to be a top-level rail item listing the CATALOG — useful when
 * publishing a new version, useless when the question is "what has this member
 * agreed to?". That question is asked about a person, so it is answered on the
 * person.
 *
 * Acceptances hang off the enrollment, so a user who has never started one is
 * an empty state, not an error.
 */
export default function UserConsents({ userId }) {
  const { data, isLoading, error } = useUserConsents(userId);

  return (
    <Panel sx={{ mt: 2 }}>
      <Stack
        direction="row"
        sx={{
          alignItems: "center",
          justifyContent: "space-between",
          mb: 1.5,
        }}
      >
        <Typography variant="subtitle2" fontWeight={700}>
          Consent record
        </Typography>

        {data?.hasEnrollment ? (
          <Chip
            size="small"
            variant="outlined"
            color={data.consentAccepted ? "success" : "warning"}
            label={data.consentAccepted ? "Consent on file" : "Not yet given"}
          />
        ) : null}
      </Stack>

      {isLoading ? (
        <Skeleton variant="rounded" height={92} />
      ) : error ? (
        <Alert severity="error">
          Failed to load this member&apos;s consents
        </Alert>
      ) : !data?.hasEnrollment ? (
        <Typography variant="body2" color="text.secondary">
          This member has not started an enrollment, so no consents have been
          recorded yet.
        </Typography>
      ) : data.consents.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No consents are attached to this member&apos;s enrollment yet.
        </Typography>
      ) : (
        <ConsentRecordList consents={data.consents} />
      )}
    </Panel>
  );
}
