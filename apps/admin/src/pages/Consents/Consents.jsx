import { Link } from "react-router-dom";

import { Box, Button } from "@mui/material";

import AddIcon from "@mui/icons-material/Add";

import PageHeader from "@components/PageHeader/PageHeader";
import SectionNav from "@components/SectionNav/SectionNav";

import { USER_SECTION_ITEMS } from "../Users/sections";

import ConsentList from "./components/ConsentList/ConsentList";

/**
 * The consent CATALOG — which consents the Nation asks for, and at which
 * version. What an individual member agreed to is on their user record.
 *
 * Rendered under the membership section bar so the two stay visibly related:
 * editing the catalog changes what every future member is asked.
 */
const Consents = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      <PageHeader
        title="Consent catalog"
        description="The consents members are asked to accept. Publishing a new version changes what future applicants see."
        action={
          <Button
            variant="contained"
            component={Link}
            to="/consents/create"
            startIcon={<AddIcon />}
          >
            Add Consent
          </Button>
        }
      />

      <SectionNav items={USER_SECTION_ITEMS} />

      <ConsentList />
    </Box>
  );
};

export default Consents;
