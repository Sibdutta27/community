import { DocumentType } from '@/generated/prisma/enums';

const MB = 1024 * 1024;

// Per-slot upload policy: which mime types a document slot accepts and how big the file may be.
export type DocumentPolicy = Readonly<{
    allowedMime: readonly string[];
    maxSize: number;
}>;

const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

const DOCUMENT_MIME_TYPES = ['application/pdf', ...IMAGE_MIME_TYPES] as const;

const ORAL_HISTORY_MIME_TYPES = [
    ...DOCUMENT_MIME_TYPES,
    'audio/mpeg',
    'audio/mp4',
    'audio/wav',
    'audio/x-wav',
    'video/mp4',
    'video/quicktime',
] as const;

// Sensible default for any document type without an explicit policy.
export const DEFAULT_DOCUMENT_POLICY: DocumentPolicy = {
    allowedMime: DOCUMENT_MIME_TYPES,
    maxSize: 10 * MB,
};

// Per-DocumentType upload policies.
export const DOCUMENT_TYPE_POLICIES: Partial<Record<DocumentType, DocumentPolicy>> = {
    [DocumentType.USER_PHOTO]: {
        allowedMime: IMAGE_MIME_TYPES,
        maxSize: 10 * MB,
    },
    [DocumentType.PROFILE_PICTURE]: {
        allowedMime: IMAGE_MIME_TYPES,
        maxSize: 10 * MB,
    },
    [DocumentType.GENEALOGICAL_RECORDS]: {
        allowedMime: DOCUMENT_MIME_TYPES,
        maxSize: 10 * MB,
    },
    [DocumentType.KINSHIP_LETTERS]: {
        allowedMime: DOCUMENT_MIME_TYPES,
        maxSize: 10 * MB,
    },
    [DocumentType.DNA_TESTING]: {
        allowedMime: DOCUMENT_MIME_TYPES,
        maxSize: 10 * MB,
    },
    [DocumentType.ORAL_HISTORY]: {
        allowedMime: ORAL_HISTORY_MIME_TYPES,
        maxSize: 100 * MB,
    },
    [DocumentType.STATE_ID]: {
        allowedMime: DOCUMENT_MIME_TYPES,
        maxSize: 10 * MB,
    },
    [DocumentType.BIRTH_CERTIFICATE]: {
        allowedMime: DOCUMENT_MIME_TYPES,
        maxSize: 10 * MB,
    },
    [DocumentType.SOCIAL_SECURITY_CARD]: {
        allowedMime: DOCUMENT_MIME_TYPES,
        maxSize: 10 * MB,
    },
};

/**
 * Resolve the upload policy (allowed mime types + max size) for a document type.
 * Falls back to the default (pdf/images, 10 MB) for unmapped types.
 */
export function getDocumentPolicy(documentType: DocumentType): DocumentPolicy {
    return DOCUMENT_TYPE_POLICIES[documentType] ?? DEFAULT_DOCUMENT_POLICY;
}

// How long presigned upload/download URLs stay valid (seconds).
export const PRESIGNED_UPLOAD_EXPIRES_IN_SECONDS = 15 * 60;
export const PRESIGNED_DOWNLOAD_EXPIRES_IN_SECONDS = 3600;

// Arrays categorizing document types into single-file.
export const SINGLE_FILE_TYPES: DocumentType[] = [
    DocumentType.PROFILE_PICTURE,

    DocumentType.USER_PHOTO,

    // Proof-of-identity slots — any 2 of 3 are required to finish Step 4
    DocumentType.STATE_ID,
    DocumentType.BIRTH_CERTIFICATE,
    DocumentType.SOCIAL_SECURITY_CARD,
];

// Arrays categorizing document types that can have multiple files.
// These are the Figma "supporting evidence" slots for the kinship / ancestry proof.
export const MULTIPLE_FILE_TYPES: DocumentType[] = [
    DocumentType.GENEALOGICAL_RECORDS,
    DocumentType.KINSHIP_LETTERS,
    DocumentType.ORAL_HISTORY,
    DocumentType.DNA_TESTING,
];
