// dto/createServiceCategory.dto.ts

import {
    IsOptional,
    IsString,
    MinLength,
} from 'class-validator';

export class CreateServiceCategoryDto {

    @IsString()
    @MinLength(2)
    key: string;

    @IsString()
    @MinLength(2)
    name: string;

    @IsOptional()
    @IsString()
    icon?: string;
}