/**
 * Dto for accepting a consent. This will be used when the user accepts a consent in the consent banner. It will contain the key and version of the consent that the user has accepted.
 */

import { IsArray, ArrayNotEmpty, IsUUID, IsBoolean, IsOptional } from 'class-validator';

export class AcceptConsentDto {
    @IsOptional()
    @IsArray()
    @ArrayNotEmpty()
    @IsUUID('all', { each: true })
    consentItemIds?: string[];

    @IsOptional()
    @IsBoolean()
    acceptAll?: boolean;

    @IsOptional()
    @IsBoolean()
    acceptRequired?: boolean;
}