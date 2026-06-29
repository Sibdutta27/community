// interfaces/updateEvent.interface.ts

import { LocationType }
    from '@/generated/prisma/enums';

export interface UpdateEventInterface {
    title?: string;
    description?: string;

    categoryId?: string;

    startDateTime?: string;
    endDateTime?: string;

    locationType?: LocationType;

    location?: string;
    meetingUrl?: string;

    maxCapacity?: number;

    isFeatured?: boolean;

    externalUrl?: string;
}