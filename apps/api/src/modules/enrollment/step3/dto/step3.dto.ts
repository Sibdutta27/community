import {
    IsString,
    IsOptional,
    IsBoolean,
    IsDate,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

// A grandparent kinship person (no date of birth captured).
class KinshipPersonDto {
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

// The father — same shape as a grandparent, plus an optional date of birth.
class FatherDto extends KinshipPersonDto {
    @Type(() => Date)
    @IsDate()
    @IsOptional()
    dateOfBirth?: Date;
}

// ---------- MAIN DTO ----------
export class Step3Dto {
    @ValidateNested()
    @Type(() => FatherDto)
    father: FatherDto;

    @ValidateNested()
    @Type(() => KinshipPersonDto)
    paternalGrandmother: KinshipPersonDto;

    @ValidateNested()
    @Type(() => KinshipPersonDto)
    paternalGrandfather: KinshipPersonDto;
}
