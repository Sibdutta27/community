// dto/editServiceCategory.dto.ts

import { EmptyToUndefined } from '@/common/utils/transformar.util';
import {
    IsOptional,
    IsString,
    MinLength,
} from 'class-validator';

export class EditServiceCategoryDto {

    @IsOptional()
    @IsString()
    @MinLength(2)
    name?: string;

    @IsOptional()
    @IsString()
    icon?: string;
}