import { Transform } from 'class-transformer';
import { Equals, IsBoolean, IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class CompleteEnrollmentDto {
    // Confirmation e-signature: the applicant's full legal name.
    @IsString()
    @IsNotEmpty({ message: 'Signature name is required' })
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    signatureName: string;

    // The date the applicant signed the confirmation (ISO date string).
    @IsDateString({}, { message: 'A valid signature date is required' })
    signatureDate: string;

    // The applicant must agree to the terms of service to submit.
    @IsBoolean()
    @Equals(true, { message: 'You must agree to the terms of service to submit your enrollment' })
    agreedToTerms: boolean;
}
