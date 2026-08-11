import { useState } from "react";
import { Link, useParams } from "react-router-dom";

import { Box, Button } from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import GroupsIcon from "@mui/icons-material/Groups";

import { toast } from "react-toastify";

import PageHeader from "@components/PageHeader/PageHeader";
import Panel, { SectionHeader } from "@components/Panel/Panel";
import RegistrantsTable from "@components/Registrants/RegistrantsTable";

import { fetchServiceRegistrationsCsv } from "@/api/service.api";
import { downloadTextFile, filenameSlug } from "@/utils/downloadFile.util";
import { serviceStatusLabel } from "../serviceStatus.util";

import { useService, useServiceRegistrations } from "./hooks";

/**
 * Who registered for one program.
 *
 * Programs carry a per-registration status, so the roster shows it — a person
 * who registered and a person who was placed are not the same thing.
 */
const ServiceRegistrations = () => {
  const { id } = useParams();

  const { data: service } = useService(id);

  const [exporting, setExporting] = useState(false);

  const registered = service?._count?.registrations ?? 0;

  const handleExport = async () => {
    setExporting(true);

    try {
      const csv = await fetchServiceRegistrationsCsv(id);

      downloadTextFile(
        csv,
        `${filenameSlug(service?.name || "program")}-registrations.csv`,
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
        to="/services"
        startIcon={<ArrowBackIcon />}
        sx={{ alignSelf: "flex-start", color: "text.secondary" }}
      >
        Back to programs
      </Button>

      <PageHeader
        title={service?.name || "Registrants"}
        description="Everyone who signed up for this program, newest first."
        action={
          <Button
            component={Link}
            to={`/services/edit/${id}`}
            variant="outlined"
            startIcon={<EditIcon />}
          >
            Edit program
          </Button>
        }
      />

      <Panel padding="compact">
        <SectionHeader
          icon={<GroupsIcon />}
          title={`${registered} registered`}
          description={
            service?.status
              ? `This program is ${serviceStatusLabel(service.status).toLowerCase()}.`
              : "Uptake for this program"
          }
        />
      </Panel>

      <RegistrantsTable
        id={id}
        useRegistrants={useServiceRegistrations}
        showStatus
        onExport={handleExport}
        exporting={exporting}
      />
    </Box>
  );
};

export default ServiceRegistrations;
