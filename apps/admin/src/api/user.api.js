import { api } from "./client";

/**
 * Get all users with pagination and optional filters.
 */
export async function getUsers(params = {}) {
  const response = await api.get("/admin/user", {
    params: {
      page: params.page,
      limit: params.limit,
      role: params.role,
      search: params.search,
    },
  });

  return response.data;
}

/**
 * Get role counts for users
 */
export async function fetchRoleCounts() {
  const response = await api.get(`/admin/user/role-counts`);
  return response.data;
}

/**
 * Change role of users in bulk
 */
export async function roleChange({ users, role }) {
  const response = await api.post(`/admin/user/change-roles`, { users, role });
  return response.data;
}

/**
 * Create a new user
 */
export async function createUser(data) {
  const response = await api.post("/admin/user/register", data);

  return response.data;
}

/**
 * Get a single user by user id
 */
export async function getUser(id) {
  const response = await api.get(`/admin/user/${id}`);

  return response.data;
}

/**
 * Update a user
 */
export async function updateUser({ id, data }) {
  const response = await api.patch(`/admin/user/${id}`, data);

  return response.data;
}

/**
 * Get a user's consent record (resolved through their enrollment).
 */
export async function getUserConsents(id) {
  const response = await api.get(`/admin/user/${id}/consents`);

  return response.data;
}
