import { DocumentType } from '@/generated/prisma/enums';

// This file defines configuration constants and enums related to document handling in the application.
export const DOCUMENT_CONFIG = {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10 MB
    ALLOWED_MIME_TYPES: new Set([
        'image/jpeg',
        'image/png',
        'image/webp',
        'application/pdf',
    ]),
};

// Arrays categorizing document types into single-file.
export const SINGLE_FILE_TYPES: DocumentType[] = [
    DocumentType.PROFILE_PICTURE,

    DocumentType.USER_PHOTO,
];

// Arrays categorizing document types that can have multiple files.
// These are the Figma "supporting evidence" slots for the kinship / ancestry proof.
export const MULTIPLE_FILE_TYPES: DocumentType[] = [
    DocumentType.GENEALOGICAL_RECORDS,
    DocumentType.KINSHIP_LETTERS,
    DocumentType.ORAL_HISTORY,
    DocumentType.DNA_TESTING,
];