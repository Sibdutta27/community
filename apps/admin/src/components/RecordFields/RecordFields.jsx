import { Box, Typography } from "@mui/material";

/**
 * A dense read-only record sheet.
 *
 * The enrollment review screens used to draw every single fact as a 54px-tall
 * bordered, tinted, hover-reactive box — a control that looks editable but
 * isn't. Fourteen facts about an applicant cost roughly 1,600px of scrolling,
 * and the shapes shouted louder than the values inside them.
 *
 * This is the registrar's version: label above value, hairline rules to keep
 * the columns readable, no boxes. Same information, roughly a third of the
 * height, and nothing pretends to be an input.
 *
 * `<Facts>` lays out `<Fact>` children in a responsive column grid.
 */
export function Facts({ columns = 3, children }) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, minmax(0, 1fr))",
          lg: `repeat(${columns}, minmax(0, 1fr))`,
        },
        columnGap: 3,
      }}
    >
      {children}
    </Box>
  );
}

/**
 * One label/value pair. An absent value renders as an em dash rather than
 * collapsing, so a gap in an application stays visible to the reviewer.
 */
export function Fact({ label, value, icon }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 0.125,

        py: 0.75,
        borderBottom: "1px solid",
        borderColor: "divider",
        minWidth: 0,
      }}
    >
      <Typography
        component="dt"
        sx={{
          fontSize: "0.65rem",
          fontWeight: 600,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          color: "text.secondary",
          lineHeight: 1.4,
        }}
      >
        {label}
      </Typography>

      <Box
        sx={{ display: "flex", alignItems: "center", gap: 0.75, minWidth: 0 }}
      >
        {icon ? (
          <Box
            sx={{
              flexShrink: 0,
              display: "flex",
              color: "text.secondary",
              "& svg": { fontSize: "0.9rem" },
            }}
          >
            {icon}
          </Box>
        ) : null}

        <Typography
          component="dd"
          sx={{
            margin: 0,
            fontSize: "0.85rem",
            fontWeight: 500,
            color: value ? "text.primary" : "text.secondary",
            lineHeight: 1.4,
            wordBreak: "break-word",
          }}
        >
          {value || "—"}
        </Typography>
      </Box>
    </Box>
  );
}
