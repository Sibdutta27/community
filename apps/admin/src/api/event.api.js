import { api } from './client';

/**
 * Get all events with pagination and optional filters.
 */
export async function getEvents(params = {}) {
    const response = await api.get(
        '/admin/event',
        {
            params: {
                page      : params.page,
                limit     : params.limit,
                search    : params.search,
                categoryId: params.categoryId,
            },
        }
    );

    return response.data;
}

/**
 * Create a new event
 */
export async function createEvent(data) {

    const response = await api.post(
        '/admin/event/create',
        data
    );

    return response.data;
}

/**
 * Get a single event by id
 */
export async function fetchEvent(id) {
    const response = await api.get(
        `/admin/event/${id}`,
    );

    return response.data;
}

/**
 * Update a event
 */
export async function updateEvent({ id, data }) {
    const response = await api.patch(
        `/admin/event/${id}`,
        data
    );

    return response.data;
}