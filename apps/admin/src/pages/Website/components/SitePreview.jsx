import { useEffect, useLayoutEffect, useRef, useState } from "react";

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
import DesktopWindowsIcon from "@mui/icons-material/DesktopWindows";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";

/**
 * The live site, as the Studio's right-hand column.
 *
 * Shows PUBLISHED content — said plainly rather than letting anyone believe
 * their unsaved wording is what visitors see. Drafts would need the web app in
 * draft mode, which is a first-party cookie on that origin and cannot be set
 * from here.
 *
 * The column is narrower than a browser, so the frame is rendered at a real
 * viewport width and scaled down with a transform. Letting it render at the
 * column's own width would show the site's MOBILE layout, which is the wrong
 * answer to "how does this page look" when the person is editing desktop copy.
 * The device toggle makes that choice explicit instead of accidental.
 *
 * Language travels as `?lang=`, not the locale cookie: in an iframe that cookie
 * is third-party and browsers will not send it, so a Spanish preview would
 * silently render English. The web app's middleware turns the parameter into a
 * request header and never persists it.
 */

/** Widths the frame renders at, before scaling. */
const DEVICES = {
  desktop: {
    width: 1280,
    height: 900,
    label: "Desktop",
    icon: <DesktopWindowsIcon sx={{ fontSize: 15 }} />,
  },
  mobile: {
    width: 390,
    height: 780,
    label: "Mobile",
    icon: <PhoneIphoneIcon sx={{ fontSize: 15 }} />,
  },
};

export default function SitePreview({ path = "/", reloadToken }) {
  const [locale, setLocale] = useState("en");
  const [device, setDevice] = useState("desktop");
  const [nonce, setNonce] = useState(0);
  const [scale, setScale] = useState(1);

  const frameRef = useRef(null);

  const baseUrl = import.meta.env.VITE_WEB_BASE_URL;

  // Reload when the caller publishes, so the pane stops showing yesterday.
  useEffect(() => {
    setNonce((value) => value + 1);
  }, [reloadToken]);

  // Fit the rendered viewport to whatever width the column actually got.
  // Measured rather than derived from breakpoints, because the column shares
  // its row with an editor whose width depends on the sidebar's collapsed
  // state as well as the window.
  useLayoutEffect(() => {
    const element = frameRef.current;

    if (!element) {
      return;
    }

    const fit = () => {
      const available = element.clientWidth;

      if (available > 0) {
        // Never scale up: a 390px mobile frame in a 420px column should sit at
        // 1:1, not stretch into a shape no phone has.
        setScale(Math.min(1, available / DEVICES[device].width));
      }
    };

    fit();

    const observer = new ResizeObserver(fit);
    observer.observe(element);

    return () => observer.disconnect();
  }, [device]);

  if (!baseUrl) {
    return (
      <Alert severity="info">
        Set <code>VITE_WEB_BASE_URL</code> to preview the site here.
      </Alert>
    );
  }

  const viewport = DEVICES[device];
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
        // Follows the editor down the page. The whole point of a side-by-side
        // pane is losing it after two scrolls defeats it.
        position: "sticky",
        top: 56,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          px: 1,
          py: 0.5,
          flexShrink: 0,
          borderBottom: "1px solid var(--admin-border)",
        }}
      >
        <Tooltip title="The live site. Unpublished drafts are not shown here.">
          <Typography
            variant="caption"
            sx={{ color: "var(--admin-muted)", flex: 1, minWidth: 0 }}
            noWrap
          >
            Published
          </Typography>
        </Tooltip>

        <ToggleButtonGroup
          size="small"
          exclusive
          value={device}
          onChange={(_event, next) => next && setDevice(next)}
          aria-label="Preview width"
        >
          {Object.entries(DEVICES).map(([key, config]) => (
            <Tooltip
              key={key}
              title={`${config.label} — ${config.width}px wide`}
            >
              <ToggleButton value={key} sx={{ px: 0.75, py: 0.125 }}>
                {config.icon}
              </ToggleButton>
            </Tooltip>
          ))}
        </ToggleButtonGroup>

        <ToggleButtonGroup
          size="small"
          exclusive
          value={locale}
          onChange={(_event, next) => next && setLocale(next)}
          aria-label="Preview language"
          sx={{ ml: 0.5 }}
        >
          <ToggleButton value="en" sx={{ px: 0.75, py: 0.125 }}>
            EN
          </ToggleButton>
          <ToggleButton value="es" sx={{ px: 0.75, py: 0.125 }}>
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

      {/* The measured box. The frame inside is laid out at `viewport.width`
          and then scaled, so the site sees a real browser width. */}
      <Box
        ref={frameRef}
        sx={{
          // Exactly the painted height of the scaled frame — a fixed height or
          // `flex: 1` leaves a band of empty surface under a preview that has
          // already finished drawing.
          height: Math.round(viewport.height * scale),
          maxHeight: "calc(100vh - 140px)",
          overflow: "hidden",
          background: "var(--admin-surface-muted)",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            width: viewport.width,
            height: viewport.height,
            flexShrink: 0,
            transform: `scale(${scale})`,
            transformOrigin: "top center",
            // Scaling shrinks the painted result but not the space it claims,
            // so the wrapper would keep the unscaled height as dead air.
            marginBottom: `${-viewport.height * (1 - scale)}px`,
          }}
        >
          <Box
            component="iframe"
            key={src}
            src={src}
            title="Live site preview"
            // `allow-same-origin` is required, not optional: without it the
            // frame gets an opaque origin and the site's own scripts throw on
            // document.cookie, so the preview renders but never hydrates. It
            // costs nothing — the site is a different origin from the admin,
            // so it still cannot reach into this page. What the sandbox buys
            // is the absence of allow-top-navigation: the framed page cannot
            // navigate the admin out from under whoever is editing.
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            sx={{
              width: "100%",
              height: "100%",
              border: "none",
              display: "block",
              background: "#fff",
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}
