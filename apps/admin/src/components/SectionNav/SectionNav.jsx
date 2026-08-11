import { NavLink } from "react-router-dom";

import { Box } from "@mui/material";

/**
 * Slender flush section bar with underline-style active markers.
 *
 * This is the member app's navbar paradigm reproduced natively in MUI: a
 * document tab rather than a button — no pill, no lift, no ambient shadow.
 * The active item carries a short azul rule on the bar's baseline; inactive
 * items reveal a muted one on hover. Restraint is the point; this is
 * record-keeping chrome, not an app toolbar.
 *
 * Two flavours share one set of styles so they can never drift apart:
 *   - `SectionNav`   — route links (Programs | Categories)
 *   - `ViewToggle`   — a local value switch (Calendar | List)
 */

/** The bar itself: full-bleed hairline baseline, nothing else. */
const barSx = {
  display: "flex",
  alignItems: "flex-end",
  gap: 0.5,

  borderBottom: "1px solid",
  borderColor: "divider",

  overflowX: "auto",

  // The rule is the bar; hide the scrollbar that would sit on top of it.
  scrollbarWidth: "none",
  "&::-webkit-scrollbar": { display: "none" },
};

/**
 * One tab. The marker is an `::after` rule pinned to the bar's baseline, so
 * the label never shifts between states.
 */
function itemSx(isActive) {
  return {
    position: "relative",

    flexShrink: 0,

    px: 1.75,
    pt: 1,
    pb: 1.25,

    border: 0,
    background: "none",
    cursor: "pointer",

    fontFamily: "inherit",
    fontSize: "0.86rem",
    fontWeight: 600,
    letterSpacing: "-0.01em",
    lineHeight: 1.2,
    whiteSpace: "nowrap",
    textDecoration: "none",

    color: isActive ? "primary.main" : "text.secondary",

    transition: "color 200ms",

    "&:hover": {
      color: isActive ? "primary.main" : "text.primary",
    },

    "&:focus-visible": {
      outline: "2px solid",
      outlineColor: "primary.main",
      outlineOffset: -2,
      borderRadius: "4px",
    },

    "&::after": {
      content: '""',
      position: "absolute",
      insetInline: "0.6rem",
      bottom: "-1px",
      height: "2px",
      borderRadius: "999px",

      backgroundColor: isActive
        ? "var(--admin-primary)"
        : "rgba(10, 86, 168, 0.35)",

      opacity: isActive ? 1 : 0,
      transition: "opacity 200ms",
    },

    "&:hover::after": { opacity: 1 },

    "@media (prefers-reduced-motion: reduce)": {
      transition: "none",
      "&::after": { transition: "none" },
    },
  };
}

/**
 * Route-level section bar.
 *
 * `items` is `[{ label, to, end }]`. `end` marks a link that should only be
 * active on an exact match (the section's own index route).
 */
export default function SectionNav({ items, action }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: 2,
      }}
    >
      <Box component="nav" sx={{ ...barSx, flex: 1, minWidth: 0 }}>
        {items.map((item) => (
          <Box
            key={item.to}
            component={NavLink}
            to={item.to}
            end={item.end}
            sx={({ palette }) => ({
              ...itemSx(false),
              "&.active": {
                color: palette.primary.main,
                "&::after": {
                  backgroundColor: "var(--admin-primary)",
                  opacity: 1,
                },
              },
            })}
          >
            {item.label}
          </Box>
        ))}
      </Box>

      {action ? <Box sx={{ flexShrink: 0, pb: 0.5 }}>{action}</Box> : null}
    </Box>
  );
}

/**
 * Local view switch drawn with the same marker — used where the choice is a
 * rendering mode rather than a route (the events calendar vs table).
 */
export function ViewToggle({ value, onChange, options, ariaLabel }) {
  return (
    <Box role="tablist" aria-label={ariaLabel} sx={barSx}>
      {options.map((option) => {
        const isActive = option.value === value;

        return (
          <Box
            key={option.value}
            component="button"
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(option.value)}
            sx={{
              ...itemSx(isActive),
              display: "inline-flex",
              alignItems: "center",
              gap: 0.75,
            }}
          >
            {option.icon}
            {option.label}
          </Box>
        );
      })}
    </Box>
  );
}
