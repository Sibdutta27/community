import { api } from './client';

export async function getAccount() {
    const response = await api.get(
        `/account/info`
    );

    return response.data;
}