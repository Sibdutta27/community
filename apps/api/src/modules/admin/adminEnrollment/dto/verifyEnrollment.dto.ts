// dto/verifyDocument.dto.ts

import { IsBoolean } from 'class-validator';

export class VerifyEnrollmentDto {

    @IsBoolean()
    isApproved: boolean;
}