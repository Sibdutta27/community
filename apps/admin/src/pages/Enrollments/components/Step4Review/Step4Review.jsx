// EnrollmentStep4Review.jsx

import styles from "./step4Review.module.css";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Skeleton,
  Typography,
} from "@mui/material";

import {
  CheckCircle,
  Close,
  Description,
  Download,
  Image,
  InsertDriveFile,
  Verified,
} from "@mui/icons-material";

import { toast } from "react-toastify";

import {
  fetchEnrollmentStep4,
  verifyEnrollmentDocument,
} from "@/api/enrollment.api";

import { reviewQuery } from "../../reviewQuery";
import StepUnavailable from "../../StepUnavailable";

const DOCUMENT_TYPES = [
  "USER_PHOTO",
  "STATE_ID",
  "BIRTH_CERTIFICATE",
  "SOCIAL_SECURITY_CARD",
  "GENEALOGICAL_RECORDS",
  "KINSHIP_LETTERS",
  "ORAL_HISTORY",
  "DNA_TESTING",
];

const DOCUMENT_TITLES = {
  USER_PHOTO: "User Photo",
  STATE_ID: "State ID",
  BIRTH_CERTIFICATE: "Birth Certificate",
  SOCIAL_SECURITY_CARD: "Social Security Card",
  GENEALOGICAL_RECORDS: "Genealogical Records",
  KINSHIP_LETTERS: "Kinship Letters",
  ORAL_HISTORY: "Oral History",
  DNA_TESTING: "DNA Testing",
};

/**
 * Documents the member-facing enrollment refuses to submit without: the photo
 * and — since the client's 2026-07-20 request — a government-issued ID.
 *
 * Approval gating deliberately does NOT enforce the ID (that would hard-block
 * every application submitted under the old 2-of-3 rule and stall the review
 * queue), so a legacy application missing one is surfaced here as a warning
 * for the reviewer to act on.
 */
const REQUIRED_DOCUMENT_TYPES = ["USER_PHOTO", "STATE_ID"];

/** Normalizes the single-vs-multi upload shape returned by the API. */
function getGroupDocuments(group) {
  if (group.isSingle) {
    return group.documents ? [group.documents] : [];
  }

  return group.documents || [];
}

export default function EnrollmentStep4Review({ enrollmentId }) {
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    error,
    refetch: refetchStep4,
  } = useQuery(
    reviewQuery(["admin-enrollment-step4", enrollmentId], () =>
      fetchEnrollmentStep4(enrollmentId),
    ),
  );

  /**
   * Verify mutation
   */
  const { mutateAsync: verificationMut, isPending: vefificationPanding } =
    useMutation({
      mutationFn: verifyEnrollmentDocument,

      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["admin-enrollment-step4", enrollmentId],
        });
      },
    });

  /**
   * Handle verification document
   */
  const handleVerification = async (documentId, isApproved) => {
    await verificationMut(
      { documentId, isApproved },
      {
        /**
         * Handle on success
         */
        onSuccess: () => {
          refetchStep4();

          // Show the success message
          toast.success("Document Verification Successfull");
        },

        /**
         * Handle on error
         */
        onError: (error) => {
          // Show the error message
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "Failed to vefify document. Please check your connection and try again";
          toast.error(errorMessage);
        },
      },
    );
  };

  /**
   * Loading
   */
  if (isLoading) {
    return (
      <div className={styles.loadingGrid}>
        {[1, 2, 3].map((item) => (
          <div key={item} className={styles.categoryBlock}>
            <Skeleton variant="text" width={200} height={22} />

            <Skeleton variant="rounded" height={104} />
          </div>
        ))}
      </div>
    );
  }

  /**
   * Error
   */
  if (error) {
    return <StepUnavailable error={error} what="documents" />;
  }

  /**
   * Required types with nothing uploaded — the reviewer's headline warning.
   */
  const missingRequiredTypes = REQUIRED_DOCUMENT_TYPES.filter((type) => {
    const group = data.find((item) => item.type === type);

    return !group || getGroupDocuments(group).length === 0;
  });

  return (
    <div className={styles.container}>
      {missingRequiredTypes.length > 0 && (
        <Alert severity="warning">
          Missing required{" "}
          {missingRequiredTypes.length > 1 ? "documents" : "document"}:{" "}
          <strong>
            {missingRequiredTypes
              .map((type) => DOCUMENT_TITLES[type])
              .join(", ")}
          </strong>
          . Applications submitted before the government-ID requirement took
          effect may be missing one — confirm with the applicant before
          approving.
        </Alert>
      )}

      {data.map((group) => {
        if (!DOCUMENT_TYPES.includes(group.type)) {
          return null;
        }

        const documents = getGroupDocuments(group);
        const isRequired = REQUIRED_DOCUMENT_TYPES.includes(group.type);

        return (
          <section key={group.type} className={styles.categoryBlock}>
            {/* HEADER */}
            <div className={styles.categoryHeader}>
              <div className={styles.categoryHeading}>
                <Typography component="h3" className={styles.categoryTitle}>
                  {DOCUMENT_TITLES[group.type]}
                </Typography>

                {isRequired && (
                  <Chip label="Required" color="error" variant="outlined" />
                )}
              </div>

              <Typography className={styles.categorySubTitle}>
                {documents.length}
                {group.isSingle ? " of 1" : ""} uploaded
              </Typography>
            </div>

            {/* EMPTY */}
            {documents.length === 0 &&
              (isRequired ? (
                <Alert severity="warning">
                  No {DOCUMENT_TITLES[group.type]} uploaded — this document is
                  required for enrollment.
                </Alert>
              ) : (
                <p className={styles.emptyLine}>
                  <InsertDriveFile />
                  Nothing uploaded
                </p>
              ))}

            {/* DOCUMENTS */}
            {documents.length > 0 && (
              <div className={styles.documentsGrid}>
                {documents.map((document) => (
                  <div key={document.id} className={styles.documentCard}>
                    {/* PREVIEW */}
                    <div className={styles.previewBox}>
                      <img
                        src={document.url}
                        alt={DOCUMENT_TITLES[document.type]}
                        className={styles.previewImage}
                      />
                    </div>

                    {/* BODY */}
                    <div className={styles.documentBody}>
                      {/* The group heading already names the type, so the tile
                          carries only what differs between tiles: when it
                          arrived, how big it is, and whether it is verified. */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 1,
                        }}
                      >
                        <Typography className={styles.documentMeta}>
                          {new Date(document.uploadedAt).toLocaleDateString()} ·{" "}
                          {(document.fileSize / 1024).toFixed(0)} KB
                        </Typography>

                        {document.verifiedByAdmin ? (
                          <Chip
                            icon={<Verified />}
                            label="Verified"
                            color="success"
                            variant="outlined"
                          />
                        ) : (
                          <Chip
                            label="Unverified"
                            color="warning"
                            variant="outlined"
                          />
                        )}
                      </Box>

                      {/* ACTIONS */}
                      <div className={styles.actionRow}>
                        <Button
                          variant="outlined"
                          startIcon={<Download />}
                          href={document.url}
                          target="_blank"
                        >
                          Open
                        </Button>

                        {document.verifiedByAdmin ? (
                          <Button
                            variant="outlined"
                            color="error"
                            startIcon={<Close />}
                            disabled={vefificationPanding}
                            onClick={() =>
                              handleVerification(document.id, false)
                            }
                          >
                            Unverify
                          </Button>
                        ) : (
                          <Button
                            variant="contained"
                            color="success"
                            startIcon={
                              vefificationPanding ? (
                                <CircularProgress size={14} color="inherit" />
                              ) : (
                                <CheckCircle />
                              )
                            }
                            disabled={vefificationPanding}
                            onClick={() =>
                              handleVerification(document.id, true)
                            }
                          >
                            Verify
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
