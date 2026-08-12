// dto/saveTerritoryOverride.dto.ts

import {
    ArrayMaxSize,
    IsArray,
    IsIn,
    IsOptional,
    IsString,
    MaxLength,
} from 'class-validator';

import { TERRITORY_STATUSES } from '../territory.catalog';

/**
 * An override for one yucayeke territory.
 *
 * Only the five editable fields are declared. The global ValidationPipe runs
 * with `forbidNonWhitelisted`, so a payload carrying `slug`, `geometryKey`,
 * `apiNames` or `legacyNames` is rejected outright rather than quietly ignored
 * — those are the join keys that let a recorded `Enrollment.yucayeke` value
 * still find its territory, and they are not editorial.
 *
 * `status` is validated here AND in the service: hiding the third value in the
 * UI is not a control, and an unknown status throws a missing-message error out
 * of next-intl on the public page rather than merely looking wrong.
 */
export class SaveTerritoryOverrideDto {

    @IsOptional()
    @IsString()
    @MaxLength(120)
    displayName?: string;

    @IsOptional()
    @IsString()
    @MaxLength(120)
    cacique?: string;

    /** Rendered publicly as "Also known as". */
    @IsOptional()
    @IsArray()
    @ArrayMaxSize(20)
    @IsString({ each: true })
    @MaxLength(120, { each: true })
    altNames?: string[];

    @IsOptional()
    @IsArray()
    @ArrayMaxSize(30)
    @IsString({ each: true })
    @MaxLength(120, { each: true })
    municipalities?: string[];

    @IsOptional()
    @IsIn(TERRITORY_STATUSES)
    status?: string;
}
