import React from 'react';
import EnrollmentList from './components/EnrollmentList/EnrollmentList';

import {
    Box,
    Typography,
} from '@mui/material';

import styles from './enrollments.module.css';

const Enrollments = () => {
    return (
        <section className={styles.page}>
            <Box className={styles.header}>
                <Typography
                    variant="h4"
                    className={styles.title}
                >
                    Enrollments
                </Typography>
            </Box>

            <EnrollmentList />
        </section>
    );
};

export default Enrollments;