import { Link } from "react-router-dom";

import { Box, Typography } from "@mui/material";

/**
 * A single figure from the register.
 *
 * Deliberately quiet: a number, what it counts, and — when the figure implies
 * work — where to go and do it. The previous version was a 22px-padded,
 * 22px-radius card under a 45px shadow, which spent more pixels on the
 * container than on the number.
 *
 * Passing `to` makes the whole tile the link, so the actionable figure
 * (applications awaiting review) is one click from the count itself.
 */
export default function StatCard({
  title,
  value,
  helper,
  to,
  emphasis = false,
}) {
  const content = (
    <>
      <Typography
        variant="caption"
        sx={{
          color: "var(--admin-muted)",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}
      >
        {title}
      </Typography>

      <Typography
        sx={{
          fontSize: 26,
          fontWeight: 700,
          lineHeight: 1.15,
          mt: 0.25,
          color: emphasis && value > 0 ? "primary.main" : "var(--admin-text)",
        }}
      >
        {value}
      </Typography>

      {helper ? (
        <Typography variant="caption" sx={{ color: "var(--admin-muted)" }}>
          {helper}
        </Typography>
      ) : null}
    </>
  );

  return (
    <Box
      {...(to ? { component: Link, to } : {})}
      sx={{
        display: "block",
        p: 1.5,
        borderRadius: "10px",
        border: "1px solid var(--admin-border)",
        background: "#fff",
        boxShadow: "var(--admin-shadow-soft)",
        textDecoration: "none",
        transition: "border-color 120ms ease",
        ...(to && {
          "&:hover": { borderColor: "var(--admin-primary)" },
        }),
      }}
    >
      {content}
    </Box>
  );
}
