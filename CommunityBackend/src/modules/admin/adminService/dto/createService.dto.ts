// dto/createService.dto.ts

import { EmptyToUndefined } from '@/common/utils/transformar.util';
import {
    ActionType,
    ServiceStatus,
} from '@/generated/prisma/enums';

import {
    ArrayNotEmpty,
    IsArray,
    IsBoolean,
    IsEmail,
    IsEnum,
    IsOptional,
    IsString,
    IsUrl,
    MinLength,
} from 'class-validator';

export class CreateServiceDto {

    @IsString()
    @MinLength(2)
    name: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    icon?: string;

    @IsString()
    categoryId: string;

    @IsOptional()
    @IsBoolean()
    isFeatured?: boolean;

    @IsOptional()
    @EmptyToUndefined()
    @IsEnum(ServiceStatus)
    status?: ServiceStatus;

    @IsOptional()
    @IsString()
    location?: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @EmptyToUndefined()
    @IsEnum(ActionType)
    actionType?: ActionType;

    @IsOptional()
    @IsString()
    actionLabel?: string;

    @IsOptional()
    @EmptyToUndefined()
    @IsUrl()
    actionUrl?: string;

    @IsOptional()
    @IsString()
    actionRoute?: string;

    @IsOptional()
    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
    highlights?: string[];
}