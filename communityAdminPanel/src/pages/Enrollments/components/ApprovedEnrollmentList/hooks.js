// hooks/useEnrollments.js

import {
    useQuery,
} from '@tanstack/react-query';

import {
    getApprovedEnrollments
} from '@/api/enrollment.api';

/**
 * Get enrollment query
 * {
        isFetching
        isError
        data
        refetch
    }
 */
export function useApprovedEnrollments(params = {}) {
    // Hook for search user
    return useQuery({
        queryKey: [
            'approved-enrollments',
            {params}
        ],

        queryFn: () => getApprovedEnrollments(params),

    });
}

