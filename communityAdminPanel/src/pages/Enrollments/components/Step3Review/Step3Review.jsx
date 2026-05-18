// EnrollmentStep3Review.jsx

import styles from './step3Review.module.css';

import { useQuery } from '@tanstack/react-query';

import {
    Alert,
    Paper,
    Skeleton,
    Typography,
} from '@mui/material';

import { fetchEnrollmentStep3 } from '@/api/enrollment.api';


export default function EnrollmentStep3Review({
    enrollmentId,
}) {

    const {
        data,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['admin-enrollment-step3', enrollmentId],
        queryFn: () => fetchEnrollmentStep3(enrollmentId)
    });

    /**
     * Loading
     */
    if (isLoading) {
        return (
            <div className={styles.loadingGrid}>

                {[1, 2, 3, 4].map((item) => (
                    <Paper
                        key={item}
                        className={styles.card}
                    >

                        <Skeleton
                            variant="circular"
                            width={60}
                            height={60}
                        />

                        <Skeleton
                            variant="text"
                            width="70%"
                            height={35}
                        />

                        <Skeleton
                            variant="text"
                            width="100%"
                            height={20}
                        />

                        <Skeleton
                            variant="text"
                            width="85%"
                            height={20}
                        />

                    </Paper>
                ))}

            </div>
        );
    }

    /**
     * Error
     */
    if (error) {
        return (
            <Alert severity="error">
                Failed to load cultural connections
            </Alert>
        );
    }

    return (
        <div className={styles.container}>

            {/* CONNECTIONS */}
            <div className={styles.grid}>

                {
                    data.map((item) => (

                        <Paper
                            key={item.key}
                            className={styles.card}
                        >

                            {/* KEY */}
                            <div className={styles.keyBox}>

                                <Typography
                                    className={styles.keyText}
                                >
                                    {item.describtion}
                                </Typography>

                            </div>
                        </Paper>

                    ))
                }

            </div>

        </div>
    );
}