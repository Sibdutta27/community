import { BadRequestException, Body, Controller, Get, Param, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { DocumentService } from './document.service';
import { ConsentAcceptedGuard } from '@/modules/consent/guards/consentAccepted.guard';
import { JwtAuthGuard } from '@/modules/auth/guards/auth.guard';
import { EnrollmentEditable } from '@/modules/enrollment/common/guards/enrollmentEditable.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentEnrollment } from '@/common/decorators/CurrentEnrollment.decoder';

import { DocumentType } from '@/generated/prisma/enums';

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
