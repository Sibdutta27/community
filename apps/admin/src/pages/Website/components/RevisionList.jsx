import { Alert, Box, Button, Chip, Skeleton, Typography } from "@mui/material";

import { findPageForKeyPath } from "../pages.config";

/**
 * A change log, newest first.
 *
 * Shared by the History tab and the per-field history dialog so the two can
 * never describe the same events differently. Selecting a row is optional —
 * the History tab uses it to aim its live preview, the dialog does not.
 */
export default function RevisionList({
  revisions,
  isLoading,
  error,
  onRetry,
  selectedId,
  onSelect,
  emptyMessage = "No changes have been published yet.",
}) {
  if (error) {
    return (
      <Alert
        severity="error"
        action={
          onRetry ? (
            <Button color="inherit" size="small" onClick={onRetry}>
              Retry
            </Button>
          ) : null
        }
      >
        Could not load the change history.
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <Box sx={{ p: 1.25 }}>
        {[0, 1, 2].map((n) => (
          <Skeleton key={n} variant="rounded" height={64} sx={{ mb: 1 }} />
        ))}
      </Box>
    );
  }

  if (revisions.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="body2" color="text.secondary">
          {emptyMessage}
        </Typography>
      </Box>
    );
  }

  return revisions.map((revision, index) => {
    const page = findPageForKeyPath(revision.keyPath);
    const selectable = Boolean(onSelect);
    const isSelected = selectedId === revision.id;

    return (
      <Box
        key={revision.id}
        {...(selectable
          ? {
              role: "button",
              tabIndex: 0,
              onClick: () => onSelect(revision),
              onKeyDown: (event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelect(revision);
                }
              },
            }
          : {})}
        sx={{
          px: 1.5,
          py: 1.25,
          borderTop: index === 0 ? "none" : "1px solid var(--admin-border)",
          borderLeft: "3px solid",
          borderLeftColor: isSelected ? "primary.main" : "transparent",
          bgcolor: isSelected ? "var(--admin-surface-muted)" : "transparent",
          cursor: selectable ? "pointer" : "default",
          outline: "none",
          "&:hover": selectable
            ? { bgcolor: "var(--admin-surface-muted)" }
            : undefined,
          "&:focus-visible": {
            boxShadow: "inset 0 0 0 2px var(--admin-primary)",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            flexWrap: "wrap",
          }}
        >
          <Chip
            size="small"
            variant="outlined"
            color={revision.action === "REVERTED" ? "default" : "primary"}
            label={revision.action === "REVERTED" ? "Restored" : "Published"}
          />

          {page ? (
            <Chip size="small" variant="outlined" label={page.label} />
          ) : null}

          <Typography
            variant="body2"
            fontWeight={600}
            noWrap
            sx={{ minWidth: 0 }}
          >
            {revision.keyPath}
          </Typography>

          <Typography
            variant="caption"
            sx={{ color: "var(--admin-muted)", ml: "auto" }}
          >
            {new Date(revision.createdAt).toLocaleString()}
            {revision.actorEmail ? ` · ${revision.actorEmail}` : ""}
          </Typography>
        </Box>

        {/* Before and after, both languages. A log that only says "changed"
            cannot answer what it used to say. */}
        <Box
          sx={{
            display: "grid",
            gap: 1,
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
            mt: 0.75,
          }}
        >
          <RevisionDiff
            label="English"
            from={revision.fromEn}
            to={revision.toEn}
          />
          <RevisionDiff
            label="Español"
            from={revision.fromEs}
            to={revision.toEs}
          />
        </Box>
      </Box>
    );
  });
}

/**
 * One locale's before/after. A null side means "the shipped original" — a
 * restore has no "to", and a first publish has no "from".
 */
function RevisionDiff({ label, from, to }) {
  if (from === null && to === null) {
    return null;
  }

  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography
        variant="caption"
        sx={{ color: "var(--admin-muted)", display: "block" }}
      >
        {label}
      </Typography>

      <Typography
        variant="caption"
        sx={{
          display: "block",
          color: "var(--admin-muted)",
          textDecoration: "line-through",
        }}
      >
        {from ?? "the original wording"}
      </Typography>

      <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
        {to ?? "the original wording"}
      </Typography>
    </Box>
  );
}
