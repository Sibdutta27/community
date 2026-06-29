// dto/updateEventCategory.dto.ts

import { EmptyToUndefined } from '@/common/utils/transformar.util';
import {
    IsOptional,
    IsString,
    MinLength,
} from 'class-validator';

export class UpdateEventCategoryDto {

    @IsOptional()
    @EmptyToUndefined()
    @IsString()
    @MinLength(2)
    key?: string;

    @IsOptional()
    @IsString()
    @MinLength(2)
    name?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    icon?: string;
}