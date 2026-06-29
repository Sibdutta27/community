// dto/verifyDocument.dto.ts

import { IsBoolean } from 'class-validator';

export class VerifyDocumentDto {

    @IsBoolean()
    isApproved: boolean;
}