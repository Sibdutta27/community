import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { fetchEventCategory, updateEventCategory } from "@/api/eventCat.api";

/**
 * Get a single eventCategory
 */
export const useEventCategory = (id) => {
    return useQuery({
        queryKey: ['eventCategory', id],

        queryFn: () => fetchEventCategory(id),

        enabled: !!id,
    });
};

/**
 * Update eventCategory
 */
export const useUpdateEventCategory = () => {

    const queryClient = useQueryClient();

    return useMutation({

        mutationFn: ({ id, data }) => updateEventCategory({id, data}),

        onSuccess: (_, variables) => {

            /**
             * Refetch current eventCategory
             */
            queryClient.invalidateQueries({
                queryKey: ['eventCategory', variables.id],
            });
        },
    });
};