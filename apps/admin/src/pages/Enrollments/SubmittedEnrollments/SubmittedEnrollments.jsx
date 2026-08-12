import { Box } from "@mui/material";

import PageHeader from "@components/PageHeader/PageHeader";

import SubmittedEnrollmentsList from "../components/SubmittedEnrollmentList/EnrollmentList";

const SubmittedEnrollments = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      <PageHeader
        title="Submitted Enrollments"
        description="Applications waiting for a decision. Open one to review it step by step."
      />

      <SubmittedEnrollmentsList />
    </Box>
  );
};

export default SubmittedEnrollments;
