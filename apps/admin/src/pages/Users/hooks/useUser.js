// hooks/useUsers.js

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getUsers,
  fetchRoleCounts,
  roleChange,
  getUser,
  updateUser,
  getUserConsents,
} from "@/api/user.api";

/**
 * A user's consent record. Kept out of `useUser` on purpose: it is secondary
 * detail on the user screen, so it loads on its own and a failure here never
 * blocks editing the account itself.
 */
export const useUserConsents = (userId) => {
  return useQuery({
    queryKey: ["user-consents", userId],
    queryFn: () => getUserConsents(userId),
    enabled: Boolean(userId),
  });
};

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
    queryKey: ["users", { params }],

    queryFn: () => getUsers(params),
  });
}

/**
 * Get role counts query
 */
export function useRoleCounts() {
  return useQuery({
    queryKey: ["role-counts"],

    queryFn: fetchRoleCounts,
  });
}

/**
 * Bulk role change mutation
 */
export function useRoleChange() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ users, role }) => roleChange({ users, role }),

    /**
     * The client was created and then never used, so a bulk role change
     * left the table showing the roles it had before the change.
     */
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["role-counts"] });
    },
  });
}

/**
 * Get single user
 */
export const useUser = (userId) => {
  return useQuery({
    queryKey: ["user", userId],

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
    mutationFn: ({ id, data }) => updateUser({ id, data }),

    onSuccess: (_, variables) => {
      /**
       * Refetch current user
       */
      queryClient.invalidateQueries({
        queryKey: ["user", variables.id],
      });
    },
  });
};
