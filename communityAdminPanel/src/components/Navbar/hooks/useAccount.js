import { useQuery } from '@tanstack/react-query';

import { getAccount } from '@/api/account.api';

export function useAccount() {
    return useQuery({
        queryKey: ['user-account'],

        queryFn: getAccount,

        retry: false,
    });
}