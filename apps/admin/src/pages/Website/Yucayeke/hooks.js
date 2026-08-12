import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getTerritories,
  revertTerritoryOverride,
  saveTerritoryOverride,
} from "@/api/territory.api";

const TERRITORIES_QUERY = ["content-territories"];

/** All 21 territories with the code's values and any stored override. */
export function useTerritories() {
  return useQuery({
    queryKey: TERRITORIES_QUERY,
    queryFn: getTerritories,
  });
}

/**
 * Both writes refetch, unlike the Pages tab's save-on-blur.
 *
 * There, refetching mid-edit would fight the person's cursor. Here a save is an
 * explicit, whole-record commit that goes live immediately, so the server IS
 * the better source the moment it returns.
 */
export function useSaveTerritoryOverride() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveTerritoryOverride,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: TERRITORIES_QUERY }),
  });
}

export function useRevertTerritoryOverride() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: revertTerritoryOverride,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: TERRITORIES_QUERY }),
  });
}
