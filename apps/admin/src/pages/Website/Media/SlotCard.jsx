import {
  Box,
  Button,
  Chip,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";

import ImageIcon from "@mui/icons-material/Image";

/**
 * One image position on the site.
 *
 * Always shows what the position is showing right now — the assigned image, or
 * the file that ships with the site when nothing is assigned. That second case
 * is not an empty state: an unassigned slot is a working image, and saying
 * "none" would suggest the page is broken when it is not.
 *
 * The shipped default is named rather than previewed: it lives in the public
 * site's own bundle, not in storage this panel can read.
 */
export default function SlotCard({
  slot,
  library,
  onAssign,
  onClear,
  disabled,
}) {
  const assigned = slot.media;

  return (
    <Box
      sx={{
        display: "grid",
        gap: 1.5,
        gridTemplateColumns: { xs: "1fr", sm: "112px minmax(0, 1fr)" },
        alignItems: "start",
        py: 1.5,
        borderTop: "1px solid var(--admin-border)",
      }}
    >
      <Box
        sx={{
          height: 84,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1px solid var(--admin-border)",
          borderRadius: "8px",
          bgcolor: "#f2f4f7",
          color: "var(--admin-muted)",
          overflow: "hidden",
        }}
      >
        {assigned?.url ? (
          <Box
            component="img"
            src={assigned.url}
            alt={assigned.altEn || assigned.fileName}
            loading="lazy"
            sx={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
          />
        ) : (
          <ImageIcon fontSize="small" />
        )}
      </Box>

      <Box sx={{ minWidth: 0 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            flexWrap: "wrap",
            mb: 0.25,
          }}
        >
          <Typography variant="body2" fontWeight={700}>
            {slot.label}
          </Typography>

          {assigned ? (
            <Chip
              size="small"
              color="primary"
              variant="outlined"
              label="Custom image"
            />
          ) : (
            <Chip size="small" variant="outlined" label="Original" />
          )}
        </Box>

        <Typography
          variant="caption"
          sx={{ color: "var(--admin-muted)", display: "block" }}
        >
          {slot.description}
        </Typography>

        <Typography
          variant="caption"
          sx={{ color: "var(--admin-muted)", display: "block", mt: 0.25 }}
        >
          {assigned
            ? `Showing your upload: ${assigned.fileName}`
            : `Showing the image that ships with the site: ${slot.defaultPath}`}
        </Typography>

        <Box
          sx={{
            display: "flex",
            gap: 1,
            alignItems: "center",
            flexWrap: "wrap",
            mt: 1,
          }}
        >
          <TextField
            select
            size="small"
            label="Image"
            value={slot.mediaId ?? ""}
            disabled={disabled || library.length === 0}
            onChange={(event) => {
              const mediaId = event.target.value;

              if (!mediaId) {
                onClear(slot.slotKey);
                return;
              }

              onAssign({ slotKey: slot.slotKey, mediaId });
            }}
            sx={{ minWidth: 240 }}
          >
            <MenuItem value="">
              <em>Original (ships with the site)</em>
            </MenuItem>

            {library.map((media) => (
              <MenuItem key={media.id} value={media.id}>
                {media.fileName}
              </MenuItem>
            ))}
          </TextField>

          {assigned ? (
            <Button
              size="small"
              variant="text"
              disabled={disabled}
              onClick={() => onClear(slot.slotKey)}
            >
              Restore original
            </Button>
          ) : null}
        </Box>
      </Box>
    </Box>
  );
}
