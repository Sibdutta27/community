// EnrollmentStep1Review.jsx

import styles from './step1Review.module.css';

import { useQuery } from '@tanstack/react-query';

import {
    Alert,
    Box,
    Chip,
    Paper,
    Skeleton,
    Typography,
} from '@mui/material';

import {
    Badge,
    Cake,
    ContactMail,
    Home,
    Language,
    Person,
    Phone,
    Work,
} from '@mui/icons-material';

import { fetchEnrollmentStep1 } from '@/api/enrollment.api';

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
                        value={data.legalName.firstName}
                    />

                    <InfoItem
                        label="Middle Name"
                        value={data.legalName.middleName}
                    />

                    <InfoItem
                        label="Last Name"
                        value={data.legalName.lastName}
                    />

                    <InfoItem
                        label="Maternal Last Name"
                        value={data.legalName.maternalLastName}
                    />

                    <InfoItem
                        label="Preferred Name"
                        value={data.legalName.preferredName}
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
                            new Date(
                                data.birthInfo.dateOfBirth,
                            ).toLocaleDateString()
                        }
                    />

                    <InfoItem
                        label="Country of Birth"
                        value={data.birthInfo.countryOfBirth}
                    />

                    <InfoItem
                        label="City of Birth"
                        value={data.birthInfo.cityOfBirth}
                    />

                    <InfoItem
                        label="Municipality"
                        value={data.birthInfo.municipalityOfBirth}
                    />

                </div>

            </SectionCard>

            {/* GENDER */}
            <SectionCard
                icon={<Badge className={styles.cardIcon} />}
                title="Gender Information"
                subtitle="Gender and pronouns"
            >

                <div className={styles.formGrid}>

                    <InfoItem
                        label="Gender"
                        value={data.gender.gender}
                    />

                    <InfoItem
                        label="Pronouns"
                        value={data.gender.pronouns}
                    />

                </div>

            </SectionCard>

            {/* CONTACT */}
            <SectionCard
                icon={
                    <ContactMail className={styles.cardIcon} />
                }
                title="Contact Information"
                subtitle="Communication details"
            >

                <div className={styles.formGrid}>

                    <InfoItem
                        label="Email"
                        value={data.contact.email}
                    />

                    <InfoItem
                        label="Phone Number"
                        value={data.contact.phoneNumber}
                    />

                    <InfoItem
                        label="Phone Type"
                        value={data.contact.phoneType}
                    />

                    <InfoItem
                        label="Allow SMS"
                        value={
                            data.contact.allowSMS
                                ? 'Yes'
                                : 'No'
                        }
                    />

                </div>

            </SectionCard>

            {/* ADDRESS */}
            <SectionCard
                icon={<Home className={styles.cardIcon} />}
                title="Address Information"
                subtitle="Current and mailing address"
            >

                <div className={styles.addressGrid}>

                    <Box className={styles.addressBox}>

                        <Typography
                            className={styles.addressTitle}
                        >
                            Current Address
                        </Typography>

                        <InfoItem
                            label="Street"
                            value={data.currentAddress.street}
                        />

                        <InfoItem
                            label="City"
                            value={data.currentAddress.city}
                        />

                        <InfoItem
                            label="State"
                            value={data.currentAddress.state}
                        />

                        <InfoItem
                            label="Zip Code"
                            value={data.currentAddress.zipCode}
                        />

                        <InfoItem
                            label="Country"
                            value={data.currentAddress.country}
                        />

                    </Box>

                    <Box className={styles.addressBox}>

                        <Typography
                            className={styles.addressTitle}
                        >
                            Mailing Address
                        </Typography>

                        <InfoItem
                            label="Street"
                            value={data.mailingAddress.street}
                        />

                        <InfoItem
                            label="City"
                            value={data.mailingAddress.city}
                        />

                        <InfoItem
                            label="State"
                            value={data.mailingAddress.state}
                        />

                        <InfoItem
                            label="Zip Code"
                            value={data.mailingAddress.zipCode}
                        />

                        <InfoItem
                            label="Country"
                            value={data.mailingAddress.country}
                        />

                    </Box>

                </div>

            </SectionCard>

            {/* EMERGENCY */}
            <SectionCard
                icon={<Phone className={styles.cardIcon} />}
                title="Emergency Contact"
                subtitle="Emergency communication details"
            >

                <div className={styles.formGrid}>

                    <InfoItem
                        label="Full Name"
                        value={data.emergencyContact.fullName}
                    />

                    <InfoItem
                        label="Relationship"
                        value={
                            data.emergencyContact.relationship
                        }
                    />

                    <InfoItem
                        label="Phone Number"
                        value={
                            data.emergencyContact.phoneNumber
                        }
                    />

                </div>

            </SectionCard>

            {/* ADDITIONAL */}
            <SectionCard
                icon={<Work className={styles.cardIcon} />}
                title="Additional Information"
                subtitle="Extra personal details"
            >

                <div className={styles.formGrid}>

                    <InfoItem
                        label="Marital Status"
                        value={
                            data.additionalInfo.maritalStatus
                        }
                    />

                    <InfoItem
                        label="Occupation"
                        value={data.additionalInfo.occupation}
                    />

                    <InfoItem
                        label="Education Level"
                        value={
                            data.additionalInfo.educationLevel
                        }
                    />

                </div>

                <div className={styles.languageSection}>

                    <Typography className={styles.fieldLabel}>
                        Languages Spoken
                    </Typography>

                    <div className={styles.languages}>
                        {
                            data.additionalInfo.languagesSpoken.map(
                                (lang) => (
                                    <Chip
                                        key={lang}
                                        label={lang}
                                        icon={<Language />}
                                    />
                                ),
                            )
                        }
                    </div>

                </div>

                <InfoItem
                    label="Special Skills"
                    value={
                        data.additionalInfo.specialSkills
                    }
                />

            </SectionCard>

        </div>
    );
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
                    {value || '-'}
                </Typography>

            </div>

        </div>
    );
}