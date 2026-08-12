import { Type } from 'class-transformer';
import {
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsPositive,
    IsString,
    MaxLength,
} from 'class-validator';

/**
 * Body for POST /admin/content/media/presign.
 *
 * The MIME/size policy is NOT expressed here on purpose: it lives in
 * `content/config.ts` and is applied by the service, so presign and confirm
 * cannot drift apart and the refusal message can explain itself (see the SVG
 * rejection, which is a rule about the design system rather than a type list).
 */
export class PresignMediaDto {

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
 * Body for POST /admin/content/media/confirm — record an image the browser
 * already PUT to the public bucket.
 */
export class ConfirmMediaDto extends PresignMediaDto {

    @IsString()
    @IsNotEmpty()
    @MaxLength(1024)
    key: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    altEn?: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    altEs?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @IsPositive()
    width?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @IsPositive()
    height?: number;
}

/**
 * Alt text for one image, in both languages.
 */
export class UpdateMediaAltDto {

    @IsOptional()
    @IsString()
    @MaxLength(500)
    altEn?: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    altEs?: string;
}

/**
 * Body for PUT /admin/content/slots/:slotKey — which image the slot shows.
 *
 * `slotKey` itself is validated by the service against the registry mirror,
 * not by a decorator, so the error can list the slots that do exist.
 */
export class AssignSlotDto {

    @IsString()
    @IsNotEmpty()
    @MaxLength(64)
    mediaId: string;
}
