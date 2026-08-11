import { Link } from "react-router-dom";

import { Box, Button } from "@mui/material";

import AddIcon from "@mui/icons-material/Add";

import PageHeader from "@components/PageHeader/PageHeader";
import SectionNav from "@components/SectionNav/SectionNav";

import EventCategoryList from "./components/EventCategoryList.jsx/EventCategoryList";

import { EVENT_SECTION_ITEMS } from "../Events/sections";

/**
 * Event categories — the same surface as Events, one tab over, so staff
 * setting up a new event never have to go hunting for where categories live.
 */
const EventCategories = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
      <PageHeader
        title="Event Categories"
        description="How events are grouped for members. Every event belongs to one."
        action={
          <Button
            variant="contained"
            component={Link}
            to="/event-categories/create"
            startIcon={<AddIcon />}
          >
            Add Category
          </Button>
        }
      />

      <SectionNav items={EVENT_SECTION_ITEMS} />

      <EventCategoryList />
    </Box>
  );
};

export default EventCategories;
