import { useQuery } from "@tanstack/react-query";
import { getEventCategories } from "@/api/eventCat.api";

/**
 * Get event category query
 */
export function useEventCategory(params = {}) { 
    return useQuery({
        queryKey: [
            'event-categories',
            {params}
        ],

        queryFn: () => getEventCategories(params),
    });
}