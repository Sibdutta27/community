import { Box } from "@mui/material";

import PageHeader from "@components/PageHeader/PageHeader";

import EnrollmentList from "./components/EnrollmentList/EnrollmentList";

const Enrollments = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      <PageHeader
        title="Enrollments"
        description="Every application, at any stage. Use the status tabs to narrow the list."
      />

      <EnrollmentList />
    </Box>
  );
};

export default Enrollments;
