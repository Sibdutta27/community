import { api } from "./client";

/**
 * Get all services with pagination and optional filters.
 */
export async function getServices(params = {}) {
  const response = await api.get("/admin/service", {
    params: {
      page: params.page,
      limit: params.limit,
      search: params.search,
      status: params.status || undefined,
      categoryId: params.categoryId || undefined,
    },
  });

  return response.data;
}

/**
 * Create a new service
 */
export async function createService(data) {
  const response = await api.post("/admin/service/create", data);

  return response.data;
}

/**
 * Get a single service by id
 */
export async function fetchService(id) {
  const response = await api.get(`/admin/service/${id}`);

  return response.data;
}

/**
 * Update a service
 */
export async function updateService({ id, data }) {
  const response = await api.patch(`/admin/service/${id}`, data);

  return response.data;
}

/**
 * Get who registered for a program, paginated
 */
export async function getServiceRegistrations({ id, ...params } = {}) {
  const response = await api.get(`/admin/service/${id}/registrations`, {
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
export async function fetchServiceRegistrationsCsv(id) {
  const response = await api.get(`/admin/service/${id}/registrations/export`, {
    responseType: "text",
  });

  return response.data;
}
