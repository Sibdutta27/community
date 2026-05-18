import React from 'react';
import RejectedEnrollmentList from '../components/RejectedEnrollmentList/EnrollmentList';

import {
    Box,
    Typography,
} from '@mui/material';

import styles from './rejectedEnrollments.module.css';

const RejectedEnrollments = () => {
    return (
        <section className={styles.page}>
            <Box className={styles.header}>
                <Typography
                    variant="h4"
                    className={styles.title}
                >
                    Rejected Enrollments
                </Typography>
            </Box>

            <RejectedEnrollmentList />
        </section>
    );
};

export default RejectedEnrollments;