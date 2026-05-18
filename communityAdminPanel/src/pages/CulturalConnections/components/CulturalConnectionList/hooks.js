import { useQuery } from "@tanstack/react-query";
import { getCulturalConnection } from "@/api/culturalConnection.api";

/**
 * Get cultural connection query
 * {
        isFetching
        isError
        data
        refetch
    }
 */
export function useCulturalConnections(params = {}) {
    // Hook for search user
    return useQuery({
        queryKey: [
            'cultural-connections',
            {params}
        ],

        queryFn: () =>getCulturalConnection(params),

    });
}