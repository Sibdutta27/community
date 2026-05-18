// hooks/useUsers.js

import {
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query';

import {
    getUsers,
    fetchRoleCounts,
    roleChange,
    getUser,
    updateUser,
} from '@/api/user.api';

/**
 * Get users query
 * {
        isFetching
        isError
        data
        refetch
    }
 */
export function useUsers(params = {}) {
    // Hook for search user
    return useQuery({
        queryKey: [
            'users',
            {params}
        ],

        queryFn: () => getUsers(params),

    });
}

/**
 * Get role counts query
 */
export function useRoleCounts() {
    return useQuery({
        queryKey: ['role-counts'],

        queryFn: fetchRoleCounts,
    });
}

/**
 * Bulk role change mutation
 */
export function useRoleChange() {

    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({users, role}) => roleChange({ users, role }),
    });
}

/**
 * Get single user
 */
export const useUser = (userId) => {
    return useQuery({
        queryKey: ['user', userId],

        queryFn: () => getUser(userId),

        enabled: !!userId,
    });
};

/**
 * Update user
 */
export const useUpdateUser = () => {

    const queryClient = useQueryClient();

    return useMutation({

        mutationFn: ({ id, data }) => updateUser({id, data}),

        onSuccess: (_, variables) => {

            /**
             * Refetch current user
             */
            queryClient.invalidateQueries({
                queryKey: ['user', variables.id],
            });
        },
    });
};