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

// Client 2026-07-20 ("ID I think should be mandatory"): a government ID is no
// longer merely one of the three interchangeable proofs — it is required *in
// addition to* the 2-distinct-types minimum. So a valid set is a state ID plus
// at least one of {birth certificate, social security card}.
export const REQUIRED_IDENTITY_DOCUMENT_TYPES: DocumentType[] = [
    DocumentType.STATE_ID,
]

/**
 * The proof-of-identity rejection codes, in the order they are checked. Both
 * are surfaced verbatim to the frontends, which map them to localized copy.
 */
export type MissingIdentityDocumentError =
    | 'missing_state_id'
    | 'missing_identity_documents';

/**
 * getMissingIdentityDocumentError: the reason the uploaded set fails the
 * proof-of-identity rule, or `null` when it passes.
 *
 * The specifically-required types are checked FIRST so a member who uploaded
 * a birth certificate + social security card is told exactly what is missing
 * (`missing_state_id`) rather than the vaguer count-based message.
 */
export function getMissingIdentityDocumentError(
    documents: { type: DocumentType }[],
): MissingIdentityDocumentError | null {
    const distinctIdentityTypes = new Set(
        (documents ?? [])
            .map(doc => doc.type)
            .filter(type => IDENTITY_DOCUMENT_TYPES.includes(type)),
    );

    const hasEveryRequiredType = REQUIRED_IDENTITY_DOCUMENT_TYPES.every(
        requiredType => distinctIdentityTypes.has(requiredType),
    );

    if (!hasEveryRequiredType) {
        return 'missing_state_id';
    }

    if (distinctIdentityTypes.size < MIN_IDENTITY_DOCUMENTS) {
        return 'missing_identity_documents';
    }

    return null;
}

/**
 * hasRequiredIdentityDocuments: true when the uploaded set satisfies the full
 * proof-of-identity rule — every REQUIRED_IDENTITY_DOCUMENT_TYPES entry plus at
 * least MIN_IDENTITY_DOCUMENTS distinct identity document types.
 *
 * Thin wrapper over `getMissingIdentityDocumentError` so any call site that
 * only needs the boolean stays correct without repeating the rule.
 */
export function hasRequiredIdentityDocuments(documents: { type: DocumentType }[]): boolean {
    return getMissingIdentityDocumentError(documents) === null;
}
