import { Body, Controller, Get, Param, ParseEnumPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/guards/auth.guard';
import { AdminEnrollmentService } from './adminEnrollment.service';
import { AdminAuthGuard } from '../guard/adminAuth.guard';
import { AncestryRelation, EnrollmentStatus } from '@/generated/prisma/enums';
import { CurrentUser } from '@/common/decorators/currentUser.decorator';
import { AdminEnrollmentStep4Service } from './services/adminEnrollmentStep4.service';
import { AdminEnrollmentStep3Service } from './services/adminEnrollmentStep3.service';
import { AdminEnrollmentStep2Service } from './services/adminEnrollmentStep2.service';
import { AdminEnrollmentStep1Service } from './services/adminEnrollmentStep1.service';
import { VerifyDocumentDto } from './dto/verifyDocument.dto';
import { VerifyEnrollmentDto } from './dto/verifyEnrollment.dto';
import { VerifyAncestryDto } from './dto/verifyAncestry.dto';


@Controller('admin/enrollment')
@UseGuards(
    JwtAuthGuard,
    AdminAuthGuard
)
export class AdminEnrollmentController {
    constructor(
        private readonly adminEnrollmentService: AdminEnrollmentService,
        private readonly adminEnrollmentStep1Service: AdminEnrollmentStep1Service,
        private readonly adminEnrollmentStep2Service: AdminEnrollmentStep2Service,
        private readonly adminEnrollmentStep3Service: AdminEnrollmentStep3Service,
        private readonly adminEnrollmentStep4Service: AdminEnrollmentStep4Service,
    ) { }

    /**
     * Get all enrollments
     */
    @Get()
    async getEnrollments(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('status') status?: EnrollmentStatus,
        @Query('search') search?: string,
    ) {
        return this.adminEnrollmentService.getEnrollments({
            page: Number(page) || 1,
            limit: Number(limit) || 10,
            status,
            search,
        });
    }

    /**
     * Get all submitted enrollments
     */
    @Get('submitted')
    async getSubmittedEnrollments(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('search') search?: string,
    ) {
        return this.adminEnrollmentService.getEnrollments({
            page: Number(page) || 1,
            limit: Number(limit) || 10,
            status: EnrollmentStatus.SUBMITTED,
            search,
        });
    }

    /**
     * Get all approved enrollments
     */
    @Get('approved')
    async getApprovedEnrollments(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('search') search?: string,
    ) {
        return this.adminEnrollmentService.getEnrollments({
            page: Number(page) || 1,
            limit: Number(limit) || 10,
            status: EnrollmentStatus.APPROVED,
            search,
        });
    }

    /**
     * Get all rejected enrollments
     */
    @Get('rejected')
    async getRejectedEnrollments(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('search') search?: string,
    ) {
        return this.adminEnrollmentService.getEnrollments({
            page: Number(page) || 1,
            limit: Number(limit) || 10,
            status: EnrollmentStatus.REJECTED,
            search,
        });
    }

    /**
    * Get enrollment status counts
    */
    @Get('status-counts')
    async getStatusCounts() {
        return this.adminEnrollmentService.getStatusCounts();
    }

    /**
     * Get enrollment step 1 data
     */
    @Get('/step-1/:enrollmentId')
    async getStep1(
        @Param('enrollmentId') enrollmentId: string,
    ) {
        return this.adminEnrollmentStep1Service.getStep1(enrollmentId);
    }

    /**
     * Get enrollment step 2 data
     */
    @Get('/step-2/:enrollmentId')
    async getStep2(
        @Param('enrollmentId') enrollmentId: string,
    ) {
        return this.adminEnrollmentStep2Service.getStep2(enrollmentId);
    }

    /**
     * Get enrollment step 3 data
     */
    @Get('/step-3/:enrollmentId')
    async getStep3(
        @Param('enrollmentId') enrollmentId: string,
    ) {
        return this.adminEnrollmentStep3Service.getStep3(enrollmentId);
    }

    /**
     * Get enrollment step 4 data
     */
    @Get('/step-4/:enrollmentId')
    async getStep4(
        @Param('enrollmentId') enrollmentId: string,
    ) {
        return this.adminEnrollmentStep4Service.getStep4(enrollmentId);
    }

    /**
     * Get the consent acceptance summary for an enrollment
     */
    @Get('consents/:enrollmentId')
    async getConsents(
        @Param('enrollmentId') enrollmentId: string,
    ) {
        return this.adminEnrollmentService.getConsents(enrollmentId);
    }

    /**
     * Set the admin-attested verification status of an ancestry entry
     */
    @Patch('/:enrollmentId/ancestry/:relation/verification')
    async verifyAncestry(
        @Param('enrollmentId') enrollmentId: string,

        @Param('relation', new ParseEnumPipe(AncestryRelation))
        relation: AncestryRelation,

        @Body()
        body: VerifyAncestryDto,

        @CurrentUser('id') adminUserId: string,
    ) {
        return this.adminEnrollmentService.verifyAncestry(
            enrollmentId,
            relation,
            body.status,
            adminUserId,
        );
    }

    /**
     * Verify document
     */
    @Patch('documents/:documentId/verify')
    async verifyDocument(
        @Param('documentId') documentId: string,

        @Body()
        body: VerifyDocumentDto,
    ) {
        return this.adminEnrollmentStep4Service.varifyDocument(
            documentId,
            body.isApproved,
        );
    }

    /**
     * The member's registered communication channels, for the decision dialog
     */
    @Get('/:enrollmentId/notification-channels')
    async getNotificationChannels(
        @Param('enrollmentId') enrollmentId: string,
    ) {
        return this.adminEnrollmentService.getNotificationChannels(enrollmentId);
    }

    /**
     * Verify document
     */
    @Patch('/:enrollmentId/verify')
    async verifyEnrollment(
        @Param('enrollmentId') enrollmentId: string,

        @Body()
        body: VerifyEnrollmentDto,

        @CurrentUser() user?: { id: string },
    ) {
        if ( body.isApproved ) {
            return this.adminEnrollmentService.approveEnrollment( enrollmentId );
        }

        return this.adminEnrollmentService.rejectEnrollment(
            enrollmentId,
            {
                reason     : body.reason,
                channels   : body.channels,
                decidedById: user?.id,
            },
        );
    }
}
