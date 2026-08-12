// KinshipReview.jsx
//
// Shared renderer for the kinship (Ancestry) review rows.
// Step 2 (maternal) and Step 3 (paternal) both render three
// ancestor entries with the same shape:
// { name, dateOfBirth, nationality, municipality, yucayeke, isBorikuaTaino,
//   verificationStatus }
// An ancestor can be null — every field falls back to '—'.
// When `enrollmentId` is provided and an entry carries a `relation`,
// the row header shows the admin-only verification select.

import { Box, MenuItem, Select, Skeleton, Typography } from "@mui/material";

import {
  CalendarMonth,
  Diversity3,
  Home,
  LocationOn,
  Public,
} from "@mui/icons-material";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "react-toastify";

import { verifyAncestry } from "@/api/enrollment.api";

import { Fact, Facts } from "@components/RecordFields/RecordFields";
import { formatBoolean } from "@/utils/formatBoolean.util";

const VERIFICATION_OPTIONS = [
  { value: "UNVERIFIED", label: "Unverified" },
  { value: "VERIFIED_DNA", label: "Verified — DNA" },
  { value: "VERIFIED_GENEALOGY", label: "Verified — Genealogy" },
];

/**
 * Admin-only verification select for one ancestry entry
 */
function VerificationSelect({ enrollmentId, relation, status, queryKey }) {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: verifyAncestry,
  });

  const handleChange = async (event) => {
    await mutateAsync(
      {
        enrollmentId,
        relation,
        status: event.target.value,
      },
      {
        onSuccess: () => {
          toast.success("Ancestry verification updated");
          queryClient.invalidateQueries({ queryKey });
        },

        onError: (error) => {
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "Failed to update verification. Please try again";
          toast.error(errorMessage);
        },
      },
    );
  };

  return (
    <Select
      value={status || "UNVERIFIED"}
      onChange={handleChange}
      disabled={isPending}
      sx={{ minWidth: 176, "& .MuiSelect-select": { fontSize: "0.8rem" } }}
    >
      {VERIFICATION_OPTIONS.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </Select>
  );
}

/**
 * Three ancestors, each a titled band of facts.
 *
 * This used to be three separate 28px-padded, 24px-radius, bordered cards with
 * a 58px icon tile and five fake-input field boxes apiece. The relation and the
 * ancestor's name are what a reviewer scans for, so they lead the row; the
 * verification control stays on the same line because setting it IS the task.
 */
export default function KinshipReview({ entries, enrollmentId, queryKey }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {entries.map((entry) => (
        <Box component="section" key={entry.label}>
          {/* HEADER */}
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "baseline",
              justifyContent: "space-between",
              gap: 1,

              pb: 0.75,
              mb: 0.5,
              borderBottom: "2px solid",
              borderColor: "divider",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "baseline",
                gap: 1,
                minWidth: 0,
              }}
            >
              <Typography
                sx={{
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  color: "text.secondary",
                  flexShrink: 0,
                }}
              >
                {entry.label}
              </Typography>

              <Typography
                sx={{
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  letterSpacing: "-0.01em",
                  color: entry.person?.name ? "text.primary" : "text.secondary",
                }}
              >
                {entry.person?.name || "Not provided"}
              </Typography>
            </Box>

            {enrollmentId && entry.relation && entry.person && (
              <VerificationSelect
                enrollmentId={enrollmentId}
                relation={entry.relation}
                status={entry.person?.verificationStatus}
                queryKey={queryKey}
              />
            )}
          </Box>

          {/* BODY */}
          <Box component="dl" sx={{ m: 0 }}>
            <Facts>
              {entry.showDateOfBirth && (
                <Fact
                  icon={<CalendarMonth />}
                  label="Date of Birth"
                  value={
                    entry.person?.dateOfBirth
                      ? new Date(entry.person.dateOfBirth).toLocaleDateString()
                      : null
                  }
                />
              )}

              <Fact
                icon={<Public />}
                label="Nationality"
                value={entry.person?.nationality}
              />

              <Fact
                icon={<LocationOn />}
                label="Municipality"
                value={entry.person?.municipality}
              />

              <Fact
                icon={<Home />}
                label="Yucayeke"
                value={entry.person?.yucayeke}
              />

              <Fact
                icon={<Diversity3 />}
                label="Borikua Taíno Heritage"
                value={formatBoolean(entry.person?.isBorikuaTaino)}
              />
            </Facts>
          </Box>
        </Box>
      ))}
    </Box>
  );
}

/**
 * Loading skeleton (three ancestor rows)
 */
export function KinshipReviewSkeleton() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {[1, 2, 3].map((item) => (
        <Box key={item}>
          <Skeleton variant="text" width={200} height={22} />

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
                lg: "repeat(3, minmax(0, 1fr))",
              },
              columnGap: 3,
            }}
          >
            {[1, 2, 3, 4].map((field) => (
              <Box key={field} sx={{ py: 0.75 }}>
                <Skeleton variant="text" width={90} height={14} />
                <Skeleton variant="text" width="70%" height={18} />
              </Box>
            ))}
          </Box>
        </Box>
      ))}
    </Box>
  );
}
