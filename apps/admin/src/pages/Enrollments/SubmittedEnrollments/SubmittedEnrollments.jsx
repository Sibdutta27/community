import React from 'react';
import SubmittedEnrollmentsList from '../components/SubmittedEnrollmentList/EnrollmentList';

import {
    Box,
    Typography,
} from '@mui/material';

import styles from './submittedEnrollments.module.css';

const SubmittedEnrollments = () => {
    return (
        <section className={styles.page}>
            <Box className={styles.header}>
                <Typography
                    variant="h4"
                    className={styles.title}
                >
                    Submitted Enrollments
                </Typography>
            </Box>

            <SubmittedEnrollmentsList />
        </section>
    );
};

export default SubmittedEnrollments;