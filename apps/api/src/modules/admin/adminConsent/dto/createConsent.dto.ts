// dto/createConsent.dto.ts

import {
    IsBoolean,
    IsInt,
    IsOptional,
    IsString,
    Min,
} from 'class-validator';

export class CreateConsentDto {

    @IsString()
    key: string;

    @IsInt()
    @Min(1)
    version: number;

    @IsString()
    title: string;

    @IsString()
    content: string;

    @IsOptional()
    @IsBoolean()
    required?: boolean = true;

    @IsOptional()
    @IsBoolean()
    active?: boolean = true;
}