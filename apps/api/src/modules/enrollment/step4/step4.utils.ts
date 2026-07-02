import { DocumentType } from "@/generated/prisma/enums";

// The photo is the one mandatory upload to complete Step 4; the genealogical /
// kinship / oral-history / DNA evidence slots are optional supporting documents.
export const REQUIRED_DOCUMENT_TYPES: DocumentType[] = [
    DocumentType.USER_PHOTO,
]
