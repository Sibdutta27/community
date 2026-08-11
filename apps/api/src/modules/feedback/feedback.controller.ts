import { Body, Controller, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '@/common/decorators/currentUser.decorator';
import { OptionalJwtAuthGuard } from '@/modules/auth/guards/optionalAuth.guard';
import { CreateFeedbackDto } from './dto/createFeedback.dto';
import { FeedbackService } from './feedback.service';

@Controller('feedback')
export class FeedbackController {
    constructor(private readonly feedbackService: FeedbackService) { }

    // ---------------- SUBMIT ----------------

    /**
     * Record an in-app report or suggestion.
     *
     * Guarded with `OptionalJwtAuthGuard` on purpose: the widget is reachable
     * from the public pages, so a signed-out visitor must be able to submit.
     * When a valid token is present the submission is credited to that member.
     */
    @Post()
    @UseGuards(OptionalJwtAuthGuard)
    @UseInterceptors(FileInterceptor('attachment'))
    async submitFeedback(
        @CurrentUser('id') userId: string | undefined,
        @Body() body: CreateFeedbackDto,
        @UploadedFile() attachment?: Express.Multer.File,
    ) {
        return this.feedbackService.createFeedback(
            userId ?? null,
            body,
            attachment,
        );
    }
}
