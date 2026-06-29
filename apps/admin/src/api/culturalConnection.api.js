import { api } from './client';

/**
 * Get all cultural connection with pagination and optional filters.
 */
export async function getCulturalConnection(params = {}) {
    const response = await api.get(
        '/admin/cultural-connection',
        {
            params: {
                page  : params.page,
                limit : params.limit,
                search: params.search,
            },
        }
    );

    return response.data;
}

/**
 * Create a new cultural connection
 */
export async function createCulturalConnection(data) {

    const response = await api.post(
        '/admin/cultural-connection/create',
        data
    );

    return response.data;
}

/**
 * Get a single cultural connection by id
 */
export async function fetchCulturalConnection(id) {
    const response = await api.get(
        `/admin/cultural-connection/${id}`,
    );

    return response.data;
}

/**
 * Update a cultural-connnection
 */
export async function updateCulturalConnection({ id, data }) {
    const response = await api.patch(
        `/admin/cultural-connection/${id}`,
        data
    );

    return response.data;
}