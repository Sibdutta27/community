import { Box, Chip, Typography } from "@mui/material";

import { CheckCircle, RadioButtonUnchecked } from "@mui/icons-material";

/**
 * A member's consent acceptances, rendered as a record sheet.
 *
 * Shared by the enrollment review step and the user record so the two can
 * never drift into describing the same legal facts differently. Rows are
 * hairline-separated rather than individually boxed — consistent with
 * `RecordFields`, and it keeps a 6-consent list inside one screen.
 */
export default function ConsentRecordList({ consents }) {
  return (
    <Box>
      {consents.map((consent, index) => (
        <Box
          key={consent.id}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            py: 1.25,
            borderTop: index === 0 ? "none" : "1px solid var(--admin-border)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.25,
              minWidth: 0,
            }}
          >
            {consent.accepted ? (
              <CheckCircle color="success" fontSize="small" />
            ) : (
              <RadioButtonUnchecked color="disabled" fontSize="small" />
            )}

            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" fontWeight={600} noWrap>
                {consent.title}
              </Typography>

              <Typography variant="caption" color="text.secondary">
                {/* The timestamp is the evidence that matters if an
                    acceptance is ever questioned, so it is never truncated
                    away — an unaccepted consent says so plainly. */}
                {consent.accepted && consent.acceptedAt
                  ? `Accepted ${new Date(consent.acceptedAt).toLocaleString()}`
                  : "Not accepted"}
                {` · v${consent.version}`}
              </Typography>
            </Box>
          </Box>

          <Chip
            size="small"
            label={consent.required ? "Required" : "Optional"}
            color={consent.required ? "primary" : "default"}
            variant="outlined"
            sx={{ flexShrink: 0 }}
          />
        </Box>
      ))}
    </Box>
  );
}
