import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

import Panel from "@/components/Panel/Panel";

import { useFeedbackDetail, useUpdateFeedbackStatus } from "./hooks.js";

import styles from "./feedbackDetail.module.css";

import {
  FEEDBACK_STATUSES,
  feedbackStatusColor,
  feedbackStatusLabel,
  feedbackSubmitterName,
  formatFeedbackDate,
  formatFileSize,
} from "../utils.js";

/**
 * One labelled fact in the context block.
 */
const Meta = ({ label, children }) => (
  <Box sx={{ minWidth: 0 }}>
    <Typography className={styles.metaLabel}>{label}</Typography>
    <Box sx={{ mt: 0.5 }}>{children}</Box>
  </Box>
);

/**
 * Feedback detail — the full report, the context the widget captured with it,
 * the attachment, and the control that moves it through triage.
 */
export default function FeedbackDetail() {
  const { id: feedbackId } = useParams();

  const {
    data: feedback,
    isLoading,
    error,
    refetch,
  } = useFeedbackDetail(feedbackId);

  const { mutateAsync: updateStatus, isPending: statusPending } =
    useUpdateFeedbackStatus();

  /**
   * Handle a status change
   */
  const handleStatusChange = async (status) => {
    if (!status || status === feedback?.status) return;

    await updateStatus(
      { id: feedbackId, status },
      {
        onSuccess: () => {
          toast.success(`Marked as "${feedbackStatusLabel(status)}"`);
        },

        onError: (mutationError) => {
          const errorMessage =
            mutationError.response?.data?.message ||
            mutationError.message ||
            "Failed to update the status. Please try again.";

          toast.error(errorMessage);
        },
      },
    );
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !feedback) {
    return (
      <Panel>
        <Typography variant="h6" className={styles.errorText}>
          Could not load this feedback submission.
        </Typography>

        <Box sx={{ display: "flex", gap: 1.5, mt: 2 }}>
          <Button variant="contained" onClick={() => refetch()}>
            Retry
          </Button>

          <Button variant="outlined" component={Link} to="/feedback">
            Back to feedback
          </Button>
        </Box>
      </Panel>
    );
  }

  const attachment = feedback.attachment;
  const isImage = Boolean(attachment?.mimeType?.startsWith("image/"));

  return (
    <section className={styles.page}>
      <Box className={styles.header}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Button
            variant="text"
            component={Link}
            to="/feedback"
            startIcon={<ArrowBackIcon />}
          >
            Back
          </Button>

          <Typography variant="h4" className={styles.title}>
            Feedback
          </Typography>

          <Chip
            size="small"
            label={feedbackStatusLabel(feedback.status)}
            color={feedbackStatusColor(feedback.status)}
            variant="outlined"
          />
        </Box>

        <TextField
          select
          size="small"
          label="Status"
          sx={{ minWidth: 220 }}
          value={feedback.status}
          disabled={statusPending}
          onChange={(e) => handleStatusChange(e.target.value)}
          helperText={
            FEEDBACK_STATUSES.find((entry) => entry.value === feedback.status)
              ?.help
          }
        >
          {FEEDBACK_STATUSES.map((status) => (
            <MenuItem key={status.value} value={status.value}>
              {status.label}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {/* THE REPORT ITSELF */}
      <Panel padding="roomy">
        <Typography className={styles.metaLabel}>What they wrote</Typography>

        <Typography variant="body1" className={styles.message} sx={{ mt: 1.5 }}>
          {feedback.message}
        </Typography>
      </Panel>

      {/* CONTEXT CAPTURED WITH IT */}
      <Panel padding="roomy">
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
            },
            gap: 3,
          }}
        >
          <Meta label="Submitted">
            <Typography variant="body2" className={styles.metaValue}>
              {formatFeedbackDate(feedback.createdAt)}
            </Typography>
          </Meta>

          <Meta label="From">
            <Typography
              variant="body2"
              className={
                feedback.isAnonymous ? styles.anonymous : styles.metaValue
              }
            >
              {feedbackSubmitterName(feedback)}
              {feedback.isAnonymous ? " (not signed in)" : ""}
            </Typography>

            {!feedback.isAnonymous && (
              <Typography variant="body2" className={styles.metaValue}>
                {feedback.submitter?.email}
                {feedback.submitter?.publicId
                  ? ` · ID ${feedback.submitter.publicId}`
                  : ""}
              </Typography>
            )}
          </Meta>

          <Meta label="Page">
            <Typography
              variant="body2"
              component="a"
              href={feedback.pageUrl}
              target="_blank"
              rel="noreferrer"
              className={styles.pageLink}
            >
              {feedback.pageUrl}
            </Typography>
          </Meta>

          <Meta label="Language">
            <Typography variant="body2" className={styles.metaValue}>
              {feedback.locale || "—"}
            </Typography>
          </Meta>

          <Box sx={{ gridColumn: { sm: "1 / -1" } }}>
            <Meta label="Browser">
              <Typography
                variant="body2"
                className={`${styles.metaValue} ${styles.mono}`}
              >
                {feedback.userAgent || "Not reported"}
              </Typography>
            </Meta>
          </Box>
        </Box>
      </Panel>

      {/* ATTACHMENT */}
      <Panel padding="roomy">
        <Typography className={styles.metaLabel}>Attachment</Typography>

        {!attachment ? (
          <Typography
            variant="body2"
            sx={{ mt: 1.5, color: "var(--admin-muted)" }}
          >
            No attachment was sent with this report.
          </Typography>
        ) : (
          <Box sx={{ mt: 1.5 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 1.5,
              }}
            >
              <Typography variant="body2" className={styles.metaValue}>
                {attachment.name || "Attachment"}
                {formatFileSize(attachment.size)
                  ? ` · ${formatFileSize(attachment.size)}`
                  : ""}
              </Typography>

              <Button
                variant="outlined"
                size="small"
                component="a"
                href={attachment.url}
                target="_blank"
                rel="noreferrer"
                endIcon={<OpenInNewIcon />}
              >
                Open
              </Button>
            </Box>

            {isImage && (
              <>
                <Divider sx={{ my: 2 }} />

                <Box
                  component="a"
                  href={attachment.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Box
                    component="img"
                    src={attachment.url}
                    alt={attachment.name || "Feedback attachment"}
                    className={styles.attachmentPreview}
                  />
                </Box>
              </>
            )}
          </Box>
        )}
      </Panel>
    </section>
  );
}
