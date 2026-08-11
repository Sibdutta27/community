import { Transform } from 'class-transformer';
import { IsBoolean, IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CompleteEnrollmentDto {
    // Confirmation e-signature: the applicant's full legal name.
    @IsString()
    @IsNotEmpty({ message: 'Signature name is required' })
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    signatureName: string;

    // The date the applicant signed the confirmation (ISO date string).
    @IsDateString({}, { message: 'A valid signature date is required' })
    signatureDate: string;

    /**
     * DEPRECATED and ignored by `completeEnrollment`.
     *
     * Consent is now collected exactly once, at `/enrollment/start`, and is
     * enforced by `ConsentAcceptedGuard` plus the required-consent check inside
     * `completeEnrollment`. The persisted `Enrollment.agreedToTerms` attestation
     * is DERIVED there from a valid e-signature; re-asking for it at step 5 was
     * a duplicate of the already-accepted `accuracy_declaration` /
     * `data_privacy_agreement` consents.
     *
     * Kept optional (rather than removed) so that a browser still running the
     * previous bundle during a deploy does not get a 400 from
     * `forbidNonWhitelisted` on the global ValidationPipe. Safe to delete once
     * no old clients remain.
     */
    @IsOptional()
    @IsBoolean()
    agreedToTerms?: boolean;
}
