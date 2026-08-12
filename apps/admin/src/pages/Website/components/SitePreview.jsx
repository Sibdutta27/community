import { useEffect, useRef, useState } from "react";

import {
  Alert,
  Box,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";

import RefreshIcon from "@mui/icons-material/Refresh";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

/**
 * The live site, beside the editor.
 *
 * This shows PUBLISHED content, not drafts — say so plainly rather than let
 * someone believe their unsaved wording is what visitors see. Drafts would
 * need the web app in draft mode, which is a first-party cookie on that origin
 * and cannot be set from here.
 *
 * Language is passed as `?lang=` rather than by setting the locale cookie: in
 * an iframe that cookie is third-party and browsers will not send it, so a
 * Spanish preview would silently render English. The web app's middleware
 * turns the parameter into a request header and never persists it, so
 * previewing Spanish cannot change anyone's actual language.
 */
export default function SitePreview({ path = "/", reloadToken }) {
  const [locale, setLocale] = useState("en");
  const [nonce, setNonce] = useState(0);

  const frameRef = useRef(null);

  const baseUrl = import.meta.env.VITE_WEB_BASE_URL;

  // Reload when the caller publishes, so the pane stops showing yesterday.
  useEffect(() => {
    setNonce((value) => value + 1);
  }, [reloadToken]);

  if (!baseUrl) {
    return (
      <Alert severity="info">
        Set <code>VITE_WEB_BASE_URL</code> to preview the site here.
      </Alert>
    );
  }

  const src = `${baseUrl}${path}${path.includes("?") ? "&" : "?"}lang=${locale}&_=${nonce}`;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        border: "1px solid var(--admin-border)",
        borderRadius: "10px",
        overflow: "hidden",
        background: "#fff",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 1,
          py: 0.5,
          borderBottom: "1px solid var(--admin-border)",
        }}
      >
        <Typography
          variant="caption"
          sx={{ color: "var(--admin-muted)", flex: 1, minWidth: 0 }}
          noWrap
        >
          Live site · published only
        </Typography>

        <ToggleButtonGroup
          size="small"
          exclusive
          value={locale}
          onChange={(_event, next) => next && setLocale(next)}
          aria-label="Preview language"
        >
          <ToggleButton value="en" sx={{ px: 1, py: 0.125 }}>
            EN
          </ToggleButton>
          <ToggleButton value="es" sx={{ px: 1, py: 0.125 }}>
            ES
          </ToggleButton>
        </ToggleButtonGroup>

        <Tooltip title="Reload preview">
          <IconButton
            size="small"
            onClick={() => setNonce((value) => value + 1)}
            aria-label="Reload preview"
          >
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Open in a new tab">
          <IconButton
            size="small"
            component="a"
            href={`${baseUrl}${path}`}
            target="_blank"
            rel="noreferrer"
            aria-label="Open the live page in a new tab"
          >
            <OpenInNewIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <Box
        component="iframe"
        key={src}
        ref={frameRef}
        src={src}
        title="Live site preview"
        // `allow-same-origin` is required, not optional: without it the frame
        // gets an opaque origin and the site's own scripts throw on
        // document.cookie, so the preview renders but never hydrates. It costs
        // nothing here — the site is a different origin from the admin, so it
        // still cannot reach into this page. What the sandbox does buy is the
        // absence of allow-top-navigation: the framed page cannot navigate the
        // admin out from under whoever is editing.
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        sx={{
          width: "100%",
          height: { xs: 420, lg: 640 },
          border: "none",
          display: "block",
        }}
      />
    </Box>
  );
}
