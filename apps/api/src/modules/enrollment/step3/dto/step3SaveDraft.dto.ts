import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import { FatherDto, KinshipPersonDto } from './step3.dto';

/**
 * Step 3 — Paternal Kinship partial draft ("Save & finish later").
 * Every ancestor is optional: only the provided ancestors are upserted, no
 * required-field validation runs, and the step is NOT marked complete.
 */
export class Step3SaveDraftDto {
    @IsOptional()
    @ValidateNested()
    @Type(() => FatherDto)
    father?: FatherDto;

    @IsOptional()
    @ValidateNested()
    @Type(() => KinshipPersonDto)
    paternalGrandmother?: KinshipPersonDto;

    @IsOptional()
    @ValidateNested()
    @Type(() => KinshipPersonDto)
    paternalGrandfather?: KinshipPersonDto;
}
