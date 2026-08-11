import { IsEnum } from 'class-validator';
import { FeedbackStatus } from '@/generated/prisma/enums';

/**
 * Body for PATCH /admin/feedback/:feedbackId/status — move a submission to
 * another triage lane.
 */
export class UpdateFeedbackStatusDto {

    @IsEnum(FeedbackStatus)
    status: FeedbackStatus;
}
