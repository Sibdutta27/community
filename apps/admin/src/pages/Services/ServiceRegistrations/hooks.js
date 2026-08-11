import { useQuery } from "@tanstack/react-query";

import { fetchService, getServiceRegistrations } from "@/api/service.api";

/**
 * Get the paginated registrant roster for one program
 */
export function useServiceRegistrations(params = {}) {
  return useQuery({
    queryKey: ["service-registrations", { params }],

    queryFn: () => getServiceRegistrations(params),

    enabled: Boolean(params.id),

    // Keep the previous page on screen while the next one loads, so paging
    // doesn't blank the table.
    placeholderData: (previous) => previous,
  });
}

/**
 * Get the program itself, for the roster's header
 */
export function useService(id) {
  return useQuery({
    queryKey: ["service", id],

    queryFn: () => fetchService(id),

    enabled: Boolean(id),
  });
}
