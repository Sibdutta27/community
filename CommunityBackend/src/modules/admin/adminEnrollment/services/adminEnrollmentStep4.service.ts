import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from '@/database/database.service';
import { DocumentService } from '@/modules/document/document.service';

@Injectable()
export class AdminEnrollmentStep4Service {

    constructor(
        private readonly database: DatabaseService,
        private readonly documentService: DocumentService,
    ) { }

    /**
     * Get all step4 data ( documents )
     */
    public async getStep4(enrollmentId: string) {
        return await this.documentService.getAllEnrollmentDocumentList(enrollmentId);
    }

    /**
     * Varify a documebnt
     */
    public async varifyDocument(documentId: string, isApproved: boolean) {

        const document = await this.database.document.findUnique({
            where: { id: documentId },
            include: {
                enrollment: true,
            },
        });

        if (!document) {
            throw new BadRequestException('Document not found');
        }

        await this.database.document.update({
            where: { id: documentId },
            data: {
                verifiedByAdmin: isApproved,
            },
        });
    }
}
