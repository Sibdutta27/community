import {
    IsString,
    IsOptional,
    IsBoolean,
    IsDate,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

// A grandparent kinship person (no date of birth captured).
export class KinshipPersonDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    nationality?: string;

    @IsString()
    @IsOptional()
    municipality?: string;

    @IsString()
    @IsOptional()
    yucayeke?: string;

    @IsBoolean()
    @IsOptional()
    isBorikuaTaino?: boolean;
}

// The mother — same shape as a grandparent, plus an optional date of birth.
export class MotherDto extends KinshipPersonDto {
    @Type(() => Date)
    @IsDate()
    @IsOptional()
    dateOfBirth?: Date;
}

// ---------- MAIN DTO ----------
export class Step2Dto {
    @ValidateNested()
    @Type(() => MotherDto)
    mother: MotherDto;

    @ValidateNested()
    @Type(() => KinshipPersonDto)
    maternalGrandmother: KinshipPersonDto;

    @ValidateNested()
    @Type(() => KinshipPersonDto)
    maternalGrandfather: KinshipPersonDto;
}
