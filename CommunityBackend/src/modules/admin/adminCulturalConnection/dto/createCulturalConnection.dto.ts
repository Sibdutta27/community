// dto/createCulturalConnection.dto.ts

import {
    IsBoolean,
    IsOptional,
    IsString,
} from 'class-validator';

export class CreateCulturalConnectionDto {

    @IsString()
    key: string;

    @IsString()
    description: string;

    @IsOptional()
    @IsBoolean()
    active?: boolean = true;
}