// dto/editCulturalConnection.dto.ts

import {
    IsBoolean,
    IsOptional,
    IsString,
} from 'class-validator';

export class EditCulturalConnectionDto {

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsBoolean()
    active?: boolean;
}