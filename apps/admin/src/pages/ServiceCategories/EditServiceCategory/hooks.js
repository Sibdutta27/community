import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { fetchServiceCategory, updateServiceCategory } from "@/api/serviceCat.api";

/**
 * Get a single serviceCategory
 */
export const useServiceCategory = (id) => {
    return useQuery({
        queryKey: ['serviceCategory', id],

        queryFn: () => fetchServiceCategory(id),

        enabled: !!id,
    });
};

/**
 * Update serviceCategory
 */
export const useUpdateServiceCategory = () => {

    const queryClient = useQueryClient();

    return useMutation({

        mutationFn: ({ id, data }) => updateServiceCategory({id, data}),

        onSuccess: (_, variables) => {

            /**
             * Refetch current user
             */
            queryClient.invalidateQueries({
                queryKey: ['serviceCategory', variables.id],
            });
        },
    });
};