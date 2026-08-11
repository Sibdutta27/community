import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsBoolean,
    IsDate,
    IsEnum,
    IsIn,
    ValidateIf,
} from 'class-validator';

import { Type } from 'class-transformer';

import { Gender, Identity, MaritalStatus, Sex } from '@/generated/prisma/enums';
import { ACCEPTED_YUCAYEKE_VALUES } from '@/modules/enrollment/common/config/yucayeke.config';

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

    @IsEnum(Sex)
    @IsOptional()
    sex?: Sex;

    @IsEnum(Gender)
    @IsOptional()
    gender?: Gender;

    // Required when gender = SELF_DESCRIBE; validated whenever provided
    @ValidateIf((o) => o.gender === Gender.SELF_DESCRIBE || o.genderSelfDescribe !== undefined)
    @IsString()
    @IsNotEmpty()
    genderSelfDescribe?: string;

    @IsEnum(MaritalStatus)
    @IsOptional()
    maritalStatus?: MaritalStatus;

    @IsString()
    @IsOptional()
    occupation?: string;

    @IsEnum(Identity)
    @IsOptional()
    identity?: Identity;

    // Restricted to the official list (skipped when the member marks it unknown)
    @ValidateIf((o) => !o.yucayekeUnknown && o.yucayeke !== undefined && o.yucayeke !== null && o.yucayeke !== '')
    // Accepts superseded spellings too, so a draft holding an old value does
    // not 400 on save; the service canonicalizes before writing.
    @IsIn([...ACCEPTED_YUCAYEKE_VALUES])
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
