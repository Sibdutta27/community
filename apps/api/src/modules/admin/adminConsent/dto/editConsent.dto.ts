// dto/editConsent.dto.ts

import {
    IsBoolean,
    IsOptional,
    IsString,
} from 'class-validator';

export class EditConsentDto {

    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    content?: string;

    @IsOptional()
    @IsBoolean()
    required?: boolean;

    @IsOptional()
    @IsBoolean()
    active?: boolean;
}