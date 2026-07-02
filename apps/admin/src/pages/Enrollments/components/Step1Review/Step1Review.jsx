// EnrollmentStep1Review.jsx

import styles from './step1Review.module.css';

import { useQuery } from '@tanstack/react-query';

import {
    Alert,
    Paper,
    Skeleton,
    Typography,
} from '@mui/material';

import {
    Badge,
    Cake,
    Diversity3,
    Person,
} from '@mui/icons-material';

import { fetchEnrollmentStep1 } from '@/api/enrollment.api';

import { formatWords } from '@/utils/formatWord.util';

export default function EnrollmentStep1Review({
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
            <div className={styles.loadingContainer}>

                {[1, 2, 3].map((item) => (
                    <Paper
                        key={item}
                        className={styles.card}
                    >
                        <Skeleton
                            variant="text"
                            width={220}
                            height={40}
                        />

                        <div className={styles.skeletonGrid}>

                            {[1, 2, 3, 4].map((field) => (
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
                ))}

            </div>
        );
    }

    /**
     * Error UI
     */
    if (error) {
        return (
            <Alert severity="error">
                Failed to load enrollment data
            </Alert>
        );
    }

    const demographics = data?.demographics;

    return (
        <div className={styles.container}>

            {/* LEGAL NAME */}
            <SectionCard
                icon={<Person className={styles.cardIcon} />}
                title="Legal Name"
                subtitle="Personal identity information"
            >

                <div className={styles.formGrid}>

                    <InfoItem
                        label="First Name"
                        value={demographics?.firstName}
                    />

                    <InfoItem
                        label="Last Name"
                        value={demographics?.lastName}
                    />

                </div>

            </SectionCard>

            {/* BIRTH INFO */}
            <SectionCard
                icon={<Cake className={styles.cardIcon} />}
                title="Birth Information"
                subtitle="Birth and location details"
            >

                <div className={styles.formGrid}>

                    <InfoItem
                        label="Date of Birth"
                        value={
                            demographics?.dateOfBirth
                                ? new Date(
                                    demographics.dateOfBirth,
                                ).toLocaleDateString()
                                : null
                        }
                    />

                    <InfoItem
                        label="Country of Birth"
                        value={demographics?.countryOfBirth}
                    />

                    <InfoItem
                        label="City of Birth"
                        value={demographics?.cityOfBirth}
                    />

                    <InfoItem
                        label="Municipality"
                        value={
                            demographics?.municipalityOfBirth
                        }
                    />

                </div>

            </SectionCard>

            {/* DEMOGRAPHICS */}
            <SectionCard
                icon={<Badge className={styles.cardIcon} />}
                title="Demographics"
                subtitle="Sex, gender, marital status and occupation"
            >

                <div className={styles.formGrid}>

                    <InfoItem
                        label="Sex"
                        value={formatWords(demographics?.sex)}
                    />

                    <InfoItem
                        label="Gender"
                        value={demographics?.gender}
                    />

                    <InfoItem
                        label="Marital Status"
                        value={demographics?.maritalStatus}
                    />

                    <InfoItem
                        label="Occupation"
                        value={demographics?.occupation}
                    />

                </div>

            </SectionCard>

            {/* IDENTITY & YUCAYEKE */}
            <SectionCard
                icon={
                    <Diversity3 className={styles.cardIcon} />
                }
                title="Identity & Yucayeke"
                subtitle="Heritage identity, yucayeke and children"
            >

                <div className={styles.formGrid}>

                    <InfoItem
                        label="Identity"
                        value={data.yucayekeInfo?.identity}
                    />

                    <InfoItem
                        label="Yucayeke"
                        value={
                            data.yucayekeInfo?.yucayekeUnknown
                                ? "Unknown (member doesn't know)"
                                : data.yucayekeInfo?.yucayeke
                        }
                    />

                    <InfoItem
                        label="Has Children"
                        value={
                            formatBoolean(
                                data.yucayekeInfo?.hasChildren,
                            )
                        }
                    />

                    <InfoItem
                        label="Has Children Under 18"
                        value={
                            formatBoolean(
                                data.yucayekeInfo?.hasMinorChildren,
                            )
                        }
                    />

                </div>

            </SectionCard>

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
 * Section Card
 */
function SectionCard({
    icon,
    title,
    subtitle,
    children,
}) {

    return (
        <Paper className={styles.card}>

            <div className={styles.cardTop}>

                {icon}

                <div>

                    <Typography className={styles.cardTitle}>
                        {title}
                    </Typography>

                    <Typography
                        className={styles.cardSubTitle}
                    >
                        {subtitle}
                    </Typography>

                </div>

            </div>

            {children}

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
                    {value || '—'}
                </Typography>

            </div>

        </div>
    );
}
