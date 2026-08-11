import { Transform } from 'class-transformer';
import { IsISO8601, IsOptional, IsString } from 'class-validator';

/**
 * Query string for GET /admin/event/calendar.
 *
 * The calendar asks for a window (the visible month, padded out to whole
 * weeks) rather than a page — a month grid has to show every event on a day,
 * so paginating it would silently hide the fifth event on a busy Saturday.
 */
export class GetEventCalendarDto {

    /** Inclusive start of the window, ISO-8601. */
    @IsISO8601()
    from: string;

    /** Exclusive end of the window, ISO-8601. */
    @IsISO8601()
    to: string;

    @IsOptional()
    @Transform(({ value }) => (value === '' ? undefined : value))
    @IsString()
    categoryId?: string;
}
