import { IsEnum } from 'class-validator';
import { AncestryVerificationStatus } from '@/generated/prisma/enums';

export class VerifyAncestryDto {

    @IsEnum(AncestryVerificationStatus)
    status: AncestryVerificationStatus;
}
