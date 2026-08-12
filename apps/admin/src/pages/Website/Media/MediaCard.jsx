import { useEffect, useState } from "react";

import { Box, TextField, Tooltip, Typography } from "@mui/material";

import BrokenImageIcon from "@mui/icons-material/BrokenImage";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

/**
 * One image in the library, with its description in both languages.
 *
 * The two alt fields sit side by side rather than behind a language toggle,
 * for the same reason the copy editor does: the site is bilingual, so a
 * description is really a pair, and a toggle makes it easy to write English,
 * feel finished, and leave Spanish blank.
 *
 * Alt text saves on blur — the server is not a better source of truth while
 * someone is mid-sentence.
 */
export default function MediaCard({ media, onSaveAlt, saving }) {
  const [altEn, setAltEn] = useState(media.altEn ?? "");
  const [altEs, setAltEs] = useState(media.altEs ?? "");

  // Re-seed when the server value changes underneath us. Keyed on the values
  // themselves so typing is untouched.
  useEffect(() => {
    setAltEn(media.altEn ?? "");
    setAltEs(media.altEs ?? "");
  }, [media.altEn, media.altEs]);

  const commit = () => {
    if (altEn === (media.altEn ?? "") && altEs === (media.altEs ?? "")) {
      return;
    }

    onSaveAlt({ id: media.id, altEn, altEs });
  };

  const missingAlt = !altEn.trim() || !altEs.trim();

  return (
    <Box
      sx={{
        border: "1px solid var(--admin-border)",
        borderRadius: "10px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          height: 132,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#f2f4f7",
          color: "var(--admin-muted)",
        }}
      >
        {media.url ? (
          <Box
            component="img"
            src={media.url}
            alt={altEn || media.fileName}
            loading="lazy"
            sx={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
          />
        ) : (
          <BrokenImageIcon fontSize="small" />
        )}
      </Box>

      <Box sx={{ p: 1.25, display: "flex", flexDirection: "column", gap: 1 }}>
        <Box
          sx={{ display: "flex", alignItems: "center", gap: 0.5, minWidth: 0 }}
        >
          <Typography variant="body2" fontWeight={700} noWrap sx={{ flex: 1 }}>
            {media.fileName}
          </Typography>

          {missingAlt ? (
            <Tooltip title="Describe this image in both languages — screen readers and search engines read this text.">
              <WarningAmberIcon fontSize="small" color="warning" />
            </Tooltip>
          ) : null}
        </Box>

        <Typography variant="caption" sx={{ color: "var(--admin-muted)" }}>
          {formatFileSize(media.fileSize)} · {media.mimeType.split("/")[1]}
        </Typography>

        <TextField
          label="Description (English)"
          size="small"
          fullWidth
          value={altEn}
          disabled={saving}
          onChange={(event) => setAltEn(event.target.value)}
          onBlur={commit}
        />

        <TextField
          label="Descripción (Español)"
          size="small"
          fullWidth
          value={altEs}
          disabled={saving}
          onChange={(event) => setAltEs(event.target.value)}
          onBlur={commit}
        />
      </Box>
    </Box>
  );
}

function formatFileSize(bytes) {
  if (!bytes) return "—";

  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
