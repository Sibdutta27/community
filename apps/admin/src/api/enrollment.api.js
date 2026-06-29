import { api } from './client';

/**
 * Get all enrollments with pagination and optional filters.
 */
export async function getEnrollments(params = {}) {
    const response = await api.get(
        '/admin/enrollment',
        {
            params: {
                page  : params.page,
                limit : params.limit,
                status: params.status,
                search: params.search,
            },
        }
    );

    return response.data;
}

/**
 * Get all  submitted enrollments with pagination and optional filters.
 */
export async function getSubmittedEnrollments(params = {}) {
    const response = await api.get(
        '/admin/enrollment/submitted',
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
 * Get all approved enrollments with pagination and optional filters.
 */
export async function getApprovedEnrollments(params = {}) {
    const response = await api.get(
        '/admin/enrollment/approved',
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
 * Get all rejected enrollments with pagination and optional filters.
 */
export async function getRejectedEnrollments(params = {}) {
    const response = await api.get(
        '/admin/enrollment/rejected',
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
 * Get status counts for enrollments
 */
export async function fetchStatusCounts() {
    const response = await api.get(
        `/admin/enrollment/status-counts`,
    );
    return response.data;
}


/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////


/**
 * Get enrollment's step1 data
 */
export async function fetchEnrollmentStep1(enrollmentId) {
    const response = await api.get(
        `/admin/enrollment/step-1/${enrollmentId}`,
    );
    return response.data;
}

/**
 * Get enrollment's step2 data
 */
export async function fetchEnrollmentStep2(enrollmentId) {
    const response = await api.get(
        `/admin/enrollment/step-2/${enrollmentId}`,
    );
    return response.data;
}

/**
 * Get enrollment's step3 data
 */
export async function fetchEnrollmentStep3(enrollmentId) {
    const response = await api.get(
        `/admin/enrollment/step-3/${enrollmentId}`,
    );
    return response.data;
}

/**
 * Get enrollment's stepe4 data
 */
export async function fetchEnrollmentStep4(enrollmentId) {
    const response = await api.get(
        `/admin/enrollment/step-4/${enrollmentId}`,
    );
    return response.data;
}

/**
 * Verify a single document
 */
export async function verifyEnrollmentDocument({documentId, isApproved}) {
    const response = await api.patch(
        `/admin/enrollment/documents/${documentId}/verify`,
        {
            isApproved,
        },
    );

    return response.data;
}

/**
 * Verify enrollment
 */
export async function verifyEnrollment({enrollmentId, isApproved}) {
    const response = await api.patch(
        `/admin/enrollment/${enrollmentId}/verify`,
        {
            isApproved,
        },
    );

    return response.data;
}
