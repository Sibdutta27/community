import { useQuery } from "@tanstack/react-query";

import { fetchEvent, getEventRegistrations } from "@/api/event.api";

/**
 * Get the paginated registrant roster for one event
 */
export function useEventRegistrations(params = {}) {
  return useQuery({
    queryKey: ["event-registrations", { params }],

    queryFn: () => getEventRegistrations(params),

    enabled: Boolean(params.id),

    // Keep the previous page on screen while the next one loads, so paging
    // doesn't blank the table.
    placeholderData: (previous) => previous,
  });
}

/**
 * Get the event itself, for the roster's header
 */
export function useEvent(id) {
  return useQuery({
    queryKey: ["event", id],

    queryFn: () => fetchEvent(id),

    enabled: Boolean(id),
  });
}
