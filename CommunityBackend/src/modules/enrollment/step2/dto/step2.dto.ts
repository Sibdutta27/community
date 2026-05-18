import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsEnum,
    IsArray,
    ValidateNested,
    IsInt,
    Min,
    IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';
import { LivingStatus, RelationType } from '@/generated/prisma/enums';


// ---------- SINGLE ENTRY DTO ----------
class MaternalLineageItemDto {
    @IsOptional()
    id: string; // This will be used for updates. For new entries, it can be left undefined.

    @IsEnum(RelationType)
    relation: RelationType;

    @IsString()
    @IsNotEmpty()
    fullName: string;

    @IsString()
    @IsOptional()
    maidenName?: string;

    @Type(() => Date)   // auto convert string → Date
    @IsDate()           // validate it's a valid Date
    @IsOptional()
    dateOfBirth?: Date;

    @IsString()
    @IsOptional()
    placeOfBirth?: string;

    @IsEnum(LivingStatus)
    livingStatus: LivingStatus;

    @IsInt()
    @Min(1800)
    @IsOptional()
    approximateBirthYear?: number;

    @IsString()
    @IsOptional()
    regionOfOrigin?: string;

    @IsString()
    @IsOptional()
    familyOccupation?: string;

    @IsString()
    @IsOptional()
    additionalNotes?: string;
}

// ---------- MAIN DTO ----------
export class Step2Dto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => MaternalLineageItemDto)
    maternalLineages: MaternalLineageItemDto[];
}