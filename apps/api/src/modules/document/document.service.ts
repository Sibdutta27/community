import { S3Service } from '@/common/s3/s3.service';
import { DatabaseService } from '@/database/database.service';
import { DocumentType } from '@/generated/prisma/enums';
import {
    BadRequestException,
    Injectable,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
    SINGLE_FILE_TYPES,
    MULTIPLE_FILE_TYPES,
    getDocumentPolicy,
    PRESIGNED_UPLOAD_EXPIRES_IN_SECONDS,
} from './config';

export type PresignUploadInput = Readonly<{
    documentType: DocumentType;
    fileName: string;
    mimeType: string;
    fileSize: number;
}>;

export type ConfirmUploadInput = PresignUploadInput & Readonly<{ key: string }>;

@Injectable()
export class DocumentService {
    private readonly logger = new Logger(DocumentService.name);

    constructor(
        private readonly database: DatabaseService,
        private readonly s3Service: S3Service,
    ) { }

    /**
     * Save a document into database and s3.
     * Handle single type and multiple file type upload in single time
     */
    public async saveEnrollmentDocument(
        enrollmentId: string,
        documentType: DocumentType,
        file: Express.Multer.File,
    ) {

        // Upsert a single document
        if (SINGLE_FILE_TYPES.includes(documentType)) {
            return this.upsertSingleEnrollmentDocumentRecord(enrollmentId, documentType, file);
        }

        // Upsert a multiple document
        if (MULTIPLE_FILE_TYPES.includes(documentType)) {
            return this.insertMultipleEnrollmentDocumentRecord(enrollmentId, documentType, file);
        }

        throw new BadRequestException(`Unsupported document type: ${documentType}`);
    }

    /**
     * Upsert a single document record for the given enrollment and document type.
     * If a record already exists, it will be updated with the new file information.
     * If no record exists, a new one will be created.
     * The file will be uploaded to S3, and if an existing document is being replaced, the old file will be deleted from S3 after the new file is successfully saved in the database.
     * If any error occurs during the process, the newly uploaded file will be deleted from S3 to prevent orphaned files.
     */
    public async upsertSingleEnrollmentDocumentRecord(
        enrollmentId: string,
        documentType: DocumentType,
        file: Express.Multer.File,
    ) {

        // Validate document type and file before proceeding with upload and database operations
        this.ensureSingleType(documentType);
        this.validateFile(file, documentType);

        // Check if a document already exists for the given enrollment and document type
        const existingDocument = await this.database.document.findFirst({
            where: {
                enrollmentId,
                type: documentType,
            },
        });

        // Build a unique file name for the new file to be uploaded to S3
        const fileUname = this.buildSingleFileUname(enrollmentId, documentType);
        const uploaded = await this.s3Service.uploadFile(file, 'documents', fileUname);

        try {
            const savedDocument = await this.database.$transaction(async (tx) => {

                // Update the document if exist
                if (existingDocument) {
                    return await tx.document.update({
                        where: { id: existingDocument.id },
                        data: {
                            fileName: fileUname,
                            fileKey: uploaded.key,
                            fileUrl: uploaded.url,
                            fileSize: uploaded.size,
                            mimeType: uploaded.type,
                        },
                    });
                }

                // Create a new document
                return await tx.document.create({
                    data: {
                        enrollmentId,
                        type: documentType,
                        fileName: fileUname,
                        fileKey: uploaded.key,
                        fileUrl: uploaded.url,
                        fileSize: uploaded.size,
                        mimeType: uploaded.type,
                    },
                });
            });

            // If there was an existing document with a different file, delete the old file from S3 after the new file is successfully saved in the database
            if (existingDocument?.fileKey && existingDocument.fileKey !== uploaded.key) {
                void this.safeDeleteFile(existingDocument.fileKey);
            }

            // Return the saved document information along with a success message indicating whether it was an update or a new upload
            return {
                message: existingDocument ? 'Document updated successfully' : 'Document uploaded successfully',
                document: {
                    id      : savedDocument.id,
                    type    : savedDocument.type,
                    fileName: savedDocument.fileName,
                    fileKey : savedDocument.fileKey,
                    fileSize: savedDocument.fileSize,
                    mimeType: savedDocument.mimeType,
                    url     : await this.s3Service.gets3SignedUrl(savedDocument.fileKey),
                },
            };
        } catch (error) {
            await this.safeDeleteFile(uploaded.key);
            throw error;
        }
    }

    /**
     * Insert multiple document records for the given enrollment and document type.
     */
    public async insertMultipleEnrollmentDocumentRecord(
        enrollmentId: string,
        documentType: DocumentType,
        file: Express.Multer.File,
    ) {

        // Validate document type and file before proceeding with upload and database operations
        this.ensureMultipleType(documentType);
        this.validateFile(file, documentType);

        // Build a unique file name for the new file to be uploaded to S3
        const fileUname = this.buildMultipleFileUname(enrollmentId, documentType);
        const uploaded = await this.s3Service.uploadFile(file, 'documents', fileUname);

        try {
            const document = await this.database.$transaction(async (tx) => {
                return await tx.document.create({
                    data: {
                        enrollmentId,
                        type: documentType,
                        fileName: fileUname,
                        fileKey: uploaded.key,
                        fileUrl: uploaded.url,
                        fileSize: uploaded.size,
                        mimeType: uploaded.type,
                    },
                });
            });

            return {
                message: 'Document uploaded successfully',
                document: {
                    id      : document.id,
                    type    : document.type,
                    fileName: document.fileName,
                    fileKey : document.fileKey,
                    fileSize: document.fileSize,
                    mimeType: document.mimeType,
                    url     : await this.s3Service.gets3SignedUrl(document.fileKey),
                },
            };
        } catch (error) {
            await this.safeDeleteFile(uploaded.key);
            throw error;
        }
    }

    /**
     * Delete a document from database using the document id
     */
    public async deleteDocumentRecord(documentId: string) {
        const existingDocument = await this.database.document.findUnique({
            where: { id: documentId },
        });

        if (!existingDocument) {
            throw new NotFoundException(`Document with ID ${documentId} not found`);
        }

        await this.database.$transaction(async (tx) => {
            await tx.document.delete({
                where: { id: documentId },
            });
        });

        void this.safeDeleteFile(existingDocument.fileKey);

        return {
            message: 'Document deleted successfully',
        };
    }

    /**
     * Save a document into database and s3.
     * Handle single type and multiple file type upload in single time
     */
    public async saveUserDocument(
        userId: string,
        documentType: DocumentType,
        file: Express.Multer.File,
    ) {

        // Upsert a single document
        if (SINGLE_FILE_TYPES.includes(documentType)) {
            return this.upsertSingleUserDocumentRecord(userId, documentType, file);
        }

        // Upsert a multiple document
        if (MULTIPLE_FILE_TYPES.includes(documentType)) {
            return this.insertMultipleUserDocumentRecord(userId, documentType, file);
        }

        throw new BadRequestException(`Unsupported document type: ${documentType}`);
    }

    /**
     * Upsert a single document record for the given user and document type.
     * If a record already exists, it will be updated with the new file information.
     * If no record exists, a new one will be created.
     * The file will be uploaded to S3, and if an existing document is being replaced, the old file will be deleted from S3 after the new file is successfully saved in the database.
     * If any error occurs during the process, the newly uploaded file will be deleted from S3 to prevent orphaned files.
     */
    public async upsertSingleUserDocumentRecord(
        userId: string,
        documentType: DocumentType,
        file: Express.Multer.File,
    ) {

        // Validate document type and file before proceeding with upload and database operations
        this.ensureSingleType(documentType);
        this.validateFile(file, documentType);

        // Check if a document already exists for the given user and document type
        const existingDocument = await this.database.document.findFirst({
            where: {
                userId,
                type: documentType,
            },
        });

        // Build a unique file name for the new file to be uploaded to S3
        const fileUname = this.buildSingleFileUname(userId, documentType);
        const uploaded = await this.s3Service.uploadFile(file, 'documents', fileUname);

        try {
            const savedDocument = await this.database.$transaction(async (tx) => {

                // Update the document if exist
                if (existingDocument) {
                    return await tx.document.update({
                        where: { id: existingDocument.id },
                        data: {
                            fileName: fileUname,
                            fileKey: uploaded.key,
                            fileUrl: uploaded.url,
                            fileSize: uploaded.size,
                            mimeType: uploaded.type,
                        },
                    });
                }

                // Create a new document
                return await tx.document.create({
                    data: {
                        userId,
                        type: documentType,
                        fileName: fileUname,
                        fileKey: uploaded.key,
                        fileUrl: uploaded.url,
                        fileSize: uploaded.size,
                        mimeType: uploaded.type,
                    },
                });
            });

            // If there was an existing document with a different file, delete the old file from S3 after the new file is successfully saved in the database
            if (existingDocument?.fileKey && existingDocument.fileKey !== uploaded.key) {
                void this.safeDeleteFile(existingDocument.fileKey);
            }

            // Return the saved document information along with a success message indicating whether it was an update or a new upload
            return {
                message: existingDocument ? 'Document updated successfully' : 'Document uploaded successfully',
                document: {
                    id      : savedDocument.id,
                    type    : savedDocument.type,
                    fileName: savedDocument.fileName,
                    fileKey : savedDocument.fileKey,
                    fileSize: savedDocument.fileSize,
                    mimeType: savedDocument.mimeType,
                    url     : await this.s3Service.gets3SignedUrl(savedDocument.fileKey),
                },
            };
        } catch (error) {
            await this.safeDeleteFile(uploaded.key);
            throw error;
        }
    }

    /**
     * Insert multiple document records for the given user and document type.
     */
    public async insertMultipleUserDocumentRecord(
        userId: string,
        documentType: DocumentType,
        file: Express.Multer.File,
    ) {

        // Validate document type and file before proceeding with upload and database operations
        this.ensureMultipleType(documentType);
        this.validateFile(file, documentType);

        // Build a unique file name for the new file to be uploaded to S3
        const fileUname = this.buildMultipleFileUname(userId, documentType);
        const uploaded = await this.s3Service.uploadFile(file, 'documents', fileUname);

        try {
            const document = await this.database.$transaction(async (tx) => {
                return await tx.document.create({
                    data: {
                        userId,
                        type: documentType,
                        fileName: fileUname,
                        fileKey: uploaded.key,
                        fileUrl: uploaded.url,
                        fileSize: uploaded.size,
                        mimeType: uploaded.type,
                    },
                });
            });

            return {
                message: 'Document uploaded successfully',
                document: {
                    id      : document.id,
                    type    : document.type,
                    fileName: document.fileName,
                    fileKey : document.fileKey,
                    fileSize: document.fileSize,
                    mimeType: document.mimeType,
                    url     : await this.s3Service.gets3SignedUrl(document.fileKey),
                },
            };
        } catch (error) {
            await this.safeDeleteFile(uploaded.key);
            throw error;
        }
    }

    /**
     * Ensure the document is a single type document
     */
    private ensureSingleType(documentType: DocumentType) {
        if ( ! SINGLE_FILE_TYPES.includes(documentType)) {
            throw new BadRequestException(
                `Document type ${documentType} does not allow single file upload`,
            );
        }
    }

    /**
     * Ensure the document is a multi type document
     */
    private ensureMultipleType(documentType: DocumentType) {
        if (! MULTIPLE_FILE_TYPES.includes(documentType)) {
            throw new BadRequestException(
                `Document type ${documentType} does not allow multiple file upload`,
            );
        }
    }

    /**
     *  Validate the file against the per-slot document policy.
     */
    private validateFile(file: Express.Multer.File, documentType: DocumentType) {
        if (!file) {
            throw new BadRequestException('No file provided for upload');
        }

        this.validateUploadMetadata(documentType, file.mimetype, file.size);
    }

    /**
     * Validate upload metadata (mime type + size) against the per-slot document policy.
     * Shared by the multipart fallback and the presign/confirm flow.
     */
    private validateUploadMetadata(
        documentType: DocumentType,
        mimeType: string,
        fileSize: number,
    ) {
        const policy = getDocumentPolicy(documentType);

        if (!policy.allowedMime.includes(mimeType)) {
            throw new BadRequestException(
                `Invalid file type for ${documentType}: ${mimeType}. Allowed: ${policy.allowedMime.join(', ')}`,
            );
        }

        if (typeof fileSize !== 'number' || fileSize <= 0) {
            throw new BadRequestException('Uploaded file is empty');
        }

        if (fileSize > policy.maxSize) {
            const maxMb = Math.round(policy.maxSize / (1024 * 1024));
            throw new BadRequestException(
                `File size exceeds the ${maxMb} MB limit for ${documentType}`,
            );
        }
    }

    /**
     * Ensure the document type is one of the known enrollment upload slots.
     */
    private ensureEnrollmentSlotType(documentType: DocumentType) {
        if (
            !SINGLE_FILE_TYPES.includes(documentType) &&
            !MULTIPLE_FILE_TYPES.includes(documentType)
        ) {
            throw new BadRequestException(`Unsupported document type: ${documentType}`);
        }
    }

    /**
     * Build the private storage key for a direct (presigned) enrollment upload.
     * Keys are namespaced per enrollment + document type so ownership can be
     * verified on confirm with a simple prefix check.
     */
    private buildEnrollmentUploadKey(
        enrollmentId: string,
        documentType: DocumentType,
        fileName: string,
    ): string {
        const safeFileName =
            fileName
                .trim()
                .replace(/[^A-Za-z0-9._-]+/g, '_')
                .replace(/^_+|_+$/g, '')
                .slice(0, 100) || 'file';

        return `${this.enrollmentUploadKeyPrefix(enrollmentId, documentType)}${randomUUID()}-${safeFileName}`;
    }

    /**
     * The key prefix that every direct upload for this enrollment + slot must live under.
     */
    private enrollmentUploadKeyPrefix(
        enrollmentId: string,
        documentType: DocumentType,
    ): string {
        return `enrollment/${enrollmentId}/${documentType}/`;
    }

    /**
     * Create a presigned PUT URL so the browser can upload the file directly to
     * private storage, bypassing the API body-size limits. Validates the file
     * metadata against the per-slot policy before signing.
     */
    public async createEnrollmentPresignedUpload(
        enrollmentId: string,
        input: PresignUploadInput,
    ) {
        const { documentType, fileName, mimeType, fileSize } = input;

        this.ensureEnrollmentSlotType(documentType);
        this.validateUploadMetadata(documentType, mimeType, fileSize);

        const key = this.buildEnrollmentUploadKey(enrollmentId, documentType, fileName);

        const uploadUrl = await this.s3Service.createPresignedPutUrl(
            key,
            mimeType,
            PRESIGNED_UPLOAD_EXPIRES_IN_SECONDS,
        );

        return {
            uploadUrl,
            key,
            headers: { 'Content-Type': mimeType },
            method: 'PUT' as const,
        };
    }

    /**
     * Record a document that was uploaded directly to storage via a presigned PUT.
     * Verifies the key belongs to this enrollment + slot (prefix check) and
     * re-validates the per-slot policy before writing the Document record.
     */
    public async confirmEnrollmentDocument(
        enrollmentId: string,
        input: ConfirmUploadInput,
    ) {
        const { documentType, key, fileName, mimeType, fileSize } = input;

        this.ensureEnrollmentSlotType(documentType);

        const expectedPrefix = this.enrollmentUploadKeyPrefix(enrollmentId, documentType);
        if (!key.startsWith(expectedPrefix) || key.length <= expectedPrefix.length) {
            throw new BadRequestException(
                'The uploaded file key does not belong to this enrollment document slot',
            );
        }

        this.validateUploadMetadata(documentType, mimeType, fileSize);

        // Single-file slots replace any previous document; multi-file slots append.
        if (SINGLE_FILE_TYPES.includes(documentType)) {
            return this.confirmSingleEnrollmentDocument(enrollmentId, input);
        }

        return this.confirmMultipleEnrollmentDocument(enrollmentId, input);
    }

    /**
     * Upsert the Document record for a confirmed single-file direct upload.
     * The previous storage object (if any) is deleted after the record is saved.
     */
    private async confirmSingleEnrollmentDocument(
        enrollmentId: string,
        { documentType, key, fileName, mimeType, fileSize }: ConfirmUploadInput,
    ) {
        const existingDocument = await this.database.document.findFirst({
            where: {
                enrollmentId,
                type: documentType,
            },
        });

        const data = {
            fileName,
            fileKey: key,
            // The bucket is private — store the key and presign GET URLs on read.
            fileUrl: key,
            fileSize,
            mimeType,
        };

        const savedDocument = await this.database.$transaction(async (tx) => {
            if (existingDocument) {
                return await tx.document.update({
                    where: { id: existingDocument.id },
                    data,
                });
            }

            return await tx.document.create({
                data: {
                    enrollmentId,
                    type: documentType,
                    ...data,
                },
            });
        });

        // Delete the replaced storage object once the new record is saved.
        if (existingDocument?.fileKey && existingDocument.fileKey !== key) {
            void this.safeDeleteFile(existingDocument.fileKey);
        }

        return {
            message: existingDocument
                ? 'Document updated successfully'
                : 'Document uploaded successfully',
            document: {
                id      : savedDocument.id,
                type    : savedDocument.type,
                fileName: savedDocument.fileName,
                fileKey : savedDocument.fileKey,
                fileSize: savedDocument.fileSize,
                mimeType: savedDocument.mimeType,
                url     : await this.s3Service.gets3SignedUrl(savedDocument.fileKey),
            },
        };
    }

    /**
     * Insert the Document record for a confirmed multi-file direct upload.
     */
    private async confirmMultipleEnrollmentDocument(
        enrollmentId: string,
        { documentType, key, fileName, mimeType, fileSize }: ConfirmUploadInput,
    ) {
        const document = await this.database.$transaction(async (tx) => {
            return await tx.document.create({
                data: {
                    enrollmentId,
                    type: documentType,
                    fileName,
                    fileKey: key,
                    // The bucket is private — store the key and presign GET URLs on read.
                    fileUrl: key,
                    fileSize,
                    mimeType,
                },
            });
        });

        return {
            message: 'Document uploaded successfully',
            document: {
                id      : document.id,
                type    : document.type,
                fileName: document.fileName,
                fileKey : document.fileKey,
                fileSize: document.fileSize,
                mimeType: document.mimeType,
                url     : await this.s3Service.gets3SignedUrl(document.fileKey),
            },
        };
    }

    /**
     * Buid a unique file key for single file types to prevent overwriting existing files in S3.
     * The key includes the document type and enrollment ID to ensure uniqueness for each document type per enrollment.
     */
    private buildSingleFileUname(uniqueId: string, documentType: DocumentType): string {
        return `${documentType.toLowerCase()}/${uniqueId}`;
    }

    /**
     * Build a unique file key for multiple file types to prevent overwriting existing files in S3.
     * The key includes the document type, enrollment ID, current timestamp, and a random UUID to ensure uniqueness.
     */
    private buildMultipleFileUname(uniqueId: string, documentType: DocumentType): string {
        return `${documentType.toLocaleLowerCase()}/${uniqueId}/${Date.now()}-${randomUUID()}`;
    }

    /**
     * Delete a file safely from s3.
     */
    private async safeDeleteFile(fileKey?: string | null) {
        if (!fileKey) return;

        try {
            await this.s3Service.deleteFile(fileKey);
        } catch (error) {
            this.logger.warn(`Failed to delete S3 file: ${fileKey}`);
        }
    }

    /**
     * Get all document list group by document types for a given enrollment id.
     */
    public async getAllEnrollmentDocumentList(enrollmentId: string) {

        // Get all enrollment documents
        const documents = await this.database.document.findMany({
            where: {
                enrollmentId: enrollmentId
            },
            orderBy: { uploadedAt: 'desc' }
        })

        // Get all possible document types
        const allTypes: DocumentType[] = [
            ...SINGLE_FILE_TYPES,
            ...MULTIPLE_FILE_TYPES,
        ];


        // Normalize structure (pre-build response)
        const result: Record<string, any> = Object.fromEntries(
            allTypes.map((type) => [
                type,
                {
                    type,
                    isSingle: SINGLE_FILE_TYPES.includes(type),
                    documents: SINGLE_FILE_TYPES.includes(type) ? null : [],
                },
            ]),
        );

        // Fill data
        for (const document of documents) {
            const entry = result[ document.type as DocumentType ];

            // In case DB has unknown type
            if (!entry) continue;

            // Get minimal document
            const minimalDocument = {
                id             : document.id,
                type           : document.type,
                status         : document.status,
                fileName       : document.fileName,
                fileKey        : document.fileKey,
                fileSize       : document.fileSize,
                url            : await this.s3Service.gets3SignedUrl(document.fileKey),
                verifiedByAdmin: document.verifiedByAdmin,
                rejectedReason : document.rejectedReason,
                uploadedAt     : document.uploadedAt,
            }

            // For single file type, only keep the latest one (ordered DESC), for multiple file type, push to array
            if (entry.isSingle) {
                if (!entry.documents) {
                    entry.documents = minimalDocument;
                }
            } else {
                entry.documents.push(minimalDocument);
            }
        }

        return Object.values(result);

    }

    /**
     * Get the document url from s3 using the document id
     */
    public async getDocumentUrl(documentId: string) {
        const document = await this.database.document.findUnique({
            where: { id: documentId },
        });

        if (!document) {
            throw new NotFoundException(`Document with ID ${documentId} not found`);
        }

        return await this.s3Service.gets3SignedUrl(document.fileKey);
    }

    /**
     * Get the public url of the document key from s3 using the document id
     */
    public async getPublicUrl(documentKey: string) {
        return await this.s3Service.gets3SignedPublicUrl(documentKey);
    }
}