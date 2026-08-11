import { useState } from "react";
import { Link, useParams } from "react-router-dom";

import { Box, Button, Typography } from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import GroupsIcon from "@mui/icons-material/Groups";

import { toast } from "react-toastify";

import PageHeader from "@components/PageHeader/PageHeader";
import Panel, { SectionHeader } from "@components/Panel/Panel";
import RegistrantsTable from "@components/Registrants/RegistrantsTable";

import { fetchEventRegistrationsCsv } from "@/api/event.api";
import { downloadTextFile, filenameSlug } from "@/utils/downloadFile.util";

import { useEvent, useEventRegistrations } from "./hooks";

/**
 * Who registered for one event.
 *
 * The list rows only show the headline number; this is where staff read the
 * actual names — and take them away as a CSV for the door.
 */
const EventRegistrations = () => {
  const { id } = useParams();

  const { data: event } = useEvent(id);

  const [exporting, setExporting] = useState(false);

  const registered = event?._count?.registrations ?? 0;
  const capacity = event?.maxCapacity || null;

  const handleExport = async () => {
    setExporting(true);

    try {
      const csv = await fetchEventRegistrationsCsv(id);

      downloadTextFile(
        csv,
        `${filenameSlug(event?.title || "event")}-registrations.csv`,
      );

      toast.success("Registrant list downloaded.");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Could not export the registrant list",
      );
    } finally {
      setExporting(false);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
      <Button
        component={Link}
        to="/events"
        startIcon={<ArrowBackIcon />}
        sx={{ alignSelf: "flex-start", color: "text.secondary" }}
      >
        Back to events
      </Button>

      <PageHeader
        title={event?.title || "Registrants"}
        description="Everyone who signed up for this event, newest first."
        action={
          <Button
            component={Link}
            to={`/events/edit/${id}`}
            variant="outlined"
            startIcon={<EditIcon />}
          >
            Edit event
          </Button>
        }
      />

      <Panel padding="compact">
        <SectionHeader
          icon={<GroupsIcon />}
          title={
            capacity
              ? `${registered} of ${capacity} places taken`
              : `${registered} registered`
          }
          description={
            event?.startDateTime
              ? `Starts ${new Date(event.startDateTime).toLocaleString()}`
              : "Uptake for this event"
          }
        />
      </Panel>

      <RegistrantsTable
        id={id}
        useRegistrants={useEventRegistrations}
        onExport={handleExport}
        exporting={exporting}
      />
    </Box>
  );
};

export default EventRegistrations;
