import { useMutation } from '@tanstack/react-query';

import { loginAdmin } from '@/api/auth.api';

export function useLogin() {
    return useMutation({
        mutationFn: loginAdmin,
    });
}