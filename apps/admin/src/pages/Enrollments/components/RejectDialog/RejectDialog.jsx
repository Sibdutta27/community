import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Skeleton,
  TextField,
  Typography,
} from "@mui/material";

import { fetchNotificationChannels } from "@/api/enrollment.api";

const CHANNEL_LABELS = {
  ACCOUNT_EMAIL: "Account email",
  CONTACT_EMAIL: "Contact email",
  SMS: "Text message",
};

/**
 * Rejecting an application: why, and who should be told.
 *
 * Rejection used to be a bare boolean behind a `window.confirm` — nothing was
 * recorded, so the decision could not be explained to the applicant later or
 * reviewed if it was ever challenged.
 *
 * Only channels the member actually registered are offered, and a channel they
 * did not consent to (SMS without `allowSMS`) is shown disabled with the
 * reason rather than hidden — staff should see that the option exists and why
 * it cannot be used.
 */
export default function RejectDialog({
  enrollmentId,
  open,
  pending,
  onClose,
  onConfirm,
}) {
  const [reason, setReason] = useState("");
  const [selected, setSelected] = useState([]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["enrollment-notification-channels", enrollmentId],
    queryFn: () => fetchNotificationChannels(enrollmentId),
    enabled: open && Boolean(enrollmentId),
  });

  const channels = data?.channels ?? [];

  const toggle = (channel) =>
    setSelected((prev) =>
      prev.includes(channel)
        ? prev.filter((value) => value !== channel)
        : [...prev, channel],
    );

  const handleClose = () => {
    setReason("");
    setSelected([]);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontSize: "1rem", fontWeight: 700 }}>
        Reject this application
      </DialogTitle>

      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          This decides someone&apos;s enrollment and there is no undo here. The
          reason is stored on the record.
        </Typography>

        <TextField
          label="Reason for rejection"
          placeholder="What was missing or did not match?"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          multiline
          minRows={3}
          fullWidth
          inputProps={{ maxLength: 2000 }}
          helperText={`${reason.length}/2000`}
        />

        <Typography
          variant="subtitle2"
          fontWeight={700}
          sx={{ mt: 2.5, mb: 0.5 }}
        >
          Notify the applicant
        </Typography>

        {isLoading ? (
          <Skeleton variant="rounded" height={72} />
        ) : error ? (
          <Alert severity="warning">
            Could not load this member&apos;s contact details. You can still
            record the decision.
          </Alert>
        ) : channels.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No contact details are on file for this member.
          </Typography>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            {channels.map((channel) => (
              <FormControlLabel
                key={channel.channel}
                disabled={!channel.available}
                control={
                  <Checkbox
                    size="small"
                    checked={selected.includes(channel.channel)}
                    onChange={() => toggle(channel.channel)}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2">
                      {CHANNEL_LABELS[channel.channel] ?? channel.channel}
                      {" — "}
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.secondary"
                      >
                        {channel.destination}
                      </Typography>
                    </Typography>

                    {channel.note ? (
                      <Typography variant="caption" color="text.secondary">
                        {channel.note}
                      </Typography>
                    ) : null}
                  </Box>
                }
              />
            ))}
          </Box>
        )}

        {/* Stated plainly rather than implied: this app has no mail or SMS
            provider, so choosing a channel queues a notice for a future
            sender. Telling staff otherwise would have them believe the
            applicant has been informed. */}
        {selected.length > 0 ? (
          <Alert severity="info" sx={{ mt: 1.5 }}>
            Sending is not connected yet. These will be recorded as pending
            notices — the applicant is not contacted automatically.
          </Alert>
        ) : null}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={pending}>
          Cancel
        </Button>

        <Button
          variant="contained"
          color="error"
          disabled={pending}
          onClick={() =>
            onConfirm({ reason: reason.trim(), channels: selected })
          }
        >
          {pending ? "Recording…" : "Reject application"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
