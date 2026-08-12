import { Box, Typography } from "@mui/material";

/**
 * Page header — title, optional one-line description, optional right-aligned
 * action.
 *
 * The title used to be set at ~1.9rem with a 1.5-line description under it,
 * which cost ~90px before any data appeared. A back office is not a landing
 * page: staff know what screen they opened. The title is now a firm 1.15rem
 * and the description sits on the SAME line on wide viewports, so the whole
 * block is one ~28px row.
 */
export default function PageHeader({ title, description, action }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        alignItems: { xs: "flex-start", sm: "center" },
        justifyContent: "space-between",
        gap: { xs: 1, sm: 2 },
      }}
    >
      <Box
        sx={{
          minWidth: 0,
          display: "flex",
          flexDirection: { xs: "column", lg: "row" },
          alignItems: { xs: "flex-start", lg: "baseline" },
          gap: { xs: 0.25, lg: 1.5 },
        }}
      >
        <Typography
          component="h1"
          sx={{
            flexShrink: 0,
            color: "text.primary",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
            fontSize: "1.15rem",
          }}
        >
          {title}
        </Typography>

        {description ? (
          <Typography
            sx={{
              color: "text.secondary",
              fontSize: "0.78rem",
              lineHeight: 1.4,
              maxWidth: "46rem",
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
