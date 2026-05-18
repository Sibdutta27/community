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
    DocumentType.BIRTH_CERTIFICATE,
];

// Arrays categorizing document types that can have multiple files.
export const MULTIPLE_FILE_TYPES: DocumentType[] = [
    DocumentType.ADDITIONAL_EVIDENCE,
    DocumentType.FAMILY_PHOTO,
    DocumentType.FAMILY_RECORD,
];