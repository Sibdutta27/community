import { Box, Typography } from "@mui/material";

/**
 * Premium page header — ink title + optional muted description + a
 * right-aligned action (e.g. an "Add" button). Replaces the per-page header
 * markup and fixes the old `color: white` (invisible on light) title bug.
 */
export default function PageHeader({ title, description, action }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        alignItems: { xs: "flex-start", sm: "center" },
        justifyContent: "space-between",
        gap: 2,
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography
          component="h1"
          sx={{
            color: "text.primary",
            fontWeight: 700,
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            fontSize: { xs: "1.6rem", sm: "1.9rem" },
          }}
        >
          {title}
        </Typography>
        {description ? (
          <Typography
            sx={{
              color: "text.secondary",
              mt: 0.5,
              fontSize: "0.92rem",
              lineHeight: 1.5,
              maxWidth: "48rem",
            }}
          >
            {description}
          </Typography>
        ) : null}
      </Box>

      {action ? <Box sx={{ flexShrink: 0 }}>{action}</Box> : null}
    </Box>
  );
}
