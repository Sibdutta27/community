import { useQuery } from "@tanstack/react-query";

import { getFeedback, fetchFeedbackStatusCounts } from "@/api/feedback.api";

/**
 * Get the paginated feedback queue
 * {
        isFetching
        isError
        data
        refetch
    }
 */
export function useFeedback(params = {}) {
  return useQuery({
    queryKey: ["feedback", { params }],

    queryFn: () => getFeedback(params),
  });
}

/**
 * Get the per-lane counts shown above the table
 */
export function useFeedbackStatusCounts() {
  return useQuery({
    queryKey: ["feedback-status-counts"],

    queryFn: () => fetchFeedbackStatusCounts(),
  });
}
