import { useQuery } from "@tanstack/react-query";
import { getEvents } from "@/api/event.api";
import { getEventCategories } from "@/api/eventCat.api";

/**
 * Get events query
 * {
        isFetching
        isError
        data
        refetch
    }
 */
export function useEvents(params = {}) { 
    return useQuery({
        queryKey: [
            'event',
            {params}
        ],

        queryFn: () => getEvents(params),
    });
}

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