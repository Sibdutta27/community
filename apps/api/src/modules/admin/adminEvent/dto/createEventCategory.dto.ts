// dto/createEventCategory.dto.ts

import {
    IsOptional,
    IsString,
    MinLength,
} from 'class-validator';

export class CreateEventCategoryDto {

    @IsString()
    @MinLength(2)
    key: string;

    @IsString()
    @MinLength(2)
    name: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    icon?: string;
}