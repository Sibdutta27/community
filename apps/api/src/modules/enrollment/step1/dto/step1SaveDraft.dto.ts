import {
    IsString,
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
 * Step 1 — Demographics partial draft ("Save & finish later").
 * Every field is optional: only the provided fields are persisted, no
 * required-field validation runs, and the step is NOT marked complete.
 */
export class Step1SaveDraftDto {
    @IsString()
    @IsOptional()
    firstName?: string;

    @IsString()
    @IsOptional()
    lastName?: string;

    @Type(() => Date) // auto convert string → Date
    @IsDate()
    @IsOptional()
    dateOfBirth?: Date;

    @IsString()
    @IsOptional()
    cityOfBirth?: string;

    @IsString()
    @IsOptional()
    municipalityOfBirth?: string;

    @IsString()
    @IsOptional()
    countryOfBirth?: string;

    @IsEnum(Sex)
    @IsOptional()
    sex?: Sex;

    @IsEnum(Gender)
    @IsOptional()
    gender?: Gender;

    // Drafts never hard-require it, but validate the shape whenever provided
    @IsString()
    @IsOptional()
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
    // See step1.dto.ts — superseded spellings must validate here too.
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
