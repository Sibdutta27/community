// dto/verifyEnrollment.dto.ts

import {
    ArrayUnique,
    IsArray,
    IsBoolean,
    IsEnum,
    IsOptional,
    IsString,
    MaxLength,
} from 'class-validator';

import { NoticeChannel } from '@/generated/prisma/enums';

export class VerifyEnrollmentDto {

    @IsBoolean()
    isApproved: boolean;

    /**
     * Why the application was decided this way. Optional on the wire so an
     * approval need not carry one, and so a deploy of this API ahead of the
     * admin panel does not start rejecting the old request shape.
     */
    @IsOptional()
    @IsString()
    @MaxLength(2000)
    reason?: string;

    /**
     * Which of the member's registered channels staff asked to notify.
     * Queued only — nothing in this API delivers yet.
     */
    @IsOptional()
    @IsArray()
    @ArrayUnique()
    @IsEnum(NoticeChannel, { each: true })
    channels?: NoticeChannel[];
}
