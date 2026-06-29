import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { EnrollmentService } from './enrollment.service';
import { JwtAuthGuard } from '@/modules/auth/guards/auth.guard';
import { ActivityGuard } from '@/modules/user/guard/activity.guard';
import { CurrentUser } from '@/common/decorators/currentUser.decorator';
import { ConsentAcceptedGuard } from '../consent/guards/consentAccepted.guard';

@UseGuards(JwtAuthGuard, ActivityGuard)
@Controller('enrollment')
export class EnrollmentController {
    constructor(private enrollmentService: EnrollmentService) { }

    // Start enrollment.
    @Post('start')
    start( @CurrentUser( 'id' ) userId: string ) {
        return this.enrollmentService.startEnrollment( userId );
    }

    // Complete enrollment.
    @Post('complete')
    @UseGuards(ConsentAcceptedGuard)
    complete( @CurrentUser( 'id' ) userId: string ) {
        return this.enrollmentService.completeEnrollment( userId );
    }
}
