import { Transform, Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

/**
 * Query string for GET /admin/service/:id/registrations.
 *
 * Same pagination contract as the enrollment and event tables (page from 1,
 * limit capped at 100).
 */
export class GetServiceRegistrationsDto {

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
     * Free text over the member's name, email and member ID. Blank means "no
     * filter" — the table sends its empty search box straight through.
     */
    @IsOptional()
    @Transform(({ value }) => (value === '' ? undefined : value))
    @IsString()
    search?: string;
}
