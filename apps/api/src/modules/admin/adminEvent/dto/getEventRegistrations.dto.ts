import { Transform, Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

/**
 * Query string for GET /admin/event/:id/registrations.
 *
 * Mirrors the enrollment/feedback pagination contract (page from 1, limit
 * capped at 100) so every staff-facing table behaves the same way.
 */
export class GetEventRegistrationsDto {

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number;

    /**
     * Free text over the member's name, email and member ID. The table sends
     * the search box's empty value straight through, so blank means "no
     * filter" rather than "match nothing".
     */
    @IsOptional()
    @Transform(({ value }) => (value === '' ? undefined : value))
    @IsString()
    search?: string;
}
