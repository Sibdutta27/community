import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsBoolean,
    IsDate,
    IsEnum,
} from 'class-validator';

import { Type } from 'class-transformer';

import { Identity } from '@/generated/prisma/enums';

/**
 * Step 1 — Demographics (flat).
 * Matches the Brittany Gene Figma demographics form. Only these columns are
 * persisted on the Enrollment row; contact / address / emergency-contact were
 * removed from the flow.
 */
export class Step1Dto {
    @IsString()
    @IsNotEmpty()
    firstName: string;

    @IsString()
    @IsNotEmpty()
    lastName: string;

    @Type(() => Date) // auto convert string → Date
    @IsDate()
    dateOfBirth: Date;

    @IsString()
    @IsNotEmpty()
    cityOfBirth: string;

    @IsString()
    @IsNotEmpty()
    municipalityOfBirth: string;

    @IsString()
    @IsNotEmpty()
    countryOfBirth: string;

    @IsString()
    @IsOptional()
    sex?: string;

    @IsString()
    @IsOptional()
    gender?: string;

    @IsString()
    @IsOptional()
    maritalStatus?: string;

    @IsString()
    @IsOptional()
    occupation?: string;

    @IsEnum(Identity)
    @IsOptional()
    identity?: Identity;

    @IsString()
    @IsOptional()
    yucayeke?: string;

    @IsBoolean()
    @IsOptional()
    yucayekeUnknown?: boolean;

    @IsBoolean()
    @IsOptional()
    hasChildren?: boolean;

    @IsBoolean()
    @IsOptional()
    hasMinorChildren?: boolean;
}
