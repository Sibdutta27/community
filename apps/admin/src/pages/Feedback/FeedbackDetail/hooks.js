import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { fetchFeedback, updateFeedbackStatus } from "@/api/feedback.api";

/**
 * Get a single feedback submission
 */
export const useFeedbackDetail = (id) => {
  return useQuery({
    queryKey: ["feedback", id],

    queryFn: () => fetchFeedback(id),

    enabled: !!id,
  });
};

/**
 * Move a submission to another triage lane
 */
export const useUpdateFeedbackStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }) => updateFeedbackStatus({ id, status }),

    onSuccess: (_, variables) => {
      /**
       * Refetch this submission, the queue it sits in, and the lane
       * counts shown in the list filter.
       */
      queryClient.invalidateQueries({
        queryKey: ["feedback", variables.id],
      });

      queryClient.invalidateQueries({
        queryKey: ["feedback"],
      });

      queryClient.invalidateQueries({
        queryKey: ["feedback-status-counts"],
      });
    },
  });
};
