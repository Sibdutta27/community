import { DocumentType } from '@/generated/prisma/enums';
import { Type } from 'class-transformer';
import {
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsPositive,
    IsString,
    MaxLength,
} from 'class-validator';

/**
 * Body for POST /document/presign-upload — request a presigned PUT URL
 * for a direct browser -> storage upload.
 */
export class PresignUploadDto {
    @IsEnum(DocumentType)
    documentType: DocumentType;

    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    fileName: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    mimeType: string;

    @Type(() => Number)
    @IsInt()
    @IsPositive()
    fileSize: number;
}

/**
 * Body for POST /document/confirm — record a document that was uploaded
 * directly to storage via a presigned PUT URL.
 */
export class ConfirmUploadDto extends PresignUploadDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(1024)
    key: string;
}
