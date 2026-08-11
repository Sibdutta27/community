// interfaces/getFeedback.interface.ts

import { FeedbackStatus } from '@/generated/prisma/enums';

export interface IGetFeedbackQuery {
    page?: number;
    limit?: number;

    status?: FeedbackStatus;
}
