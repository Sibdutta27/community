// hooks/useEnrollments.js

import {
    useQuery,
} from '@tanstack/react-query';

import {
    getSubmittedEnrollments
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
export function useSubmittedEnrollments(params = {}) {
    // Hook for search user
    return useQuery({
        queryKey: [
            'submitted-enrollments',
            {params}
        ],

        queryFn: () => getSubmittedEnrollments(params),

    });
}

