import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import {
    FEEDBACK_LOCALE_MAX_LENGTH,
    FEEDBACK_MESSAGE_MAX_LENGTH,
    FEEDBACK_PAGE_URL_MAX_LENGTH,
    FEEDBACK_USER_AGENT_MAX_LENGTH,
} from '../config';

const trim = ({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value;

/**
 * Body for POST /feedback — a member's in-app report or suggestion.
 * Sent as multipart/form-data so an optional screenshot can ride along,
 * which is why every field arrives as a string.
 */
export class CreateFeedbackDto {
    // What the member wrote. The only field they actually have to fill in.
    @Transform(trim)
    @IsString()
    @IsNotEmpty()
    @MaxLength(FEEDBACK_MESSAGE_MAX_LENGTH)
    message: string;

    // The page the widget was opened from, captured automatically.
    @Transform(trim)
    @IsString()
    @IsNotEmpty()
    @MaxLength(FEEDBACK_PAGE_URL_MAX_LENGTH)
    pageUrl: string;

    // UI language at submit time ("en" / "es").
    @Transform(trim)
    @IsString()
    @IsNotEmpty()
    @MaxLength(FEEDBACK_LOCALE_MAX_LENGTH)
    locale: string;

    // Browser user-agent, forwarded by the web BFF (see FeedbackService).
    @IsOptional()
    @Transform(trim)
    @IsString()
    @MaxLength(FEEDBACK_USER_AGENT_MAX_LENGTH)
    userAgent?: string;
}
