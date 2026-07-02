// EnrollmentStep3Review.jsx
//
// Step 3 — Paternal Kinship: father + paternal grandparents.
// Contract: { father, paternalGrandmother, paternalGrandfather },
// each null or { name, dateOfBirth (father only), nationality,
// municipality, yucayeke, isBorikuaTaino }.

import { useQuery } from '@tanstack/react-query';

import { Alert } from '@mui/material';

import { fetchEnrollmentStep3 } from '@/api/enrollment.api';

import KinshipReview, {
    KinshipReviewSkeleton,
} from '../KinshipReview/KinshipReview';

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
        return <KinshipReviewSkeleton />;
    }

    /**
     * Error
     */
    if (error) {
        return (
            <Alert severity="error">
                Failed to load paternal kinship data
            </Alert>
        );
    }

    return (
        <KinshipReview
            entries={[
                {
                    label: 'Father',
                    person: data?.father,
                    showDateOfBirth: true,
                },
                {
                    label: 'Paternal Grandmother',
                    person: data?.paternalGrandmother,
                },
                {
                    label: 'Paternal Grandfather',
                    person: data?.paternalGrandfather,
                },
            ]}
        />
    );
}
