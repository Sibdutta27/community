import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/guards/auth.guard';
import { AdminAuthGuard } from '../guard/adminAuth.guard';
import { AdminFeedbackService } from './adminFeedback.service';
import { GetFeedbackDto } from './dto/getFeedback.dto';
import { UpdateFeedbackStatusDto } from './dto/updateFeedbackStatus.dto';

/**
 * Staff-facing read/triage surface for the in-app feedback widget.
 *
 * The member-facing `POST /feedback` is intentionally open to signed-out
 * visitors; everything here is admin-only.
 */
@Controller('admin/feedback')
@UseGuards(
    JwtAuthGuard,
    AdminAuthGuard
)
export class AdminFeedbackController {
    constructor(
        private readonly adminFeedbackService: AdminFeedbackService,
    ) { }

    /**
     * Get paginated feedback submissions, newest first
     */
    @Get()
    async getFeedback(
        @Query() query: GetFeedbackDto,
    ) {
        return this.adminFeedbackService.getFeedback({
            page: query.page || 1,
            limit: query.limit || 10,
            status: query.status,
        });
    }

    /**
     * Get feedback counts per triage lane
     *
     * Declared before `:feedbackId` so the literal path is not swallowed by
     * the parameter route.
     */
    @Get('status-counts')
    async getStatusCounts() {
        return this.adminFeedbackService.getStatusCounts();
    }

    /**
     * Get a single submission, with a signed URL for its attachment
     */
    @Get(':feedbackId')
    async getFeedbackDetail(
        @Param('feedbackId') feedbackId: string,
    ) {
        return this.adminFeedbackService.getFeedbackDetail(feedbackId);
    }

    /**
     * Move a submission to another triage lane
     */
    @Patch(':feedbackId/status')
    async updateStatus(
        @Param('feedbackId') feedbackId: string,

        @Body()
        body: UpdateFeedbackStatusDto,
    ) {
        return this.adminFeedbackService.updateStatus(
            feedbackId,
            body.status,
        );
    }
}
