import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { fetchConsent, updateConsent } from "@/api/consent.api";

/**
 * Get a single consent
 */
export const useConsent = (id) => {
    return useQuery({
        queryKey: ['consent', id],

        queryFn: () => fetchConsent(id),

        enabled: !!id,
    });
};

/**
 * Update consent
 */
export const useUpdateConsent = () => {

    const queryClient = useQueryClient();

    return useMutation({

        mutationFn: ({ id, data }) => updateConsent({id, data}),

        onSuccess: (_, variables) => {

            /**
             * Refetch current user
             */
            queryClient.invalidateQueries({
                queryKey: ['consent', variables.id],
            });
        },
    });
};