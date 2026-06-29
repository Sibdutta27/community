// interfaces/getEnrollments.interface.ts

import { EnrollmentStatus } from '@/generated/prisma/enums';

export interface IGetEnrollmentsQuery {
    page?: number;
    limit?: number;

    status?: EnrollmentStatus;

    search?: string;
}