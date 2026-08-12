import { Box, Typography } from "@mui/material";

import PageHeader from "@components/PageHeader/PageHeader";
import Panel from "@components/Panel/Panel";
import SectionNav from "@components/SectionNav/SectionNav";

import { WEBSITE_SECTION_ITEMS } from "../sections";

/**
 * Placeholder shell. The tab exists so the Studio's navigation is complete and
 * honest about what is coming; the surface itself lands next.
 */
export default function WebsiteYucayeke() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      <PageHeader title="Website Studio" description="Yukayeke." />

      <SectionNav items={WEBSITE_SECTION_ITEMS} />

      <Panel>
        <Typography variant="body2" color="text.secondary">
          Coming shortly.
        </Typography>
      </Panel>
    </Box>
  );
}
