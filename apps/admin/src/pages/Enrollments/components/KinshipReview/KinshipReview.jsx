// KinshipReview.jsx
//
// Shared renderer for the kinship (Ancestry) review cards.
// Step 2 (maternal) and Step 3 (paternal) both render three
// ancestor cards with the same shape:
// { name, dateOfBirth, nationality, municipality, yucayeke, isBorikuaTaino,
//   verificationStatus }
// An ancestor can be null — every field falls back to '—'.
// When `enrollmentId` is provided and an entry carries a `relation`,
// the card header shows the admin-only verification select.

import styles from "./kinshipReview.module.css";

import { MenuItem, Paper, Select, Skeleton, Typography } from "@mui/material";

import {
  CalendarMonth,
  Diversity3,
  FamilyRestroom,
  Home,
  LocationOn,
  Public,
} from "@mui/icons-material";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "react-toastify";

import { verifyAncestry } from "@/api/enrollment.api";

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
      size="small"
      value={status || "UNVERIFIED"}
      onChange={handleChange}
      disabled={isPending}
      sx={{ minWidth: 190 }}
    >
      {VERIFICATION_OPTIONS.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </Select>
  );
}

export default function KinshipReview({ entries, enrollmentId, queryKey }) {
  return (
    <div className={styles.container}>
      {entries.map((entry) => (
        <Paper key={entry.label} className={styles.kinshipCard}>
          {/* HEADER */}
          <div className={styles.cardHeader}>
            <div className={styles.headerLeft}>
              <div className={styles.iconBox}>
                <FamilyRestroom />
              </div>

              <div>
                <Typography className={styles.relation}>
                  {entry.label}
                </Typography>

                <Typography className={styles.fullName}>
                  {entry.person?.name || "—"}
                </Typography>
              </div>
            </div>

            {enrollmentId && entry.relation && entry.person && (
              <VerificationSelect
                enrollmentId={enrollmentId}
                relation={entry.relation}
                status={entry.person?.verificationStatus}
                queryKey={queryKey}
              />
            )}
          </div>

          {/* BODY */}
          <div className={styles.grid}>
            {entry.showDateOfBirth && (
              <InfoItem
                icon={<CalendarMonth />}
                label="Date of Birth"
                value={
                  entry.person?.dateOfBirth
                    ? new Date(entry.person.dateOfBirth).toLocaleDateString()
                    : null
                }
              />
            )}

            <InfoItem
              icon={<Public />}
              label="Nationality"
              value={entry.person?.nationality}
            />

            <InfoItem
              icon={<LocationOn />}
              label="Municipality"
              value={entry.person?.municipality}
            />

            <InfoItem
              icon={<Home />}
              label="Yucayeke"
              value={entry.person?.yucayeke}
            />

            <InfoItem
              icon={<Diversity3 />}
              label="Borikua Taíno Heritage"
              value={formatBoolean(entry.person?.isBorikuaTaino)}
            />
          </div>
        </Paper>
      ))}
    </div>
  );
}

/**
 * Loading skeleton (three ancestor cards)
 */
export function KinshipReviewSkeleton() {
  return (
    <div className={styles.loadingContainer}>
      {[1, 2, 3].map((item) => (
        <Paper key={item} className={styles.kinshipCard}>
          <Skeleton variant="text" width={200} height={40} />

          <div className={styles.grid}>
            {[1, 2, 3, 4].map((field) => (
              <div key={field}>
                <Skeleton variant="text" width={120} height={18} />

                <Skeleton variant="rounded" height={54} />
              </div>
            ))}
          </div>
        </Paper>
      ))}
    </div>
  );
}

/**
 * Format nullable boolean
 */
function formatBoolean(value) {
  if (value === true) {
    return "Yes";
  }

  if (value === false) {
    return "No";
  }

  return null;
}

/**
 * Info Item
 */
function InfoItem({ icon, label, value }) {
  return (
    <div className={styles.fieldGroup}>
      <Typography className={styles.fieldLabel}>{label}</Typography>

      <div className={styles.fieldBox}>
        <div className={styles.fieldIcon}>{icon}</div>

        <Typography className={styles.fieldValue}>{value || "—"}</Typography>
      </div>
    </div>
  );
}
