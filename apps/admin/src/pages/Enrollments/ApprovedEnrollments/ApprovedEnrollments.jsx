import React from 'react';
import ApprovedEnrollmentList from '../components/ApprovedEnrollmentList/EnrollmentList';

import {
    Box,
    Typography,
} from '@mui/material';

import styles from './approvedEnrollments.module.css';

const ApprovedEnrollments = () => {
    return (
        <section className={styles.page}>
            <Box className={styles.header}>
                <Typography
                    variant="h4"
                    className={styles.title}
                >
                    Approved Enrollments
                </Typography>
            </Box>

            <ApprovedEnrollmentList />
        </section>
    );
};

export default ApprovedEnrollments;