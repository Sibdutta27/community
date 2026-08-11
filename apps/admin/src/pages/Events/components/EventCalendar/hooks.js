import { useQuery } from "@tanstack/react-query";

import { getEventCalendar } from "@/api/event.api";

/**
 * Get every event inside the visible month grid.
 *
 * Unpaginated: a calendar cell has to show all of that day's events, so the
 * API returns the whole window.
 */
export function useEventCalendar(params = {}) {
  return useQuery({
    queryKey: ["event-calendar", { params }],

    queryFn: () => getEventCalendar(params),

    enabled: Boolean(params.from && params.to),

    // Keep last month on screen while the next one loads, so paging months
    // doesn't flash an empty grid.
    placeholderData: (previous) => previous,
  });
}
