// EnrollmentStep2Review.jsx

import styles from './step2Review.module.css';

import { useQuery } from '@tanstack/react-query';

import {
    Alert,
    Chip,
    Paper,
    Skeleton,
    Typography,
} from '@mui/material';

import {
    FamilyRestroom,
    LocationOn,
    Person,
    Work,
    CalendarMonth,
    Notes,
} from '@mui/icons-material';

import { fetchEnrollmentStep2 } from '@/api/enrollment.api';

const RELATION_ORDER = {
    MOTHER: 1,
    GRANDMOTHER: 2,
    GREAT_GRANDMOTHER: 3,
    GREAT_GREAT_GRANDMOTHER: 4,
    GREAT_GREAT_GREAT_GRANDMOTHER: 5,
};

export default function EnrollmentStep2Review({
    enrollmentId,
}) {

    const {
        data,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['admin-enrollment-step2', enrollmentId],
        queryFn: () => fetchEnrollmentStep2(enrollmentId)
    });

    /**
     * Loading
     */
    if (isLoading) {
        return (
            <div className={styles.loadingContainer}>

                {[1, 2, 3].map((item) => (
                    <Paper
                        key={item}
                        className={styles.lineageCard}
                    >
                        <Skeleton
                            variant="text"
                            width={200}
                            height={40}
                        />

                        <div className={styles.grid}>
                            {[1, 2, 3, 4].map((field) => (
                                <div key={field}>
                                    <Skeleton
                                        variant="text"
                                        width={120}
                                        height={18}
                                    />

                                    <Skeleton
                                        variant="rounded"
                                        height={54}
                                    />
                                </div>
                            ))}
                        </div>

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
                Failed to load maternal lineage data
            </Alert>
        );
    }

    /**
     * Sort lineage
     */
    const sortedLineages = [...data].sort(
        (a, b) =>
            RELATION_ORDER[a.relation]
            - RELATION_ORDER[b.relation],
    );

    return (
        <div className={styles.container}>

            {
                sortedLineages.map((lineage) => (

                    <Paper
                        key={lineage.id}
                        className={styles.lineageCard}
                    >

                        {/* HEADER */}
                        <div className={styles.cardHeader}>

                            <div className={styles.headerLeft}>

                                <div className={styles.iconBox}>
                                    <FamilyRestroom />
                                </div>

                                <div>

                                    <Typography
                                        className={styles.relation}
                                    >
                                        {
                                            lineage.relation
                                                .replaceAll('_', ' ')
                                        }
                                    </Typography>

                                    <Typography
                                        className={styles.fullName}
                                    >
                                        {lineage.fullName}
                                    </Typography>

                                </div>

                            </div>

                            <Chip
                                label={lineage.livingStatus}
                                className={
                                    lineage.livingStatus === 'LIVING'
                                        ? styles.livingChip
                                        : styles.deceasedChip
                                }
                            />

                        </div>

                        {/* BODY */}
                        <div className={styles.grid}>

                            <InfoItem
                                icon={<Person />}
                                label="Maiden Name"
                                value={lineage.maidenName}
                            />

                            <InfoItem
                                icon={<CalendarMonth />}
                                label="Birth Year"
                                value={
                                    lineage.approximateBirthYear
                                }
                            />

                            <InfoItem
                                icon={<LocationOn />}
                                label="Place of Birth"
                                value={lineage.placeOfBirth}
                            />

                            <InfoItem
                                icon={<LocationOn />}
                                label="Region of Origin"
                                value={lineage.regionOfOrigin}
                            />

                            <InfoItem
                                icon={<Work />}
                                label="Family Occupation"
                                value={lineage.familyOccupation}
                            />

                            <InfoItem
                                icon={<CalendarMonth />}
                                label="Date of Birth"
                                value={
                                    lineage.dateOfBirth
                                        ? new Date(
                                            lineage.dateOfBirth,
                                        ).toLocaleDateString()
                                        : '-'
                                }
                            />

                        </div>

                        {/* NOTES */}
                        {
                            lineage.additionalNotes && (
                                <div className={styles.notesSection}>

                                    <div className={styles.notesHeader}>

                                        <Notes />

                                        <Typography>
                                            Additional Notes
                                        </Typography>

                                    </div>

                                    <div className={styles.notesBox}>
                                        <Typography>
                                            {lineage.additionalNotes}
                                        </Typography>
                                    </div>

                                </div>
                            )
                        }

                    </Paper>

                ))
            }

        </div>
    );
}

/**
 * Info Item
 */
function InfoItem({
    icon,
    label,
    value,
}) {

    return (
        <div className={styles.fieldGroup}>

            <Typography className={styles.fieldLabel}>
                {label}
            </Typography>

            <div className={styles.fieldBox}>

                <div className={styles.fieldIcon}>
                    {icon}
                </div>

                <Typography className={styles.fieldValue}>
                    {value || '-'}
                </Typography>

            </div>

        </div>
    );
}