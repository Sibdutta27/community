import React from "react";
import FeedbackList from "./components/FeedbackList/FeedbackList";

import { Box, Typography } from "@mui/material";

import styles from "./feedback.module.css";

/**
 * Feedback page — the staff-facing view of the in-app suggestions box.
 */
const Feedback = () => {
  return (
    <section className={styles.page}>
      <Box className={styles.header}>
        <Box>
          <Typography variant="h4" className={styles.title}>
            Feedback
          </Typography>

          <Typography variant="body2" className={styles.subtitle}>
            Reports and suggestions sent from the in-app feedback widget. Open
            one to read it in full and set where it stands.
          </Typography>
        </Box>
      </Box>

      <FeedbackList />
    </section>
  );
};

export default Feedback;
