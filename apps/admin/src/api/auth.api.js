import { api } from './client';

export async function loginAdmin(data) {
    const response = await api.post(
        `/auth/admin-login`,
        data
    );

    return response.data;
}