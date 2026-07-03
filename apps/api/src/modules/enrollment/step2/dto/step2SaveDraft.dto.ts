import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import { KinshipPersonDto, MotherDto } from './step2.dto';

/**
 * Step 2 — Maternal Kinship partial draft ("Save & finish later").
 * Every ancestor is optional: only the provided ancestors are upserted, no
 * required-field validation runs, and the step is NOT marked complete.
 */
export class Step2SaveDraftDto {
    @IsOptional()
    @ValidateNested()
    @Type(() => MotherDto)
    mother?: MotherDto;

    @IsOptional()
    @ValidateNested()
    @Type(() => KinshipPersonDto)
    maternalGrandmother?: KinshipPersonDto;

    @IsOptional()
    @ValidateNested()
    @Type(() => KinshipPersonDto)
    maternalGrandfather?: KinshipPersonDto;
}
