import { Box } from "@mui/material";

import PageHeader from "@components/PageHeader/PageHeader";

import ApprovedEnrollmentList from "../components/ApprovedEnrollmentList/EnrollmentList";

const ApprovedEnrollments = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      <PageHeader
        title="Approved Enrollments"
        description="Applications that were approved. These members are enrolled."
      />

      <ApprovedEnrollmentList />
    </Box>
  );
};

export default ApprovedEnrollments;
