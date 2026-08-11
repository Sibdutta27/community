import { Link, useSearchParams } from "react-router-dom";

import { Box, Button } from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ViewListIcon from "@mui/icons-material/ViewList";

import PageHeader from "@components/PageHeader/PageHeader";
import SectionNav, { ViewToggle } from "@components/SectionNav/SectionNav";

import EventList from "./components/EventList.jsx/EventList";
import EventCalendar from "./components/EventCalendar/EventCalendar";

import { EVENT_SECTION_ITEMS } from "./sections";

/**
 * The events surface.
 *
 * The calendar is the primary view — staff think about events by date. The
 * table stays as an alternate view rather than being deleted: a calendar is
 * bad for bulk scanning, searching and comparing fields, and that is exactly
 * what the table is good at.
 *
 * The choice lives in `?view=` so a view can be linked and survives a reload.
 */
const VIEW_OPTIONS = [
  {
    value: "calendar",
    label: "Calendar",
    icon: <CalendarMonthIcon sx={{ fontSize: "1rem" }} />,
  },
  {
    value: "list",
    label: "List",
    icon: <ViewListIcon sx={{ fontSize: "1rem" }} />,
  },
];

const Events = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const view = searchParams.get("view") === "list" ? "list" : "calendar";

  const setView = (next) => {
    const params = new URLSearchParams(searchParams);

    params.set("view", next);

    setSearchParams(params, { replace: true });
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
      <PageHeader
        title="Events"
        description="Gatherings, ceremonies and meetings members can register for."
        action={
          <Button
            variant="contained"
            component={Link}
            to="/events/create"
            startIcon={<AddIcon />}
          >
            Add Event
          </Button>
        }
      />

      <SectionNav items={EVENT_SECTION_ITEMS} />

      <ViewToggle
        ariaLabel="Event view"
        value={view}
        onChange={setView}
        options={VIEW_OPTIONS}
      />

      {view === "calendar" ? <EventCalendar /> : <EventList />}
    </Box>
  );
};

export default Events;
