import { Box, Paper, Typography } from "@mui/material";

const paddingMap = {
  none: 0,
  compact: { xs: 2.5, sm: 3 },
  roomy: { xs: 3, sm: 4, lg: 5 },
};

/**
 * Elevated white surface card — the admin equivalent of apps/web's SurfaceCard.
 * Hairline border + rounded-2xl + soft layered ink shadow (from the MUI Paper
 * theme override); `tone="elevated"` uses the deeper hero shadow.
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
        borderRadius: "16px",
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
    <Box sx={{ display: "flex", gap: 1.75, alignItems: "flex-start" }}>
      {icon ? (
        <Box
          sx={{
            width: 48,
            height: 48,
            flexShrink: 0,
            borderRadius: "12px",
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "var(--admin-surface-muted)",
            color: "text.primary",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </Box>
      ) : null}

      <Box sx={{ minWidth: 0, pt: 0.25 }}>
        <Typography
          sx={{
            fontWeight: 600,
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
            color: "text.primary",
            fontSize: { xs: "1.05rem", sm: "1.15rem" },
          }}
        >
          {title}
        </Typography>
        {description ? (
          <Typography
            sx={{
              mt: 0.5,
              color: "text.secondary",
              lineHeight: 1.4,
              fontSize: { xs: "0.8rem", sm: "0.86rem" },
            }}
          >
            {description}
          </Typography>
        ) : null}
      </Box>
    </Box>
  );
}
