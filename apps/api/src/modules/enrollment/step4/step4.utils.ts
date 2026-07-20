import { DocumentType } from "@/generated/prisma/enums";

// The photo is the one mandatory upload to complete Step 4; the genealogical /
// kinship / oral-history / DNA evidence slots are optional supporting documents.
export const REQUIRED_DOCUMENT_TYPES: DocumentType[] = [
    DocumentType.USER_PHOTO,
]

// Proof-of-identity slots (client 2026-07-08): the member must upload at least
// MIN_IDENTITY_DOCUMENTS distinct types of the three to finish Step 4 / submit.
export const IDENTITY_DOCUMENT_TYPES: DocumentType[] = [
    DocumentType.STATE_ID,
    DocumentType.BIRTH_CERTIFICATE,
    DocumentType.SOCIAL_SECURITY_CARD,
]

export const MIN_IDENTITY_DOCUMENTS = 2;

/**
 * hasRequiredIdentityDocuments: true when at least MIN_IDENTITY_DOCUMENTS
 * distinct identity document types are present.
 */
export function hasRequiredIdentityDocuments(documents: { type: DocumentType }[]): boolean {
    const distinctIdentityTypes = new Set(
        documents
            .map(doc => doc.type)
            .filter(type => IDENTITY_DOCUMENT_TYPES.includes(type)),
    );

    return distinctIdentityTypes.size >= MIN_IDENTITY_DOCUMENTS;
}
