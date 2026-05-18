import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { fetchEvent, updateEvent } from "@/api/event.api";

import { getEventCategories } from "@/api/eventCat.api";

/**
 * Get a single event
 */
export const useEvent = (id) => {
    return useQuery({
        queryKey: ['event', id],

        queryFn: () => fetchEvent(id),

        enabled: !!id,
    });
};

/**
 * Update event
 */
export const useUpdateEvent = () => {

    const queryClient = useQueryClient();

    return useMutation({

        mutationFn: ({ id, data }) => updateEvent({id, data}),

        onSuccess: (_, variables) => {

            /**
             * Refetch current event
             */
            queryClient.invalidateQueries({
                queryKey: ['event', variables.id],
            });
        },
    });
};

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