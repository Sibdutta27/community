import { api } from './client';

/**
 * Get all service category with pagination and optional filters.
 */
export async function getServiceCategories(params = {}) {
    const response = await api.get(
        '/admin/service/category',
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
 * Create a new service category
 */
export async function createServiceCategory(data) {

    const response = await api.post(
        '/admin/service/category/create',
        data
    );

    return response.data;
}

/**
 * Get a single service category by id
 */
export async function fetchServiceCategory(id) {
    const response = await api.get(
        `/admin/service/category/${id}`,
    );

    return response.data;
}

/**
 * Update a service category
 */
export async function updateServiceCategory({ id, data }) {
    const response = await api.patch(
        `/admin/service/category/${id}`,
        data
    );

    return response.data;
}