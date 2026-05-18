import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { fetchService, updateService } from "@/api/service.api";

import { getServiceCategories } from "@/api/serviceCat.api";

/**
 * Get a single service
 */
export const useService = (id) => {
    return useQuery({
        queryKey: ['service', id],

        queryFn: () => fetchService(id),

        enabled: !!id,
    });
};

/**
 * Update service
 */
export const useUpdateService = () => {

    const queryClient = useQueryClient();

    return useMutation({

        mutationFn: ({ id, data }) => updateService({id, data}),

        onSuccess: (_, variables) => {

            /**
             * Refetch current service
             */
            queryClient.invalidateQueries({
                queryKey: ['service', variables.id],
            });
        },
    });
};

/**
 * Get service category query
 */
export function useServiceCategory(params = {}) { 
    return useQuery({
        queryKey: [
            'service-categories',
            {params}
        ],

        queryFn: () => getServiceCategories(params),
    });
}