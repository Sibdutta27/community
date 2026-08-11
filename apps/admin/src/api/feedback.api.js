import { api } from "./client";

/**
 * Get all feedback submissions with pagination and an optional status filter.
 */
export async function getFeedback(params = {}) {
  const response = await api.get("/admin/feedback", {
    params: {
      page: params.page,
      limit: params.limit,
      status: params.status || undefined,
    },
  });

  return response.data;
}

/**
 * Get how many submissions sit in each triage lane.
 */
export async function fetchFeedbackStatusCounts() {
  const response = await api.get("/admin/feedback/status-counts");
  return response.data;
}

/**
 * Get a single feedback submission, including a signed attachment URL.
 */
export async function fetchFeedback(id) {
  const response = await api.get(`/admin/feedback/${id}`);
  return response.data;
}

/**
 * Move a feedback submission to another triage lane.
 */
export async function updateFeedbackStatus({ id, status }) {
  const response = await api.patch(`/admin/feedback/${id}/status`, {
    status,
  });

  return response.data;
}
