import { Box, Paper, Typography } from "@mui/material";

const paddingMap = {
  none: 0,
  compact: { xs: 1.5, sm: 2 },
  roomy: { xs: 2, sm: 2.5 },
};

/**
 * White surface card. Hairline border, small radius, near-flat elevation — the
 * container should be barely visible so the records inside it read first.
 *
 * The padding scale used to top out at 40px per side; a card that spends 80px
 * of its width on air is why the app felt oversized.
 */
export default function Panel({
  children,
  padding = "compact",
  tone = "soft",
  sx,
  ...rest
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: "10px",
        boxShadow:
          tone === "elevated"
            ? "var(--admin-shadow-card)"
            : "var(--admin-shadow-soft)",
        p: paddingMap[padding],
        ...sx,
      }}
      {...rest}
    >
      {children}
    </Paper>
  );
}

/**
 * Quiet section header — small neutral icon tile + title + muted description,
 * matching the member app's SectionHeader.
 */
export function SectionHeader({ icon, title, description }) {
  return (
    <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
      {icon ? (
        <Box
          sx={{
            flexShrink: 0,
            color: "text.secondary",
            display: "flex",
            alignItems: "center",
            "& svg": { fontSize: "1.05rem" },
          }}
        >
          {icon}
        </Box>
      ) : null}

      <Box
        sx={{
          minWidth: 0,
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "flex-start", sm: "baseline" },
          gap: { xs: 0, sm: 1 },
        }}
      >
        <Typography
          sx={{
            flexShrink: 0,
            fontWeight: 700,
            letterSpacing: "-0.01em",
            lineHeight: 1.3,
            color: "text.primary",
            fontSize: "0.9rem",
          }}
        >
          {title}
        </Typography>
        {description ? (
          <Typography
            sx={{
              color: "text.secondary",
              lineHeight: 1.4,
              fontSize: "0.75rem",
            }}
          >
            {description}
          </Typography>
        ) : null}
      </Box>
    </Box>
  );
}
