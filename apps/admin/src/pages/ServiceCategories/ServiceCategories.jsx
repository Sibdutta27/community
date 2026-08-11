import { Link } from "react-router-dom";

import { Box, Button } from "@mui/material";

import AddIcon from "@mui/icons-material/Add";

import PageHeader from "@components/PageHeader/PageHeader";
import SectionNav from "@components/SectionNav/SectionNav";

import ServiceCategoryList from "./components/ServiceCategoryList.jsx/ServiceCategoryList";

import { SERVICE_SECTION_ITEMS } from "../Services/sections";

/**
 * Program categories — the same surface as Programs, one tab over, so staff
 * setting up a new program never have to go hunting for where categories live.
 */
const ServiceCategories = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
      <PageHeader
        title="Program Categories"
        description="How programs are grouped for members. Every program belongs to one."
        action={
          <Button
            variant="contained"
            component={Link}
            to="/service-categories/create"
            startIcon={<AddIcon />}
          >
            Add Category
          </Button>
        }
      />

      <SectionNav items={SERVICE_SECTION_ITEMS} />

      <ServiceCategoryList />
    </Box>
  );
};

export default ServiceCategories;
