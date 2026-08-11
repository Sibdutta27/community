/**
 * Feedback attachment policy — kept in step with the API's
 * `apps/api/src/modules/feedback/config.ts`. Validating in the browser and in
 * the BFF is a courtesy (a friendly message instead of a round trip); the
 * backend remains the authority.
 */
export const FEEDBACK_ATTACHMENT_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
] as const;

export const FEEDBACK_ATTACHMENT_MAX_SIZE = 10 * 1024 * 1024;

/** `accept` attribute for the file input. */
export const FEEDBACK_ATTACHMENT_ACCEPT =
  FEEDBACK_ATTACHMENT_MIME_TYPES.join(",");

export const FEEDBACK_MESSAGE_MAX_LENGTH = 4000;

export function isAllowedFeedbackAttachmentType(mimeType: string) {
  return (FEEDBACK_ATTACHMENT_MIME_TYPES as readonly string[]).includes(
    mimeType,
  );
}
