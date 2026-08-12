import { Box } from "@mui/material";

import PageHeader from "@components/PageHeader/PageHeader";

import RejectedEnrollmentList from "../components/RejectedEnrollmentList/EnrollmentList";

const RejectedEnrollments = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      <PageHeader
        title="Rejected Enrollments"
        description="Applications that were not approved."
      />

      <RejectedEnrollmentList />
    </Box>
  );
};

export default RejectedEnrollments;
