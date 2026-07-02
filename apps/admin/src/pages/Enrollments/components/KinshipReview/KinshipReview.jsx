// KinshipReview.jsx
//
// Shared renderer for the kinship (Ancestry) review cards.
// Step 2 (maternal) and Step 3 (paternal) both render three
// ancestor cards with the same shape:
// { name, dateOfBirth, nationality, municipality, yucayeke, isBorikuaTaino }
// An ancestor can be null — every field falls back to '—'.

import styles from './kinshipReview.module.css';

import {
    Paper,
    Skeleton,
    Typography,
} from '@mui/material';

import {
    CalendarMonth,
    Diversity3,
    FamilyRestroom,
    Home,
    LocationOn,
    Public,
} from '@mui/icons-material';

export default function KinshipReview({
    entries,
}) {

    return (
        <div className={styles.container}>

            {
                entries.map((entry) => (

                    <Paper
                        key={entry.label}
                        className={styles.kinshipCard}
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
                                        {entry.label}
                                    </Typography>

                                    <Typography
                                        className={styles.fullName}
                                    >
                                        {
                                            entry.person?.name
                                            || '—'
                                        }
                                    </Typography>

                                </div>

                            </div>

                        </div>

                        {/* BODY */}
                        <div className={styles.grid}>

                            {
                                entry.showDateOfBirth && (
                                    <InfoItem
                                        icon={<CalendarMonth />}
                                        label="Date of Birth"
                                        value={
                                            entry.person?.dateOfBirth
                                                ? new Date(
                                                    entry.person.dateOfBirth,
                                                ).toLocaleDateString()
                                                : null
                                        }
                                    />
                                )
                            }

                            <InfoItem
                                icon={<Public />}
                                label="Nationality"
                                value={
                                    entry.person?.nationality
                                }
                            />

                            <InfoItem
                                icon={<LocationOn />}
                                label="Municipality"
                                value={
                                    entry.person?.municipality
                                }
                            />

                            <InfoItem
                                icon={<Home />}
                                label="Yucayeke"
                                value={entry.person?.yucayeke}
                            />

                            <InfoItem
                                icon={<Diversity3 />}
                                label="Borikua Taíno Heritage"
                                value={
                                    formatBoolean(
                                        entry.person?.isBorikuaTaino,
                                    )
                                }
                            />

                        </div>

                    </Paper>

                ))
            }

        </div>
    );
}

/**
 * Loading skeleton (three ancestor cards)
 */
export function KinshipReviewSkeleton() {

    return (
        <div className={styles.loadingContainer}>

            {[1, 2, 3].map((item) => (
                <Paper
                    key={item}
                    className={styles.kinshipCard}
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
 * Format nullable boolean
 */
function formatBoolean(value) {

    if (value === true) {
        return 'Yes';
    }

    if (value === false) {
        return 'No';
    }

    return null;
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
                    {value || '—'}
                </Typography>

            </div>

        </div>
    );
}
