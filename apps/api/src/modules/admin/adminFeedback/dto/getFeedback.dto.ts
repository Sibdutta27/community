import { Transform, Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { FeedbackStatus } from '@/generated/prisma/enums';

/**
 * Query string for GET /admin/feedback.
 *
 * `status` accepts an empty string as "no filter" — the admin table sends the
 * select's empty option straight through, and a 400 there would break the
 * "All" tab rather than teaching anybody anything.
 */
export class GetFeedbackDto {

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number;

    @IsOptional()
    @Transform(({ value }) => (value === '' ? undefined : value))
    @IsEnum(FeedbackStatus)
    status?: FeedbackStatus;
}
