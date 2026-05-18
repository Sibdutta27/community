import { useQuery } from "@tanstack/react-query";
import { getConsents } from "@/api/consent.api";

/**
 * Get consent query
 * {
        isFetching
        isError
        data
        refetch
    }
 */
export function useConsents(params = {}) {
    // Hook for search user
    return useQuery({
        queryKey: [
            'consent',
            {params}
        ],

        queryFn: () =>getConsents(params),
    });
}