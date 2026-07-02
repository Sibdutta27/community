// EnrollmentSignatureReview.jsx

import styles from './signatureReview.module.css';

import { useQuery } from '@tanstack/react-query';

import {
    Alert,
    Chip,
    Paper,
    Skeleton,
    Typography,
} from '@mui/material';

import {
    Cancel,
    Draw,
    Verified,
} from '@mui/icons-material';

import { fetchEnrollmentStep1 } from '@/api/enrollment.api';

export default function EnrollmentSignatureReview({
    enrollmentId,
}) {

    const {
        data,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['admin-enrollment-step1', enrollmentId],
        queryFn: () => fetchEnrollmentStep1(enrollmentId)
    });

    /**
     * Loading UI
     */
    if (isLoading) {
        return (
            <Paper className={styles.card}>

                <Skeleton
                    variant="text"
                    width={260}
                    height={40}
                />

                <div className={styles.formGrid}>

                    {[1, 2, 3].map((field) => (
                        <div key={field}>
                            <Skeleton
                                variant="text"
                                width={120}
                                height={20}
                            />

                            <Skeleton
                                variant="rounded"
                                height={54}
                            />
                        </div>
                    ))}

                </div>

            </Paper>
        );
    }

    /**
     * Error UI
     */
    if (error) {
        return (
            <Alert severity="error">
                Failed to load e-signature data
            </Alert>
        );
    }

    const signature = data?.signature;

    return (
        <Paper className={styles.card}>

            {/* HEADER */}
            <div className={styles.cardTop}>

                <Draw className={styles.cardIcon} />

                <div>

                    <Typography className={styles.cardTitle}>
                        E-signature / Confirmation
                    </Typography>

                    <Typography
                        className={styles.cardSubTitle}
                    >
                        Submission confirmation details
                    </Typography>

                </div>

            </div>

            {/* FIELDS */}
            <div className={styles.formGrid}>

                <InfoItem
                    label="Signature Name"
                    value={signature?.signatureName}
                />

                <InfoItem
                    label="Signature Date"
                    value={
                        signature?.signatureDate
                            ? new Date(
                                signature.signatureDate,
                            ).toLocaleDateString()
                            : null
                    }
                />

                <div className={styles.fieldGroup}>

                    <Typography className={styles.fieldLabel}>
                        Agreed to Terms
                    </Typography>

                    <div className={styles.fieldBox}>

                        {
                            signature?.agreedToTerms ? (
                                <Chip
                                    icon={<Verified />}
                                    label="Agreed"
                                    className={
                                        styles.agreedChip
                                    }
                                />
                            ) : (
                                <Chip
                                    icon={<Cancel />}
                                    label="Not Agreed"
                                    className={
                                        styles.notAgreedChip
                                    }
                                />
                            )
                        }

                    </div>

                </div>

            </div>

        </Paper>
    );
}

/**
 * Info Item
 */
function InfoItem({
    label,
    value,
}) {

    return (
        <div className={styles.fieldGroup}>

            <Typography className={styles.fieldLabel}>
                {label}
            </Typography>

            <div className={styles.fieldBox}>

                <Typography className={styles.fieldValue}>
                    {value || '-'}
                </Typography>

            </div>

        </div>
    );
}
