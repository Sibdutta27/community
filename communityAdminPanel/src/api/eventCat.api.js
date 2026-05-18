import { api } from './client';

/**
 * Get all event category with pagination and optional filters.
 */
export async function getEventCategories(params = {}) {
    const response = await api.get(
        '/admin/event/category',
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
 * Create a new event category
 */
export async function createEventCategory(data) {

    const response = await api.post(
        '/admin/event/category/create',
        data
    );

    return response.data;
}

/**
 * Get a single event category by id
 */
export async function fetchEventCategory(id) {
    const response = await api.get(
        `/admin/event/category/${id}`,
    );

    return response.data;
}

/**
 * Update a event category
 */
export async function updateEventCategory({ id, data }) {
    const response = await api.patch(
        `/admin/event/category/${id}`,
        data
    );

    return response.data;
}