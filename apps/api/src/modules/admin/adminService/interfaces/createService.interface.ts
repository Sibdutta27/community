// interfaces/createService.interface.ts

import {
    ActionType,
    ServiceStatus,
} from '@/generated/prisma/enums';

export interface CreateServiceInterface {
    name: string;

    description?: string;
    icon?: string;

    categoryId: string;

    isFeatured?: boolean;
    status?: ServiceStatus;

    location?: string;
    phone?: string;
    email?: string;

    actionType?: ActionType;
    actionLabel?: string;
    actionUrl?: string;
    actionRoute?: string;

    highlights?: string[];
}