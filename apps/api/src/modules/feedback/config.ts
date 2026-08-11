const MB = 1024 * 1024;

/**
 * Upload policy for a feedback attachment — deliberately narrower than the
 * enrollment document slots: a tester is sending a screenshot of what they
 * are looking at, not an evidentiary record.
 */
export const FEEDBACK_ATTACHMENT_MIME_TYPES: readonly string[] = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
];

export const FEEDBACK_ATTACHMENT_MAX_SIZE = 10 * MB;

// Storage folder for feedback attachments (same private bucket as documents).
export const FEEDBACK_ATTACHMENT_FOLDER = 'feedback';

// Guard rails on the free-text fields so a runaway paste cannot fill the table.
export const FEEDBACK_MESSAGE_MAX_LENGTH = 4000;
export const FEEDBACK_PAGE_URL_MAX_LENGTH = 2048;
export const FEEDBACK_LOCALE_MAX_LENGTH = 16;
export const FEEDBACK_USER_AGENT_MAX_LENGTH = 512;
