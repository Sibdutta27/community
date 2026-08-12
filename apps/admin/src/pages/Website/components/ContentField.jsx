import { useEffect, useState } from "react";

import {
  Box,
  Chip,
  IconButton,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import UndoIcon from "@mui/icons-material/Undo";

import { extractPlaceholders, missingPlaceholders } from "../placeholders.util";

/**
 * One editable string, in both languages at once.
 *
 * Side by side rather than behind a language toggle on purpose: the catalogs
 * are held at exact key parity, so every edit is really a pair. A toggle makes
 * it easy to rewrite English, feel finished, and leave Spanish saying the old
 * thing — which is the failure this layout prevents by construction.
 *
 * Drafts save on blur. The field keeps what the person typed until then; the
 * server is not a better source of truth mid-sentence.
 */
export default function ContentField({ field, onSave, onRevert, saving }) {
  const override = field.override;

  const serverEn =
    override?.draftEn ?? override?.publishedEn ?? field.defaultEn;
  const serverEs =
    override?.draftEs ?? override?.publishedEs ?? field.defaultEs;

  const [en, setEn] = useState(serverEn);
  const [es, setEs] = useState(serverEs);
  const [error, setError] = useState(null);

  // Re-seed when the server value changes underneath us — after a publish,
  // revert or discard. Keyed on the values themselves so typing is untouched.
  useEffect(() => {
    setEn(serverEn);
    setEs(serverEs);
    setError(null);
  }, [serverEn, serverEs]);

  const isPublished = Boolean(override?.publishedAt);
  const hasDraft = Boolean(override?.draftEn || override?.draftEs);
  const isLong = field.defaultEn.length > 80;

  const commit = async (nextEn, nextEs) => {
    if (nextEn === serverEn && nextEs === serverEs) {
      return;
    }

    // Checked here as well as on the server so the person sees the problem
    // beside the field they are typing in, not as a toast after the fact.
    const missing = [
      ...missingPlaceholders(field.defaultEn, nextEn),
      ...missingPlaceholders(field.defaultEs, nextEs),
    ];

    if (missing.length > 0) {
      setError(`Keep ${[...new Set(missing)].join(", ")} — the page needs it.`);
      return;
    }

    setError(null);

    try {
      await onSave({ keyPath: field.keyPath, en: nextEn, es: nextEs });
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          "Could not save. Check your connection and try again.",
      );
    }
  };

  const placeholders = extractPlaceholders(field.defaultEn);

  return (
    <Box
      sx={{
        py: 1.5,
        borderTop: "1px solid var(--admin-border)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: 0.75,
          flexWrap: "wrap",
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          {humaniseKey(field.keyPath)}
        </Typography>

        {hasDraft ? (
          <Chip
            size="small"
            color="warning"
            variant="outlined"
            label="Unpublished"
          />
        ) : isPublished ? (
          <Chip
            size="small"
            color="primary"
            variant="outlined"
            label="Edited"
          />
        ) : null}

        {placeholders.map((token) => (
          <Tooltip
            key={token}
            title="This must appear in your text — the page uses it"
          >
            <Chip
              size="small"
              variant="outlined"
              label={token}
              sx={{ fontFamily: "monospace", fontSize: "0.68rem" }}
            />
          </Tooltip>
        ))}

        {isPublished || hasDraft ? (
          <Tooltip title="Restore the original wording">
            <span style={{ marginLeft: "auto" }}>
              <IconButton
                size="small"
                disabled={saving}
                onClick={() => onRevert(field.keyPath)}
                aria-label={`Restore original wording for ${humaniseKey(field.keyPath)}`}
              >
                <UndoIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        ) : null}
      </Box>

      <Box
        sx={{
          display: "grid",
          gap: 1.5,
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
        }}
      >
        <TextField
          label="English"
          value={en}
          onChange={(event) => setEn(event.target.value)}
          onBlur={() => commit(en, es)}
          multiline={isLong}
          minRows={isLong ? 3 : undefined}
          fullWidth
          size="small"
          error={Boolean(error)}
        />

        <TextField
          label="Español"
          value={es}
          onChange={(event) => setEs(event.target.value)}
          onBlur={() => commit(en, es)}
          multiline={isLong}
          minRows={isLong ? 3 : undefined}
          fullWidth
          size="small"
          error={Boolean(error)}
        />
      </Box>

      {error ? (
        <Typography
          variant="caption"
          color="error"
          sx={{ mt: 0.5, display: "block" }}
        >
          {error}
        </Typography>
      ) : (
        <Typography
          variant="caption"
          sx={{ mt: 0.5, display: "block", color: "var(--admin-muted)" }}
        >
          {field.keyPath}
        </Typography>
      )}
    </Box>
  );
}

/**
 * "home.hero.ctaEnroll" → "Cta enroll". The full path stays visible underneath
 * for anyone who needs it; the heading is for everyone else.
 */
function humaniseKey(keyPath) {
  const last = keyPath.split(".").slice(-1)[0];

  const spaced = last
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]/g, " ");

  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}
