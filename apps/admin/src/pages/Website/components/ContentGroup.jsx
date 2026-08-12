import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  Typography,
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import ContentField from "./ContentField";

/**
 * One section of a page — the catalog's second key segment ("hero", "faq").
 *
 * Collapsed by default because the Home page alone has 137 editable strings;
 * rendered flat that is roughly 17,000px of scrolling to reach the footer.
 * Sections turn "find the hero heading" into one click instead of a hunt.
 */
export default function ContentGroup({
  group,
  fields,
  expanded,
  onToggle,
  onSave,
  onRevert,
  saving,
}) {
  const pending = fields.filter(
    (field) => field.override?.draftEn || field.override?.draftEs,
  ).length;

  const edited = fields.filter((field) => field.override?.publishedAt).length;

  return (
    <Accordion
      expanded={expanded}
      onChange={onToggle}
      disableGutters
      elevation={0}
      sx={{
        "&:before": { display: "none" },
        borderTop: "1px solid var(--admin-border)",
      }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ minHeight: 44 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            flex: 1,
            minWidth: 0,
          }}
        >
          <Typography variant="body2" fontWeight={700}>
            {humaniseGroup(group)}
          </Typography>

          <Typography variant="caption" sx={{ color: "var(--admin-muted)" }}>
            {fields.length}
          </Typography>

          {pending > 0 ? (
            <Chip
              size="small"
              color="warning"
              label={`${pending} unpublished`}
            />
          ) : edited > 0 ? (
            <Chip
              size="small"
              variant="outlined"
              color="primary"
              label={`${edited} edited`}
            />
          ) : null}
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{ pt: 0 }}>
        {fields.map((field) => (
          <ContentField
            key={field.keyPath}
            field={field}
            saving={saving}
            onSave={onSave}
            onRevert={onRevert}
          />
        ))}
      </AccordionDetails>
    </Accordion>
  );
}

/** Acronyms the generic camelCase split would mangle into "Faq" / "Cta". */
const GROUP_LABELS = {
  faq: "FAQ",
  dashboardCta: "Dashboard call to action",
  enrollmentCta: "Enrollment call to action",
  cta: "Call to action",
  seo: "SEO",
};

function humaniseGroup(group) {
  if (!group) {
    return "General";
  }

  if (GROUP_LABELS[group]) {
    return GROUP_LABELS[group];
  }

  const spaced = group
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]/g, " ");

  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}
