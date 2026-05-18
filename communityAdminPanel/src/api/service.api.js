import { api } from './client';

/**
 * Get all services with pagination and optional filters.
 */
export async function getServices(params = {}) {
    const response = await api.get(
        '/admin/service',
        {
            params: {
                page      : params.page,
                limit     : params.limit,
                search    : params.search,
                status    : params.status,
                categoryId: params.categoryId,
            },
        }
    );

    return response.data;
}

/**
 * Create a new service
 */
export async function createService(data) {

    const response = await api.post(
        '/admin/service/create',
        data
    );

    return response.data;
}

/**
 * Get a single service by id
 */
export async function fetchService(id) {
    const response = await api.get(
        `/admin/service/${id}`,
    );

    return response.data;
}

/**
 * Update a service
 */
export async function updateService({ id, data }) {
    const response = await api.patch(
        `/admin/service/${id}`,
        data
    );

    return response.data;
}