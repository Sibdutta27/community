import { Link } from "react-router-dom";

import { Box, Button } from "@mui/material";

import AddIcon from "@mui/icons-material/Add";

import PageHeader from "@components/PageHeader/PageHeader";
import SectionNav from "@components/SectionNav/SectionNav";

import ServiceList from "./components/ServiceList/ServiceList";

import { SERVICE_SECTION_ITEMS } from "./sections";

/**
 * The programs surface.
 *
 * "Services" is what the data model calls them; staff call them programs, so
 * the copy says programs and the routes stay `/services`.
 */
const Services = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
      <PageHeader
        title="Programs"
        description="Services and programs members can register for. Only active programs accept registrations."
        action={
          <Button
            variant="contained"
            component={Link}
            to="/services/create"
            startIcon={<AddIcon />}
          >
            Add Program
          </Button>
        }
      />

      <SectionNav items={SERVICE_SECTION_ITEMS} />

      <ServiceList />
    </Box>
  );
};

export default Services;
