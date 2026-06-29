// dto/updateEvent.dto.ts

import {
    IsBoolean,
    IsDateString,
    IsEnum,
    IsInt,
    IsOptional,
    IsString,
    IsUrl,
    Min,
    MinLength,
} from 'class-validator';

import { Type } from 'class-transformer';

import { LocationType }
    from '@/generated/prisma/enums';

import { EmptyToUndefined } from '@/common/utils/transformar.util';

export class UpdateEventDto {

    @IsOptional()
    @IsString()
    @MinLength(2)
    title?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @EmptyToUndefined()
    @IsString()
    categoryId?: string;

    @IsOptional()
    @EmptyToUndefined()
    @IsDateString()
    startDateTime?: string;

    @IsOptional()
    @EmptyToUndefined()
    @IsDateString()
    endDateTime?: string;

    @IsOptional()
    @EmptyToUndefined()
    @IsEnum(LocationType)
    locationType?: LocationType;

    @IsOptional()
    @IsString()
    location?: string;

    @IsOptional()
    @EmptyToUndefined()
    @IsUrl()
    meetingUrl?: string;

    @IsOptional()
    @EmptyToUndefined()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    maxCapacity?: number;

    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    isFeatured?: boolean;

    @IsOptional()
    @EmptyToUndefined()
    @IsUrl()
    externalUrl?: string;
}