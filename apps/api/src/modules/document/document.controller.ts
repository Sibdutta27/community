import { BadRequestException, Body, Controller, Get, Param, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { DocumentService } from './document.service';
import { ConsentAcceptedGuard } from '@/modules/consent/guards/consentAccepted.guard';
import { JwtAuthGuard } from '@/modules/auth/guards/auth.guard';
import { EnrollmentEditable } from '@/modules/enrollment/common/guards/enrollmentEditable.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentEnrollment } from '@/common/decorators/CurrentEnrollment.decoder';

import { DocumentType } from '@/generated/prisma/enums';
import { ConfirmUploadDto, PresignUploadDto } from './dto/presignUpload.dto';

@Controller('document')
@UseGuards(
    JwtAuthGuard,
    ConsentAcceptedGuard,
    // EnrollmentEditable,
)
export class DocumentController {
    constructor(private readonly documentService: DocumentService) { }

    // ---------------- UPLOAD ----------------
    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadDocument(
        @CurrentEnrollment('id') enrollmentId: string,
        @Body('documentType') documentType: DocumentType,
        @UploadedFile() file: Express.Multer.File,
    ) {

        // Validate the document type
        if (!documentType) {
            throw new BadRequestException('DocumentType are required');
        }

        // Upload the document
        return this.documentService.saveEnrollmentDocument(
            enrollmentId,
            documentType,
            file,
        );
    }

    // ---------------- PRESIGNED DIRECT UPLOAD ----------------

    /**
     * Step 1 of the direct-to-storage flow: validate the file metadata against
     * the per-slot policy and hand the browser a presigned PUT URL.
     */
    @Post('presign-upload')
    async presignUpload(
        @CurrentEnrollment('id') enrollmentId: string,
        @Body() body: PresignUploadDto,
    ) {
        return this.documentService.createEnrollmentPresignedUpload(enrollmentId, body);
    }

    /**
     * Step 2 of the direct-to-storage flow: after the browser PUTs the file to
     * storage, record the Document (ownership + policy re-validated).
     */
    @Post('confirm')
    async confirmUpload(
        @CurrentEnrollment('id') enrollmentId: string,
        @Body() body: ConfirmUploadDto,
    ) {
        return this.documentService.confirmEnrollmentDocument(enrollmentId, body);
    }

    // ---------------- DELETE ----------------
    @Post(':id')
    async deleteDocument(@Param('id') documentId: string) {
        if (!documentId) {
            throw new BadRequestException('Document ID is required');
        }

        return this.documentService.deleteDocumentRecord(documentId);
    }

    // ---------------- GET ALL ----------------
    @Get('list')
    async getAllDocuments( @CurrentEnrollment('id') enrollmentId: string ) {
        if (!enrollmentId) {
            throw new BadRequestException('Enrollment ID is required');
        }

        return this.documentService.getAllEnrollmentDocumentList( enrollmentId );
    }
}
