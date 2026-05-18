// interfaces/getServices.interface.ts

import {
    ServiceStatus,
} from '@/generated/prisma/enums';

export interface GetServicesQueryInterface {
    page      ?: number;
    limit     ?: number;
    search    ?: string;
    status    ?: ServiceStatus;
    categoryId?: string;
}