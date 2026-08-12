import { Chip } from "@mui/material";

import { formatWords } from "@/utils/formatWord.util";

/**
 * The enrollment status, as one small chip.
 *
 * Each of the four enrollment lists had its own copy of a nested ternary over
 * four CSS-module classes, and those classes set light text on a light tint
 * (#22c55e on rgba(34,197,94,.15), #9ca3af on near-white) — a hangover from the
 * old dark theme that does not pass contrast on this light one. One component,
 * darker inks, and a fixed column width so "Approved" stops wrapping onto two
 * lines.
 */
const TONES = {
  APPROVED: {
    color: "#166534",
    bg: "rgba(31,157,87,0.12)",
    border: "rgba(31,157,87,0.35)",
  },
  REJECTED: {
    color: "#8c1d18",
    bg: "rgba(179,38,30,0.10)",
    border: "rgba(179,38,30,0.32)",
  },
  SUBMITTED: {
    color: "#0a56a8",
    bg: "rgba(10,86,168,0.10)",
    border: "rgba(10,86,168,0.30)",
  },
  DRAFT: {
    color: "#4b5563",
    bg: "rgba(90,100,114,0.10)",
    border: "rgba(90,100,114,0.28)",
  },
};

export default function StatusChip({ status }) {
  const tone = TONES[status] || TONES.DRAFT;

  return (
    <Chip
      label={formatWords(status)}
      sx={{
        color: tone.color,
        backgroundColor: tone.bg,
        border: `1px solid ${tone.border}`,
      }}
    />
  );
}
