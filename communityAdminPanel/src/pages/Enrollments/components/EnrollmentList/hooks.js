// hooks/useEnrollments.js

import {
    useQuery,
} from '@tanstack/react-query';

import {
    getEnrollments,
    fetchStatusCounts,
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
export function useEnrollments(params = {}) {
    // Hook for search user
    return useQuery({
        queryKey: [
            'enrollments',
            {params}
        ],

        queryFn: () => getEnrollments(params),

    });
}

/**
 * Get status counts query
 */
export function useStatusCounts() {
    return useQuery({
        queryKey: ['status-counts'],

        queryFn: fetchStatusCounts,
    });
}

