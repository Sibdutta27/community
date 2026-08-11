import { DocumentType } from '@/generated/prisma/enums';
import {
    getMissingIdentityDocumentError,
    hasRequiredIdentityDocuments,
    IDENTITY_DOCUMENT_TYPES,
    MIN_IDENTITY_DOCUMENTS,
    REQUIRED_DOCUMENT_TYPES,
    REQUIRED_IDENTITY_DOCUMENT_TYPES,
} from './step4.utils';

function docs(...types: DocumentType[]) {
    return types.map(type => ({ type }));
}

describe('step4.utils — proof-of-identity constants', () => {
    it('keeps the user photo as the only non-identity required upload', () => {
        expect(REQUIRED_DOCUMENT_TYPES).toEqual([DocumentType.USER_PHOTO]);
    });

    it('keeps the three interchangeable identity types', () => {
        expect(IDENTITY_DOCUMENT_TYPES).toEqual([
            DocumentType.STATE_ID,
            DocumentType.BIRTH_CERTIFICATE,
            DocumentType.SOCIAL_SECURITY_CARD,
        ]);
        expect(MIN_IDENTITY_DOCUMENTS).toBe(2);
    });

    it('makes the government ID the mandatory identity type (client 2026-07-20)', () => {
        expect(REQUIRED_IDENTITY_DOCUMENT_TYPES).toEqual([DocumentType.STATE_ID]);
    });

    it('only requires types that are themselves identity types', () => {
        for (const requiredType of REQUIRED_IDENTITY_DOCUMENT_TYPES) {
            expect(IDENTITY_DOCUMENT_TYPES).toContain(requiredType);
        }
    });
});

describe('getMissingIdentityDocumentError — full matrix', () => {
    it('returns missing_state_id for no documents at all', () => {
        expect(getMissingIdentityDocumentError([])).toBe('missing_state_id');
    });

    it('returns missing_state_id when only non-identity documents are present', () => {
        expect(
            getMissingIdentityDocumentError(
                docs(DocumentType.USER_PHOTO, DocumentType.GENEALOGICAL_RECORDS),
            ),
        ).toBe('missing_state_id');
    });

    // The headline regression: this combination passed the old 2-of-3 rule.
    it('rejects birth certificate + social security card with missing_state_id', () => {
        expect(
            getMissingIdentityDocumentError(
                docs(
                    DocumentType.BIRTH_CERTIFICATE,
                    DocumentType.SOCIAL_SECURITY_CARD,
                ),
            ),
        ).toBe('missing_state_id');
    });

    it('rejects a lone birth certificate with missing_state_id', () => {
        expect(
            getMissingIdentityDocumentError(docs(DocumentType.BIRTH_CERTIFICATE)),
        ).toBe('missing_state_id');
    });

    it('rejects a lone social security card with missing_state_id', () => {
        expect(
            getMissingIdentityDocumentError(docs(DocumentType.SOCIAL_SECURITY_CARD)),
        ).toBe('missing_state_id');
    });

    it('prefers the specific missing_state_id over the count-based code', () => {
        // Both rules fail here (no state ID, only one distinct type); the
        // member gets the actionable message.
        expect(
            getMissingIdentityDocumentError(docs(DocumentType.BIRTH_CERTIFICATE)),
        ).not.toBe('missing_identity_documents');
    });

    it('rejects a lone state ID with missing_identity_documents', () => {
        expect(
            getMissingIdentityDocumentError(docs(DocumentType.STATE_ID)),
        ).toBe('missing_identity_documents');
    });

    it('does not count duplicate state ID uploads as a second distinct type', () => {
        expect(
            getMissingIdentityDocumentError(
                docs(DocumentType.STATE_ID, DocumentType.STATE_ID),
            ),
        ).toBe('missing_identity_documents');
    });

    it('accepts state ID + birth certificate', () => {
        expect(
            getMissingIdentityDocumentError(
                docs(DocumentType.STATE_ID, DocumentType.BIRTH_CERTIFICATE),
            ),
        ).toBeNull();
    });

    it('accepts state ID + social security card', () => {
        expect(
            getMissingIdentityDocumentError(
                docs(DocumentType.STATE_ID, DocumentType.SOCIAL_SECURITY_CARD),
            ),
        ).toBeNull();
    });

    it('accepts all three identity documents', () => {
        expect(
            getMissingIdentityDocumentError(
                docs(
                    DocumentType.STATE_ID,
                    DocumentType.BIRTH_CERTIFICATE,
                    DocumentType.SOCIAL_SECURITY_CARD,
                ),
            ),
        ).toBeNull();
    });

    it('ignores unrelated document types when counting', () => {
        expect(
            getMissingIdentityDocumentError(
                docs(
                    DocumentType.USER_PHOTO,
                    DocumentType.ORAL_HISTORY,
                    DocumentType.STATE_ID,
                    DocumentType.BIRTH_CERTIFICATE,
                ),
            ),
        ).toBeNull();
    });

    it('tolerates a null/undefined document list', () => {
        expect(
            getMissingIdentityDocumentError(null as never),
        ).toBe('missing_state_id');
        expect(
            getMissingIdentityDocumentError(undefined as never),
        ).toBe('missing_state_id');
    });
});

describe('hasRequiredIdentityDocuments — boolean wrapper', () => {
    it.each([
        [[], false],
        [[DocumentType.STATE_ID], false],
        [[DocumentType.BIRTH_CERTIFICATE, DocumentType.SOCIAL_SECURITY_CARD], false],
        [[DocumentType.STATE_ID, DocumentType.BIRTH_CERTIFICATE], true],
        [[DocumentType.STATE_ID, DocumentType.SOCIAL_SECURITY_CARD], true],
        [
            [
                DocumentType.STATE_ID,
                DocumentType.BIRTH_CERTIFICATE,
                DocumentType.SOCIAL_SECURITY_CARD,
            ],
            true,
        ],
    ] as [DocumentType[], boolean][])('%p -> %p', (types, expected) => {
        expect(hasRequiredIdentityDocuments(docs(...types))).toBe(expected);
    });

    it('agrees with getMissingIdentityDocumentError on every combination', () => {
        const combinations: DocumentType[][] = [
            [],
            [DocumentType.STATE_ID],
            [DocumentType.BIRTH_CERTIFICATE],
            [DocumentType.SOCIAL_SECURITY_CARD],
            [DocumentType.STATE_ID, DocumentType.BIRTH_CERTIFICATE],
            [DocumentType.STATE_ID, DocumentType.SOCIAL_SECURITY_CARD],
            [DocumentType.BIRTH_CERTIFICATE, DocumentType.SOCIAL_SECURITY_CARD],
            [
                DocumentType.STATE_ID,
                DocumentType.BIRTH_CERTIFICATE,
                DocumentType.SOCIAL_SECURITY_CARD,
            ],
        ];

        for (const types of combinations) {
            expect(hasRequiredIdentityDocuments(docs(...types))).toBe(
                getMissingIdentityDocumentError(docs(...types)) === null,
            );
        }
    });
});
