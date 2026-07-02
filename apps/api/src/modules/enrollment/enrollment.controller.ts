import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { EnrollmentService } from './enrollment.service';
import { JwtAuthGuard } from '@/modules/auth/guards/auth.guard';
import { ActivityGuard } from '@/modules/user/guard/activity.guard';
import { CurrentUser } from '@/common/decorators/currentUser.decorator';
import { ConsentAcceptedGuard } from '../consent/guards/consentAccepted.guard';
import { CompleteEnrollmentDto } from './dto/completeEnrollment.dto';

@UseGuards(JwtAuthGuard, ActivityGuard)
@Controller('enrollment')
export class EnrollmentController {
    constructor(private enrollmentService: EnrollmentService) { }

    // Start enrollment.
    @Post('start')
    start( @CurrentUser( 'id' ) userId: string ) {
        return this.enrollmentService.startEnrollment( userId );
    }

    // Complete enrollment: persists the confirmation e-signature and submits the application.
    @Post('complete')
    @UseGuards(ConsentAcceptedGuard)
    complete(
        @CurrentUser( 'id' ) userId: string,
        @Body() dto: CompleteEnrollmentDto,
    ) {
        return this.enrollmentService.completeEnrollment( userId, dto );
    }
}
