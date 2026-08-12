import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";

import OpenInNewIcon from "@mui/icons-material/OpenInNew";

import RevisionList from "./RevisionList";

import { useContentRevisions } from "../hooks";
import { findPageForKeyPath } from "../pages.config";

/**
 * The change log for one piece of text, opened from the field itself.
 *
 * The History tab answers "what changed on the site lately". This answers
 * "who touched THIS sentence, and what did it say before" — which is the
 * question people actually have while looking at a field they did not write.
 * Scrolling a site-wide log to find one key is not an answer.
 */
export default function FieldHistoryDialog({ keyPath, open, onClose }) {
  const { data, isLoading, error, refetch } = useContentRevisions({
    keyPath,
    limit: 20,
    // The dialog is the only consumer of this key's log; fetching on open
    // keeps a closed dialog off the network.
    enabled: open,
  });

  const revisions = data?.data ?? [];
  const page = findPageForKeyPath(keyPath);
  const webBaseUrl = import.meta.env.VITE_WEB_BASE_URL;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ fontSize: "1rem", fontWeight: 700, pb: 0.5 }}>
        Change history
        <Typography
          variant="caption"
          sx={{
            display: "block",
            color: "var(--admin-muted)",
            fontWeight: 400,
          }}
        >
          {keyPath}
        </Typography>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0 }}>
        <RevisionList
          revisions={revisions}
          isLoading={isLoading}
          error={error}
          onRetry={() => refetch()}
          emptyMessage="This text has never been changed — the site is showing the wording that shipped in the code."
        />
      </DialogContent>

      <DialogActions>
        {page && webBaseUrl ? (
          <Button
            component="a"
            href={`${webBaseUrl}${page.previewPath}`}
            target="_blank"
            rel="noreferrer"
            startIcon={<OpenInNewIcon />}
            sx={{ mr: "auto" }}
          >
            See {page.label} live
          </Button>
        ) : (
          <Box sx={{ mr: "auto" }} />
        )}

        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
