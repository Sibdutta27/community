import { api } from './client';

/**
 * Get all consents with pagination and optional filters.
 */
export async function getConsents(params = {}) {
    const response = await api.get(
        '/admin/consent',
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
 * Create a new consent
 */
export async function createConsent(data) {

    const response = await api.post(
        '/admin/consent/create',
        data
    );

    return response.data;
}

/**
 * Get a single consent by id
 */
export async function fetchConsent(id) {
    const response = await api.get(
        `/admin/consent/${id}`,
    );

    return response.data;
}

/**
 * Update a cconsent
 */
export async function updateConsent({ id, data }) {
    const response = await api.patch(
        `/admin/consent/${id}`,
        data
    );

    return response.data;
}