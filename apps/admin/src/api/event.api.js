import { api } from "./client";

/**
 * Get all events with pagination and optional filters.
 */
export async function getEvents(params = {}) {
  const response = await api.get("/admin/event", {
    params: {
      page: params.page,
      limit: params.limit,
      search: params.search,
      categoryId: params.categoryId,
    },
  });

  return response.data;
}

/**
 * Create a new event
 */
export async function createEvent(data) {
  const response = await api.post("/admin/event/create", data);

  return response.data;
}

/**
 * Get a single event by id
 */
export async function fetchEvent(id) {
  const response = await api.get(`/admin/event/${id}`);

  return response.data;
}

/**
 * Update a event
 */
export async function updateEvent({ id, data }) {
  const response = await api.patch(`/admin/event/${id}`, data);

  return response.data;
}

/**
 * Get every event inside a date window, for the month calendar.
 *
 * Unpaginated by design — a calendar cell has to show all of that day's
 * events or it lies about the day.
 */
export async function getEventCalendar(params = {}) {
  const response = await api.get("/admin/event/calendar", {
    params: {
      from: params.from,
      to: params.to,
      categoryId: params.categoryId || undefined,
    },
  });

  return response.data;
}

/**
 * Get who registered for an event, paginated
 */
export async function getEventRegistrations({ id, ...params } = {}) {
  const response = await api.get(`/admin/event/${id}/registrations`, {
    params: {
      page: params.page,
      limit: params.limit,
      search: params.search || undefined,
    },
  });

  return response.data;
}

/**
 * Download the full registrant roster as CSV.
 *
 * Returns the raw text — the caller names the file, because the API's
 * Content-Disposition header is not exposed to the browser by CORS.
 */
export async function fetchEventRegistrationsCsv(id) {
  const response = await api.get(`/admin/event/${id}/registrations/export`, {
    responseType: "text",
  });

  return response.data;
}
