import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { fetchCulturalConnection, updateCulturalConnection } from "@/api/culturalConnection.api";

/**
 * Get a single cultural connection
 */
export const useCulturalConnection = (id) => {
    return useQuery({
        queryKey: ['cultural-connection', id],

        queryFn: () => fetchCulturalConnection(id),

        enabled: !!id,
    });
};

/**
 * Update user
 */
export const useUpdateCulturalConnection = () => {

    const queryClient = useQueryClient();

    return useMutation({

        mutationFn: ({ id, data }) => updateCulturalConnection({id, data}),

        onSuccess: (_, variables) => {

            /**
             * Refetch current user
             */
            queryClient.invalidateQueries({
                queryKey: ['cultural-connection', variables.id],
            });
        },
    });
};