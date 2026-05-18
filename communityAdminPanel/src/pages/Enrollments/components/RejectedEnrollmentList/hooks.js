// hooks/useRejectedEnrollments.js

import {
    useQuery,
} from '@tanstack/react-query';

import {
    getRejectedEnrollments
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
export function useRejectedEnrollments(params = {}) {
    // Hook for search user
    return useQuery({
        queryKey: [
            'rejected-enrollments',
            {params}
        ],

        queryFn: () => getRejectedEnrollments(params),

    });
}

